import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreatePersonDto } from '../people/dto/create-person.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post('register')
  async register(@Body() dto: CreatePersonDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.person.create({
      data: { ...dto, password: hashedPassword },
    });
    return { message: 'Usuario registrado', user };
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    return this.authService.login(user);
  }
}
