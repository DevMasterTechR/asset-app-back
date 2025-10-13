// src/auth/services/auth-handler.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { setAuthCookie, clearAuthCookie } from '../utils/auth-cookie.helper';
import { LoginDto } from '../dto/login.dto';
import { Response, Request } from 'express';

@Injectable()
export class AuthHandlerService {
    constructor(
        private readonly authService: AuthService,
        private readonly prisma: PrismaService,
    ) {}

    async handleLogin(loginDto: LoginDto, res: Response) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        const token = await this.authService.login(user);

        setAuthCookie(res, token.access_token);
        return { message: 'Login exitoso' };
    }

    async handleLogout(req: Request, res: Response) {
        const user = req.user as { sub: number };
        if (!user?.sub) throw new UnauthorizedException('Usuario no autenticado');

        await this.authService.logout(user.sub);
        clearAuthCookie(res);
        return { message: 'Sesión cerrada' };
    }

    async handleMe(req: Request, res: Response) {
        const user = req.user as { sub: number };
        if (!user?.sub) throw new UnauthorizedException('Usuario no autenticado');

        const token = await this.authService.login({ id: user.sub });
        setAuthCookie(res, token.access_token);

        const userData = await this.prisma.person.findUnique({
            where: { id: user.sub },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                nationalId: true,
                status: true,
                departmentId: true,
                roleId: true,
                branchId: true,
            },
        });

        return userData;
    }
}
