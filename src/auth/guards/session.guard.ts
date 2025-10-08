import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // ✅ Typecast para evitar error TS2339
    const user = request.user as { sub: number; username?: string };
    const token = request.cookies?.jwt;

    if (!user?.sub || !token) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const person = await this.prisma.person.findUnique({
      where: { id: user.sub },
    });

    if (!person || person.currentToken !== token) {
      throw new UnauthorizedException('Sesión no válida');
    }

    const lastActivity = person.lastActivityAt ?? new Date(0);
    const now = new Date();
    const diffMs = now.getTime() - lastActivity.getTime();
    const maxInactivityMs = 5 * 60 * 1000; // 5 minutos

    if (diffMs > maxInactivityMs) {
      // Limpiar token si expiró por inactividad
      await this.prisma.person.update({
        where: { id: person.id },
        data: {
          currentToken: null,
          lastActivityAt: null,
        },
      });

      throw new UnauthorizedException('Sesión expirada por inactividad');
    }

    // Actualizar timestamp
    await this.prisma.person.update({
      where: { id: person.id },
      data: { lastActivityAt: now },
    });

    return true;
  }
}
