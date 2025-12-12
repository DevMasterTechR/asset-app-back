import {
    Controller,
    Post,
    Body,
    Res,
    HttpCode,
    HttpStatus,
    Req,
    UseGuards,
    Get,
    Header,
    Patch,
    Param,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LoginDto } from './dto/login.dto';
import {
    ApiTags,
    ApiOperation,
    ApiBody,
    ApiBadRequestResponse,
    ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthHandlerService } from './services/auth-handler.service';
import { setAuthCookie } from './utils/auth-cookie.helper';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthService } from './auth.service';
import { ForceChangePasswordDto } from './dto/force-change-password.dto';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';
import {Authenticated} from 'src/common/decorators/authenticated.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authHandler: AuthHandlerService,private readonly authService: AuthService, private readonly prisma: PrismaService) {}
    

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login de usuario' })
    @ApiBody({ type: LoginDto })
    @ApiOkResponse({ description: 'Login exitoso' })
    @ApiBadRequestResponse({ description: 'Credenciales inválidas' })
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        return this.authHandler.handleLogin(loginDto, res);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cerrar sesión' })
    @ApiOkResponse({ description: 'Sesión cerrada exitosamente' })
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return this.authHandler.handleLogout(req, res);
    }

    @Get('me')
    @Authenticated()
    async me(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return this.authHandler.handleMe(req, res);
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    @ApiOperation({ summary: 'Cambiar contraseña estando logueado' })
    async changePassword(
    @Req() req: Request,
    @Body() dto: ChangePasswordDto,
    ) {
    const user = req.user as { sub: number };
    return this.authService.changePassword(user.sub, dto);
    }

        

    @UseGuards(JwtAuthGuard)
    @Post('force-change-password')
    @ApiOperation({ summary: 'Cambio de contraseña tras login con contraseña temporal' })
    async forceChangePassword(
    @Req() req: Request,
    @Body() dto: ForceChangePasswordDto,
    ) {
    const user = req.user as { sub: number };
    return this.authService.forceChangePassword(user.sub, dto.newPassword);
    }

        @UseGuards(JwtAuthGuard)
        @Get('keepalive')
        @ApiOperation({ summary: 'Keepalive: actualiza lastActivityAt sin regenerar token' })
        async keepAlive(@Req() req: Request) {
            // Update lastActivityAt for the person so active users are kept alive
            // without regenerating JWTs (avoids token mismatch across tabs).
            const user = req.user as any;
            if (!user?.sub) return { ok: false };
            const configuredMinutes = Number(process.env.SESSION_TIMEOUT_MINUTES ?? '') || 15;
            try {
                await this.prisma.person.update({ where: { id: Number(user.sub) }, data: { lastActivityAt: new Date() } });
            } catch (e) {
                // ignore DB errors here but return ok:false to caller
                return { ok: false };
            }
            return { ok: true, timeoutMinutes: configuredMinutes };
        }

        @Get('session')
        @Authenticated()
        @Header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        @Header('Pragma', 'no-cache')
        @ApiOperation({ summary: 'Estado de sesión: tiempo restante antes de expirar' })
        async session(@Req() req: Request) {
            const user = req.user as any;

            // Prefer server-side lastActivityAt when available so that keepAlive
            // calls (which update lastActivityAt) keep the session alive even if
            // the JWT has an `exp` claim. This allows keeping users logged while
            // they are active without regenerating tokens.
            const configuredMinutes = Number(process.env.SESSION_TIMEOUT_MINUTES ?? '') || 15;
            try {
                const person = await this.prisma.person.findUnique({ where: { id: Number(user.sub) } });
                let remainingSeconds: number | null = null;
                if (person?.lastActivityAt) {
                    const last = new Date(person.lastActivityAt).getTime();
                    const now = Date.now();
                    const maxMs = configuredMinutes * 60 * 1000;
                    const elapsed = now - last;
                    remainingSeconds = Math.max(0, Math.floor((maxMs - elapsed) / 1000));
                } else {
                    // If no lastActivityAt recorded, assume full timeout window
                    remainingSeconds = configuredMinutes * 60;
                }
                return { remainingSeconds, lastActivityAt: person?.lastActivityAt, timeoutMinutes: configuredMinutes };
            } catch (e) {
                // Fallback to token-based expiry if DB lookup fails
                if (user?.exp) {
                    const nowSec = Math.floor(Date.now() / 1000);
                    const remainingSeconds = Math.max(0, Number(user.exp) - nowSec);
                    return { remainingSeconds, timeoutMinutes: null, tokenExp: user.exp };
                }
                return { remainingSeconds: configuredMinutes * 60, timeoutMinutes: configuredMinutes };
            }
        }
}
