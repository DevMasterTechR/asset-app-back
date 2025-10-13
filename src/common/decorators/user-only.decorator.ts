import { applyDecorators, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

export function UserOnly() {
  return applyDecorators(
    UseGuards(RolesGuard),
    Roles('Usuario'),
  );
}

