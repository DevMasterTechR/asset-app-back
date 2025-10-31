import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // ✅ Permite leer el token desde:
        // 1. Authorization: Bearer <token>
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // 2. Cookie jwt (como en tu login actual)
        (req: Request) => req?.cookies?.jwt || null,
      ]),
      ignoreExpiration: false, // ❌ No ignores expiración
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    // Este objeto será inyectado como req.user
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
