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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authHandler: AuthHandlerService) {}

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
    @UseGuards(JwtAuthGuard, SessionGuard)
    @ApiOperation({ summary: 'Obtener datos del usuario autenticado' })
    @ApiOkResponse({ description: 'Datos del usuario actual' })
    async me(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return this.authHandler.handleMe(req, res);
    }
}
