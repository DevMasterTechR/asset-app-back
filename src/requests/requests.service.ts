import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, RequestStatus, RequestType } from '@prisma/client';
import { EmailService } from '../common/services/email.service';

interface CreateRequestDto {
  type: RequestType;
  code?: string;
  payload?: any;
}

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(personId: number, dto: CreateRequestDto, userRole?: string) {
    const code = await this.generateCode();
    
    // Validar que no exista una solicitud pendiente del mismo tipo para este usuario
    const existingPendingRequest = await this.prisma.request.findFirst({
      where: {
        personId,
        type: dto.type,
        status: {
          in: [RequestStatus.pendiente_rrhh, RequestStatus.pendiente_admin],
        },
      },
    });

    if (existingPendingRequest) {
      throw new BadRequestException(
        `No se puede hacer mas de una solicitud por equipo`,
      );
    }
    
    // Si es creado por RRHH, va directo a Admin (pendiente_admin)
    // Si es creado por Usuario, va primero a RRHH (pendiente_rrhh)
    const isHR = userRole && (userRole.toLowerCase().includes('recursos humanos') || userRole.toLowerCase().includes('rrhh'));
    const initialStatus = isHR ? RequestStatus.pendiente_admin : RequestStatus.pendiente_rrhh;
    
    const request = await this.prisma.request.create({
      data: {
        code,
        personId,
        type: dto.type,
        status: initialStatus,
        payload: dto.payload ?? {},
        hrReviewerId: isHR ? personId : undefined,
      },
      include: {
        person: { select: { firstName: true, lastName: true } },
      },
    });

    // Enviar notificación por email a RRHH
    try {
      const requesterFullName = `${request.person.firstName} ${request.person.lastName}`;
      await this.emailService.sendNewRequestNotificationToHR(
        { type: request.type, payload: request.payload },
        requesterFullName,
        request.code,
      );
    } catch (error) {
      // Log del error pero no lanzar excepción para no afectar la creación de la solicitud
      console.error('❌ Error al enviar notificación de solicitud:', error.message);
    }

    return request;
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
    return this.prisma.request.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' },
      include: {
        hrReviewer: { select: { firstName: true, lastName: true } },
        adminReviewer: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async findOne(id: number) {
    const req = await this.prisma.request.findUnique({ 
      where: { id },
      include: {
        hrReviewer: { select: { firstName: true, lastName: true } },
        adminReviewer: { select: { firstName: true, lastName: true } },
      },
    });
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
    
    const updatedRequest = await this.prisma.request.update({
      where: { id },
      data: {
        status: RequestStatus.pendiente_admin,
        hrReviewerId: reviewerId,
        hrReason: hrReason,
      },
      include: {
        person: { select: { firstName: true, lastName: true } },
        hrReviewer: { select: { firstName: true, lastName: true } },
      },
    });

    // Enviar notificación a Admin/Sistemas
    try {
      const requesterFullName = `${updatedRequest.person.firstName} ${updatedRequest.person.lastName}`;
      const hrReviewerName = updatedRequest.hrReviewer ? 
        `${updatedRequest.hrReviewer.firstName} ${updatedRequest.hrReviewer.lastName}` : 
        undefined;
      
      await this.emailService.sendApprovedRequestNotificationToAdmin(
        { type: updatedRequest.type, payload: updatedRequest.payload },
        requesterFullName,
        updatedRequest.code,
        hrReviewerName,
      );
    } catch (error) {
      console.error('❌ Error al enviar notificación a Admin:', error.message);
    }

    return updatedRequest;
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

  private async generateCode() {
    // Obtener la fecha actual en formato YYYYMMDD
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    
    // Contar total de solicitudes para el número secuencial
    const totalCount = await this.prisma.request.count();
    const sequentialNumber = String(totalCount + 1).padStart(4, '0');
    
    return `SOL-${dateStr}-${sequentialNumber}`;
  }
}
