import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        const userRoleRaw = (user?.role?.name ?? user?.role ?? '').toString();
        if (!userRoleRaw) {
            throw new ForbiddenException('Rol no encontrado en el token');
        }

        const userRole = userRoleRaw.toLowerCase();
        const normalizedRequired = requiredRoles.map((r) => r.toLowerCase());

        if (!normalizedRequired.includes(userRole)) {
            throw new ForbiddenException('Acceso denegado: rol insuficiente');
        }

        return true;
    }
}
