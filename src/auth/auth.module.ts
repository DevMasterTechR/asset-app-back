import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { jwtConstants } from './constants';
import { AuthHandlerService } from './services/auth-handler.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      // Por defecto usamos una expiración larga para evitar que el usuario sea
      // desconectado automáticamente en entorno de desarrollo. Puede ajustarse
      // con la variable `AUTH_TOKEN_EXPIRES_IN` (ej: '1h', '7d', '365d').
      signOptions: { expiresIn: process.env.AUTH_TOKEN_EXPIRES_IN ?? '365d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService, AuthHandlerService],
})
export class AuthModule {}

