import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: any) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    
    // Coloca el token en el header para que passport-jwt lo lea
    const token = request.cookies?.jwt;
    if (token) {
      request.headers.authorization = `Bearer ${token}`;
    }

    return request;
  }
}
