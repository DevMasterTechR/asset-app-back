import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { Request } from 'express';
import { decryptToken } from '../utils/auth-cookie.helper';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Authorization: Bearer <token>
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // 2. Cookie jwt — si está cifrada, la desciframos antes de devolver el JWT raw
        (req: Request) => {
          const raw = req?.cookies?.jwt || null;
          if (!raw) return null;
          try {
            // Intentamos descifrar. Si falla, asumimos que la cookie contiene
            // el JWT en claro y devolvemos el valor crudo.
            const decrypted = decryptToken(raw);
            return decrypted;
          } catch (_e) {
            return raw;
          }
        },
      ]),
      ignoreExpiration: false, // ❌ No ignores expiración
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    // validate returns the user object that will be attached to req.user

    // Este objeto será inyectado como req.user
    return {
      sub: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
