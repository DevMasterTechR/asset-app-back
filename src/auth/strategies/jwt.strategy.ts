import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.jwt, 
      ]),
      ignoreExpiration: true,
      secretOrKey: jwtConstants.secret,
    });
  }
  async validate(payload: any) {
    console.log('✅ Payload JWT validado:', payload);
    return {
      sub: payload.sub,
      username: payload.username,
      role: payload.role, 
    };
  }
}
