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
    // Aceptar token desde cookie o desde Authorization: Bearer <token>
    const cookieToken = request.cookies?.jwt;
    const authHeader = request.headers?.authorization as string | undefined;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
    const token = cookieToken || bearerToken;

    if (!user?.sub || !token) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const person = await this.prisma.person.findUnique({
      where: { id: user.sub },
    });

    if (!person || person.currentToken !== token) {
      throw new UnauthorizedException('Sesión no válida');
    }
    // Comprobar inactividad y expirar sesión si corresponde
    const lastActivity = person.lastActivityAt ?? new Date(0);
    const now = new Date();
    const diffMs = now.getTime() - lastActivity.getTime();

    // Tiempo máximo de inactividad configurable vía env var
    // Lee SESSION_TIMEOUT_MINUTES (minutos). Si no existe, usa 15 minutos.
    const configuredMinutes = Number(process.env.SESSION_TIMEOUT_MINUTES ?? '') || 15;
    const maxInactivityMs = configuredMinutes * 60 * 1000;

    if (diffMs > maxInactivityMs) {
      // Invalidar token en BD
      await this.prisma.person.update({
        where: { id: person.id },
        data: {
          currentToken: null,
          lastActivityAt: null,
        },
      });

      throw new UnauthorizedException('Sesión expirada por inactividad');
    }

    // Actualizar timestamp de última actividad
    await this.prisma.person.update({
      where: { id: person.id },
      data: { lastActivityAt: now },
    });

    return true;
  }
}
