import {
    Controller,
    Post,
    Body,
    Res,
    HttpCode,
    HttpStatus,
    Req,
    UnauthorizedException,
    UseGuards,
    Get,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

import { JwtService } from '@nestjs/jwt';
import {
    ApiTags,
    ApiOperation,
    ApiBody,
    ApiBadRequestResponse,
    ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SessionGuard } from './guards/session.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login de usuario' })
    @ApiBody({ type: LoginDto })
    @ApiOkResponse({ description: 'Login exitoso' })
    @ApiBadRequestResponse({ description: 'Credenciales inválidas' })
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.validateUser(body.username, body.password);
        const token = await this.authService.login(user);

        res.cookie('jwt', token.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 5 * 60 * 1000, // 5 minutos
        });

        return { message: 'Login exitoso' };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard, SessionGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cerrar sesión' })
    @ApiOkResponse({ description: 'Sesión cerrada exitosamente' })
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const user = req.user as { sub: number };
        if (!user?.sub) throw new UnauthorizedException('Usuario no autenticado');

        await this.authService.logout(user.sub);
        res.clearCookie('jwt');

        return { message: 'Sesión cerrada' };
    }

    @UseGuards(JwtAuthGuard, SessionGuard)
    @Get('me')
    async me(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const user = req.user as { sub: number };
        if (!user?.sub) throw new UnauthorizedException('Usuario no autenticado');

        // 🔄 Renovar cookie
        const token = await this.authService.login({ id: user.sub }); // asume que login() puede tomar un user ID
        res.cookie('jwt', token.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 5 * 60 * 1000, // 5 minutos más desde ahora
        });

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
