import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonDto } from '../people/dto/create-person.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: CreatePersonDto) {
    try {
      const password = await this.hash(dto.password);
      const user = await this.prisma.person.create({ data: { ...dto, password } });
      const { password: _, ...safe } = user;
      return { message: 'Usuario registrado', user: safe };
    } catch (e) {
      handlePrismaError(e, 'Usuario');
    }
  }

  async validateUser(username: string, password: string) {
    const user = await this.prisma.person.findUnique({ where: { username }, include: { role: true } });
    if (!user?.password || !(await this.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    return user;
  }

  async login(user: any) {
    const access_token = this.jwt.sign({ username: user.username, sub: user.id, role: user.role?.name });
    // Stateless mode: do not persist token or last activity in DB
    return { access_token, user: { id: user.id, username: user.username, role: user.role } };
  }

  logout(userId: number) {
    // Stateless: clearing DB session is not required. Keep API for compatibility.
    return { message: 'Logged out' } as any;
  }


async changePassword(userId: number, dto: ChangePasswordDto) {
  const user = await this.findUserOrThrow(userId);

  if (!user.password) {
    throw new NotFoundException('El usuario no tiene contraseña registrada');
  }

  if (!(await this.compare(dto.currentPassword, user.password))) {
    throw new UnauthorizedException('Contraseña actual incorrecta');
  }

  return this.updatePassword(userId, dto.newPassword, false, 'Contraseña actualizada con éxito');
}


  async forceChangePassword(userId: number, newPassword: string) {
    const user = await this.findUserOrThrow(userId);
    if (!user.mustChangePassword) throw new BadRequestException('No se requiere cambio de contraseña');
    return this.updatePassword(userId, newPassword, false, 'Contraseña actualizada correctamente');
  }

  async resetPasswordToUsername(userId: number) {
    const user = await this.findUserOrThrow(userId);
    if (!user.username) throw new NotFoundException('Usuario sin nombre de usuario');
    return this.updatePassword(userId, user.username, true, 'Contraseña restablecida al nombre de usuario');
  }

  private async hash(text: string) {
    return bcrypt.hash(text, 10);
  }

  private async compare(plain: string, hashed: string) {
    return bcrypt.compare(plain, hashed);
  }

  private async findUserOrThrow(id: number) {
    const user = await this.prisma.person.findUnique({ where: { id } });
    if (!user?.password) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  private async updatePassword(id: number, newPassword: string, mustChange: boolean, message: string) {
    const hashed = await this.hash(newPassword);
    await this.prisma.person.update({ where: { id }, data: { password: hashed, mustChangePassword: mustChange } });
    return { message };
  }
}
