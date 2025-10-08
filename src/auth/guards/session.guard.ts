import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.jwt;

    if (!token) {
      throw new UnauthorizedException('No se proporcionó token');
    }

    try {
      // Verificamos que el token sea válido
      const payload = this.jwtService.verify(token);
      request['user'] = payload; // Opcional: añadir usuario al request

      // Verificamos si coincide con el token activo del usuario
      const user = await this.prisma.person.findUnique({
        where: { id: payload.sub },
        select: { currentToken: true },
      });

      if (!user || user.currentToken !== token) {
        throw new UnauthorizedException('Sesión inválida o expirada');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o sesión expirada');
    }
  }
}
