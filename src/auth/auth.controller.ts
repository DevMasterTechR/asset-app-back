import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreatePersonDto } from '../people/dto/create-person.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

class LoginDto {
  username: string;
  password: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registro de usuario' })
  @ApiBody({ type: CreatePersonDto })
  @ApiCreatedResponse({ description: 'Usuario registrado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos para registro' })
  async register(@Body() dto: CreatePersonDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.person.create({
      data: { ...dto, password: hashedPassword },
    });
    return { message: 'Usuario registrado', user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login de usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'user123' },
        password: { type: 'string', example: 'secret123' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiOkResponse({ description: 'Login exitoso, token generado' })
  @ApiBadRequestResponse({ description: 'Credenciales inválidas' })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    return this.authService.login(user);
  }
}
