import { applyDecorators, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SessionGuard } from 'src/auth/guards/session.guard';

export function AdminOnly() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, SessionGuard, RolesGuard),
    Roles('Usuario'),
  );
}