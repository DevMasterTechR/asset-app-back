import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreatePersonDto } from '../people/dto/create-person.dto';
import { handlePrismaError } from '../common/utils/prisma-error.util';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(dto: CreatePersonDto) {
        try {
            const hashedPassword = await bcrypt.hash(dto.password, 10);
            const user = await this.prisma.person.create({
                data: { ...dto, password: hashedPassword },
            });

            const { password, ...safeUser } = user;
            return { message: 'Usuario registrado', user: safeUser };
        } catch (error) {
            handlePrismaError(error, 'Usuario');
        }
    }

    async validateUser(username: string, password: string) {
        const user = await this.prisma.person.findUnique({
            where: { username },
            include: { role: true },
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
        const payload = { username: user.username, sub: user.id, role: user.role?.name, };
        const access_token = this.jwtService.sign(payload);

        await this.prisma.person.update({
            where: { id: user.id },
            data: {
                currentToken: access_token,
                lastActivityAt: new Date(),
            },
        });

        return {
            access_token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        };
    }

    async logout(userId: number) {
        await this.prisma.person.update({
            where: { id: userId },
            data: {
                currentToken: null,
                lastActivityAt: null,
            },
        });
    }
    async changePassword(userId: number, dto: ChangePasswordDto) {
        const user = await this.prisma.person.findUnique({
            where: { id: userId },
        });

        if (!user || !user.password) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Contraseña actual incorrecta');
        }

        const hashed = await bcrypt.hash(dto.newPassword, 10);

        await this.prisma.person.update({
            where: { id: userId },
            data: {
                password: hashed,
                mustChangePassword: false,
            },
        });

        return { message: 'Contraseña actualizada con éxito' };
    }
    async forceChangePassword(userId: number, newPassword: string) {
        const user = await this.prisma.person.findUnique({
            where: { id: userId },
        });

        if (!user || !user.mustChangePassword) {
            throw new BadRequestException('No se requiere cambio de contraseña');
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await this.prisma.person.update({
            where: { id: userId },
            data: {
                password: hashed,
                mustChangePassword: false,
            },
        });

        return { message: 'Contraseña actualizada correctamente' };
    }
    async resetPasswordToUsername(userId: number) {
        const user = await this.prisma.person.findUnique({
            where: { id: Number(userId) },
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        if (!user || !user.username) {
            throw new NotFoundException('Usuario no encontrado o sin nombre de usuario');
        }
        const hashedPassword = await bcrypt.hash(user.username, 10);

        await this.prisma.person.update({
            where: { id: Number(userId) },
            data: {
                password: hashedPassword,
                mustChangePassword: true,
            },
        });

        return {
            message: `Contraseña restablecida. El usuario deberá usar su nombre de usuario como contraseña y cambiarla al iniciar sesión.`,
        };
    }
}
