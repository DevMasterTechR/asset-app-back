import { Body, Controller, Get, Post, UseGuards, Request, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RequestsService } from './requests.service';
import { RequestStatus, RequestType } from '@prisma/client';

@ApiTags('Requests')
@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly service: RequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear solicitud (usuario)' })
  async create(@Request() req, @Body() body: { type: RequestType; payload?: any }) {
    const personId = req.user.personId || req.user.sub;
    return this.service.create(Number(personId), { type: body.type, payload: body.payload });
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('Usuario', 'Admin', 'Administrador', 'Recursos Humanos', 'RRHH', 'Human Resources')
  @ApiOperation({ summary: 'Listar solicitudes (por rol). Opcional filtrar por status' })
  async list(@Request() req, @Query('status') status?: string) {
    const st = status ? (RequestStatus as any)[status] ?? undefined : undefined;
    return this.service.findAllForRole(req.user, st);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('Usuario', 'Admin', 'Administrador', 'Recursos Humanos', 'RRHH', 'Human Resources')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id/seen-by-hr')
  @UseGuards(RolesGuard)
  @Roles('Recursos Humanos', 'RRHH', 'Human Resources', 'Admin', 'Administrador')
  @ApiOperation({ summary: 'Marcar visto por RRHH' })
  async seenByHr(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.markSeenByHr(id, Number(req.user.personId ?? req.user.sub));
  }

  @Patch(':id/accept-by-hr')
  @UseGuards(RolesGuard)
  @Roles('Recursos Humanos', 'RRHH', 'Human Resources', 'Admin', 'Administrador')
  @ApiOperation({ summary: 'Aceptar por RRHH (pasa a pendiente_admin)' })
  async acceptByHr(@Param('id', ParseIntPipe) id: number, @Request() req, @Body() body: { reason?: string }) {
    return this.service.acceptByHr(id, Number(req.user.personId ?? req.user.sub), body?.reason);
  }

  @Patch(':id/reject-by-hr')
  @UseGuards(RolesGuard)
  @Roles('Recursos Humanos', 'RRHH', 'Human Resources', 'Admin', 'Administrador')
  @ApiOperation({ summary: 'Rechazar por RRHH (requiere razón, estado rrhh_rechazada)' })
  async rejectByHr(@Param('id', ParseIntPipe) id: number, @Request() req, @Body() body: { reason: string }) {
    return this.service.rejectByHr(id, Number(req.user.personId ?? req.user.sub), body?.reason);
  }

  @Patch(':id/accept-by-admin')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Administrador')
  @ApiOperation({ summary: 'Aceptar por Admin (estado aceptada)' })
  async acceptByAdmin(@Param('id', ParseIntPipe) id: number, @Request() req, @Body() body: { reason?: string }) {
    return this.service.acceptByAdmin(id, Number(req.user.personId ?? req.user.sub), body?.reason);
  }

  @Patch(':id/reject-by-admin')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Administrador')
  @ApiOperation({ summary: 'Rechazar por Admin (requiere razón, estado rechazada)' })
  async rejectByAdmin(@Param('id', ParseIntPipe) id: number, @Request() req, @Body() body: { reason: string }) {
    return this.service.rejectByAdmin(id, Number(req.user.personId ?? req.user.sub), body?.reason);
  }
}
