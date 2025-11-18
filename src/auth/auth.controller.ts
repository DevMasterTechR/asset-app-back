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
import { SessionGuard } from './guards/session.guard';
import { AuthHandlerService } from './services/auth-handler.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthService } from './auth.service';
import { ForceChangePasswordDto } from './dto/force-change-password.dto';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';
import {Authenticated} from 'src/common/decorators/authenticated.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authHandler: AuthHandlerService,private readonly authService: AuthService,) {}
    

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
    @UseGuards(JwtAuthGuard, SessionGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cerrar sesión' })
    @ApiOkResponse({ description: 'Sesión cerrada exitosamente' })
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return this.authHandler.handleLogout(req, res);
    }

    @Get('me')
    @Authenticated()
  async me(@Req() req: Request) {
    return req.user; // <- ya tienes el usuario validado por JWT
  }

    @UseGuards(JwtAuthGuard, SessionGuard)
    @Post('change-password')
    @ApiOperation({ summary: 'Cambiar contraseña estando logueado' })
    async changePassword(
    @Req() req: Request,
    @Body() dto: ChangePasswordDto,
    ) {
    const user = req.user as { sub: number };
    return this.authService.changePassword(user.sub, dto);
    }

        

    @UseGuards(JwtAuthGuard, SessionGuard)
    @Post('force-change-password')
    @ApiOperation({ summary: 'Cambio de contraseña tras login con contraseña temporal' })
    async forceChangePassword(
    @Req() req: Request,
    @Body() dto: ForceChangePasswordDto,
    ) {
    const user = req.user as { sub: number };
    return this.authService.forceChangePassword(user.sub, dto.newPassword);
    }

        @Authenticated()
        @Get('keepalive')
        @ApiOperation({ summary: 'Keepalive: comprueba que el token JWT es válido' })
        async keepAlive(@Req() req: Request) {
            // Usamos sólo JwtAuthGuard aquí para permitir al frontend comprobar
            // que el token sigue siendo válido. El SessionGuard valida sesiones
            // basadas en token/DB y puede provocar 401 si la cookie no se envía.
            return { ok: true };
        }
}
