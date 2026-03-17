import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { jwtConstants } from './constants';
import { AuthHandlerService } from './services/auth-handler.service';

function buildJwtModuleConfig() {
  const rawExpiresIn = (process.env.AUTH_TOKEN_EXPIRES_IN ?? 'never').trim();
  const normalized = rawExpiresIn.toLowerCase();
  const neverExpires =
    normalized.length === 0 ||
    normalized == 'never' ||
    normalized == 'none' ||
    normalized == 'off' ||
    normalized == '0';

  if (neverExpires) {
    // No `exp` claim is generated. Token remains valid until manual logout on client.
    return {
      secret: jwtConstants.secret,
    };
  }

  return {
    secret: jwtConstants.secret,
    signOptions: { expiresIn: rawExpiresIn as any },
  };
}

@Module({
  imports: [
    PassportModule,
    JwtModule.register(buildJwtModuleConfig()),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService, AuthHandlerService],
})
export class AuthModule {}

