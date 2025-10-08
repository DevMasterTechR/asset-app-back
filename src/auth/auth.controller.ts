import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { CreatePersonDto } from '../people/dto/create-person.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}


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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiOkResponse({ description: 'Sesión cerrada exitosamente' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    return { message: 'Sesión cerrada' };
  }
}
