import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

// Guard para tráfico servidor-a-servidor (no navegador): lo usa hwid-server
// para consultar datos de una persona por cédula. No depende de JWT/cookies,
// solo compara el header X-Integration-Key contra HWID_INTEGRATION_API_KEY.
@Injectable()
export class IntegrationApiKeyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const expected = process.env.HWID_INTEGRATION_API_KEY || '';
        if (!expected) {
            throw new UnauthorizedException('Integración no configurada');
        }

        const request = context.switchToHttp().getRequest();
        const given = String(request.headers['x-integration-key'] || '');

        const a = Buffer.from(given.padEnd(expected.length).slice(0, expected.length));
        const b = Buffer.from(expected);
        if (given.length !== expected.length || !timingSafeEqual(a, b)) {
            throw new UnauthorizedException('Clave de integración inválida');
        }

        return true;
    }
}
