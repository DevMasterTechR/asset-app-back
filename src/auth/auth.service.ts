import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreatePersonDto } from '../people/dto/create-person.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util'; // Ajusta la ruta si es necesario

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreatePersonDto) {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = await this.prisma.person.create({
        data: { ...dto, password: hashedPassword },
      });

      const { password, ...safeUser } = user;
      return { message: 'Usuario registrado', user: safeUser };
    } catch (error) {
      // Usamos la función para manejar errores de Prisma
      handlePrismaError(error, 'Usuario');
    }
  }

  async validateUser(username: string, password: string) {
    const user = await this.prisma.person.findUnique({
      where: { username },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }
}
