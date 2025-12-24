import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, RequestStatus, RequestType } from '@prisma/client';

interface CreateRequestDto {
  type: RequestType;
  code?: string;
  payload?: any;
}

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async create(personId: number, dto: CreateRequestDto) {
    const code = dto.code ?? this.generateCode();
    return this.prisma.request.create({
      data: {
        code,
        personId,
        type: dto.type,
        status: RequestStatus.pendiente_rrhh,
        payload: dto.payload ?? {},
      },
    });
  }

  async findAllForRole(user: any, status?: RequestStatus | undefined) {
    const where: Prisma.RequestWhereInput = {};
    if (status) where.status = status;

    const role = typeof user.role === 'string' ? user.role : user.role?.name;
    const roleL = (role || '').toLowerCase();
    if (!roleL || roleL === 'usuario') {
      where.personId = Number(user.personId ?? user.sub);
    }
    // RRHH o Admin ven todo (con filtro opcional de estado)
    return this.prisma.request.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const req = await this.prisma.request.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Solicitud no encontrada');
    return req;
  }

  async markSeenByHr(id: number, reviewerId: number) {
    const req = await this.findOne(id);
    if (req.status !== RequestStatus.pendiente_rrhh) {
      throw new BadRequestException('Solo se puede marcar visto en pendiente RRHH');
    }
    return this.prisma.request.update({ where: { id }, data: { hrSeenAt: new Date(), hrReviewerId: reviewerId } });
  }

  async acceptByHr(id: number, reviewerId: number, hrReason?: string) {
    const req = await this.findOne(id);
    if (req.status !== RequestStatus.pendiente_rrhh) {
      throw new BadRequestException('Estado inválido para aceptación RRHH');
    }
    return this.prisma.request.update({
      where: { id },
      data: {
        status: RequestStatus.pendiente_admin,
        hrReviewerId: reviewerId,
        hrReason: hrReason,
      },
    });
  }

  async rejectByHr(id: number, reviewerId: number, reason: string) {
    if (!reason || !reason.trim()) throw new BadRequestException('Razón de rechazo requerida');
    const req = await this.findOne(id);
    if (req.status !== RequestStatus.pendiente_rrhh) {
      throw new BadRequestException('Estado inválido para rechazo RRHH');
    }
    return this.prisma.request.update({
      where: { id },
      data: {
        status: RequestStatus.rrhh_rechazada,
        hrReviewerId: reviewerId,
        hrReason: reason,
      },
    });
  }

  async acceptByAdmin(id: number, reviewerId: number, adminReason?: string) {
    const req = await this.findOne(id);
    if (req.status !== RequestStatus.pendiente_admin) {
      throw new BadRequestException('Estado inválido para aceptación Admin');
    }
    return this.prisma.request.update({
      where: { id },
      data: {
        status: RequestStatus.aceptada,
        adminReviewerId: reviewerId,
        adminReason: adminReason,
      },
    });
  }

  async rejectByAdmin(id: number, reviewerId: number, reason: string) {
    if (!reason || !reason.trim()) throw new BadRequestException('Razón de rechazo requerida');
    const req = await this.findOne(id);
    if (req.status !== RequestStatus.pendiente_admin) {
      throw new BadRequestException('Estado inválido para rechazo Admin');
    }
    return this.prisma.request.update({
      where: { id },
      data: {
        status: RequestStatus.rechazada,
        adminReviewerId: reviewerId,
        adminReason: reason,
      },
    });
  }

  private generateCode() {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `SOL-${now.getFullYear()}${mm}${dd}-${rand}`;
  }
}
