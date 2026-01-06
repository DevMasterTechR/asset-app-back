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
      // Expiración muy larga (999 días) para que la sesión no caduque automáticamente.
      // El usuario solo puede cerrar sesión de forma manual.
      // Puede ajustarse con la variable `AUTH_TOKEN_EXPIRES_IN` (ej: '1h', '7d', '365d', '999d').
        signOptions: { expiresIn: (process.env.AUTH_TOKEN_EXPIRES_IN ?? '999d') as any },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService, AuthHandlerService],
})
export class AuthModule {}

