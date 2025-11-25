// SessionGuard removed: application now uses stateless JWT only.
// Keeping a small stub class to avoid import errors in case any file still references it.
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // Stateless: let JwtAuthGuard handle authentication; do not enforce DB session checks.
    return true;
  }
}
