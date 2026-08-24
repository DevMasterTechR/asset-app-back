import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { aplicarCodigoDePersona } from '../common/utils/asset-code.util';

@Injectable()
export class PeopleService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear persona (con hash de contraseña)
  async create(data: CreatePersonDto) {
    try {
      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
      }

      const persona = await this.prisma.person.create({ data });
      if (persona.codigo) {
        await this.propagarCodigoAActivos(persona.id, persona.codigo);
      }
      return persona;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // El código que asigna HWIDApp (ej. "LAPT-406") es el código verdadero de
  // ese equipo: si el número no coincide con el código que ya tenía la
  // persona en Gestor-Tech, se lo actualizamos y se propaga a sus demás
  // activos (llamado desde AssetsService.sincronizarDesdeHwid).
  async establecerCodigoDesdeHwid(personId: number, codigo: string) {
    await this.prisma.person.update({ where: { id: personId }, data: { codigo } });
    await this.propagarCodigoAActivos(personId, codigo);
  }

  // Aplica el código de la persona (ej. "406") al código de todos sus
  // activos actualmente asignados, manteniendo el prefijo de cada uno
  // (LAPT-001 -> LAPT-406, CARGL-001 -> CARGL-406, etc.). Se llama cada vez
  // que se crea o actualiza una persona con un código nuevo, y también al
  // asignarle un activo (ver AssignmentHistoryService y AssetsService).
  private async propagarCodigoAActivos(personId: number, codigo: string) {
    const activos = await this.prisma.asset.findMany({ where: { assignedPersonId: personId } });
    for (const activo of activos) {
      const nuevoCodigo = aplicarCodigoDePersona(activo.assetCode, codigo);
      if (nuevoCodigo !== activo.assetCode) {
        await this.prisma.asset.update({ where: { id: activo.id }, data: { assetCode: nuevoCodigo } });
      }
    }
  }

  // Obtener todas las personas con soporte de búsqueda y paginación
  async findAll(q?: string, page = 1, limit = 999999) {
    const where: any = {};

    if (q && q.trim().length > 0) {
      const term = q.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { username: { contains: term, mode: 'insensitive' } },
        { nationalId: { contains: term, mode: 'insensitive' } },
      ];
    }

    const take = Number(limit) > 0 ? Number(limit) : 999999;
    const skip = (Number(page) > 1 ? Number(page) - 1 : 0) * take;

    const [data, total] = await Promise.all([
      this.prisma.person.findMany({
        where,
        include: { department: true, role: true, branch: true },
        skip,
        take,
      }),
      this.prisma.person.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / take));

    return {
      data,
      total,
      page: Number(page),
      limit: take,
      totalPages,
    };
  }

  // Obtener persona por ID
  async findOne(id: number) {
    const person = await this.prisma.person.findUnique({
      where: { id },
      include: {
        department: true,
        role: true,
        branch: true,
      },
    });

    if (!person) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }

    return person;
  }

  // Actualizar persona
  async update(id: number, data: UpdatePersonDto) {
    try {
      const payload: any = { ...data };

      // Si se envía password en el update, hashearla antes de guardar
      if (payload.password) {
        const salt = await bcrypt.genSalt(10);
        payload.password = await bcrypt.hash(payload.password, salt);
      }

      // Coerce numeric IDs if they were sent as strings
      const numericFields = ['departmentId', 'roleId', 'branchId'];
      for (const f of numericFields) {
        if (payload[f] !== undefined && payload[f] !== null && typeof payload[f] === 'string') {
          const n = Number(payload[f]);
          if (!isNaN(n)) payload[f] = n;
        }
      }

      const actualizada = await this.prisma.person.update({
        where: { id },
        data: payload,
      });

      if (payload.codigo) {
        await this.propagarCodigoAActivos(id, payload.codigo);
      }

      return actualizada;
    } catch (error) {
      // Loguear el error completo para ayudar a depuración
      console.error('[PeopleService.update] caught error:', error && error.stack ? error.stack : error);
      this.handlePrismaError(error, id);
    }
  }

  // Eliminar persona
  async remove(id: number) {
    try {
      // Obtener la persona y su rol
      const person = await this.prisma.person.findUnique({
        where: { id },
        include: { role: true },
      });

      if (!person) {
        throw new NotFoundException(`Persona con ID ${id} no encontrada`);
      }

      // Si es administrador, asegurar que quede al menos uno en el sistema
      const isAdmin = person.role?.name?.toLowerCase() === 'admin';
      if (isAdmin) {
        const adminCount = await this.prisma.person.count({
          where: { role: { is: { name: 'Admin' } } },
        });

        if (adminCount <= 1) {
          throw new BadRequestException('No se puede eliminar: debe existir al menos un Administrador en el sistema');
        }
      }

      return await this.prisma.person.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  // Búsqueda por cédula para integraciones externas (ej. HWIDApp). Cubre el
  // caso real de cédulas que perdieron el cero inicial al guardarse (ej.
  // "0215234759" quedó como "215234759"): si no hay match exacto, prueba con
  // el cero puesto o quitado antes de dar por no encontrada a la persona.
  async findByCedulaConFallback(cedulaCruda: string) {
    const cedula = String(cedulaCruda || '').replace(/\D+/g, '');
    const include = { department: true, branch: true } as const;

    const mapPersona = (p: any) => ({
      nombre: p.firstName,
      apellido: p.lastName,
      sucursal: p.branch?.name ?? null,
      departamento: p.department?.name ?? null,
      cedula: p.nationalId,
    });

    const exacto = await this.prisma.person.findUnique({ where: { nationalId: cedula }, include });
    if (exacto) {
      return { match: 'exact', cedulaConsultada: cedula, cedulaEncontrada: exacto.nationalId, persona: mapPersona(exacto) };
    }

    const variantes: string[] = [];
    if (cedula.length === 10 && cedula.startsWith('0')) variantes.push(cedula.slice(1));
    if (cedula.length === 9) variantes.push('0' + cedula);

    for (const variante of variantes) {
      const encontrada = await this.prisma.person.findUnique({ where: { nationalId: variante }, include });
      if (encontrada) {
        return { match: 'fuzzy', cedulaConsultada: cedula, cedulaEncontrada: encontrada.nationalId, persona: mapPersona(encontrada) };
      }
    }

    return { match: 'none', cedulaConsultada: cedula, cedulaEncontrada: null, persona: null };
  }

  async findUserDetails(id: number) {
  return this.prisma.person.findUnique({
    where: { id },
    include: {
      branch: true,
      department: true,
      role: true,
      assets: true,
    },
  });
}

  // Manejo de errores de Prisma
  private handlePrismaError(error: any, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Persona con ID ${id} no encontrada`);
        case 'P2002':
          throw new BadRequestException('Ya existe una persona con ese valor único');
        default:
          throw new BadRequestException('Error en la solicitud');
      }
    }

    throw new InternalServerErrorException('Error interno del servidor');
  }
}


