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

      let desplazadoId: number | null = null;
      if (data.codigo) {
        desplazadoId = await this.liberarCodigoSiEstaEnUso(data.codigo, undefined, undefined);
      }
      const persona = await this.prisma.person.create({ data });
      if (persona.codigo) {
        // Primero se traen los activos que ya llevan ese número (se los
        // quitamos a quien los tuviera) y después se propaga: así los recién
        // traídos quedan también con el formato canónico del código.
        if (desplazadoId) {
          await this.traspasarActivosDelNumero(persona.codigo, persona.id, desplazadoId);
        }
        await this.propagarCodigoAActivos(persona.id, persona.codigo);
      }
      return persona;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // codigo es único (ver schema.prisma): si ya lo tiene otra persona, no
  // podemos simplemente asignarlo de nuevo (Prisma lo rechaza). En vez de
  // fallar, se lo QUITAMOS a quien lo tenía:
  //   - si la persona que pide el código está dejando libre uno propio
  //     (codigoQueQuedaLibre), es un INTERCAMBIO real: el desplazado se
  //     queda con ese número (y se propaga a sus activos, para que sus
  //     periféricos también queden bien) — así nunca hay dos personas
  //     compitiendo por el mismo número.
  //   - si no hay nada con qué intercambiar (persona nueva, sin código
  //     anterior), se le deja uno referencial (no vacío). Sus activos NO se
  //     renumeran: se traspasan al nuevo dueño del número (ver
  //     traspasarActivosDelNumero, que se llama desde quien conoce al nuevo
  //     dueño). El código no cambia; cambia el propietario.
  private async liberarCodigoSiEstaEnUso(
    codigo: string,
    exceptoPersonId?: number,
    codigoQueQuedaLibre?: string,
  ): Promise<number | null> {
    const otro = await this.prisma.person.findFirst({
      where: { codigo, ...(exceptoPersonId ? { id: { not: exceptoPersonId } } : {}) },
      select: { id: true },
    });
    if (!otro) return null;

    if (codigoQueQuedaLibre) {
      // INTERCAMBIO: el desplazado se queda con el número que esta persona
      // libera, y sus activos se RENUMERAN a ese número. No hay nada que
      // traspasar: los equipos siguen siendo suyos.
      await this.prisma.person.update({ where: { id: otro.id }, data: { codigo: codigoQueQuedaLibre } });
      await this.propagarCodigoAActivos(otro.id, codigoQueQuedaLibre);
      return null;
    }

    // Sin intercambio: el desplazado queda con un código referencial y sus
    // activos conservan el número viejo. Solo ESOS deben seguir al nuevo
    // dueño del número. Devolvemos su id para que el traspaso se limite a
    // ellos: los equipos de terceros que casualmente lleven el mismo número
    // no se tocan nunca.
    await this.prisma.person.update({ where: { id: otro.id }, data: { codigo: `REF-${otro.id}` } });
    return otro.id;
  }

  /**
   * Traspasa al nuevo dueño de un número TODOS los activos etiquetados con
   * ese número que estén asignados a otra persona.
   *
   * POR QUÉ EXISTE
   * ==============
   * El número identifica el puesto, y los activos van con el número: si el
   * 036 pasa de Gloria a Johana, el celular y la laptop los sincroniza
   * HWIDApp, pero los accesorios (mouse, cargadores, soporte, mousepad…) no
   * los conoce HWIDApp y se quedaban con la persona anterior. Resultado real
   * en producción: 6 accesorios marcados "-036" asignados a Gloria, cuyo
   * código de persona había pasado a ser "REF-142", mientras el 036 era de
   * Johana. Trece activos de cinco personas terminaron así.
   *
   * La regla es: el código NO cambia, cambia el propietario. Se cierra la
   * asignación anterior y se abre una nueva, para que la pantalla de
   * Asignaciones refleje el traspaso en vez de quedarse con datos viejos.
   *
   * Idempotente: si ya están todos en la persona correcta, no hace nada.
   */
  private async traspasarActivosDelNumero(
    numero: string,
    nuevoPersonId: number,
    soloDePersonaId: number,
  ): Promise<string[]> {
    const soloDigitos = String(numero || '').replace(/\D+/g, '');
    if (!soloDigitos) return []; // códigos referenciales (REF-…) no son números de inventario
    // Sin un dueño anterior concreto no se traspasa NADA. Esta guarda es la
    // que impide repetir el incidente del 11-sep-2026, cuando el traspaso
    // barrió por número y movió 146 equipos de 24 personas que no tenían
    // ninguna relación con el cambio de código.
    if (!soloDePersonaId) return [];
    const objetivo = soloDigitos.padStart(3, '0');

    const candidatos = await this.prisma.asset.findMany({
      where: { deletedAt: null, assignedPersonId: soloDePersonaId },
      select: { id: true, assetCode: true, assignedPersonId: true, branchId: true },
    });

    // El replace de espacios es necesario: hay códigos cargados a mano como
    // "CARGL -091", y sin normalizar nunca coincidirían con el número.
    const aTraspasar = candidatos.filter((a) => {
      if (a.assignedPersonId === nuevoPersonId) return false;
      const m = /-(\d+)$/.exec(String(a.assetCode || '').replace(/\s+/g, ''));
      return !!m && m[1].padStart(3, '0') === objetivo;
    });

    const traspasados: string[] = [];
    for (const a of aTraspasar) {
      await this.prisma.asset.update({
        where: { id: a.id },
        data: { assignedPersonId: nuevoPersonId, status: 'assigned' },
      });
      await this.prisma.assignmentHistory.updateMany({
        where: { assetId: a.id, returnDate: null },
        data: {
          returnDate: new Date(),
          returnNotes: `Cerrada automáticamente: el número ${objetivo} pasó a otra persona.`,
        },
      });
      await this.prisma.assignmentHistory.create({
        data: {
          assetId: a.id,
          personId: nuevoPersonId,
          branchId: a.branchId ?? undefined,
          deliveryNotes: `Traspasado automáticamente: acompaña al número ${objetivo}.`,
        },
      });
      traspasados.push(a.assetCode);
    }

    if (traspasados.length > 0) {
      // Aviso explícito en el log: un traspaso automático mueve activos entre
      // personas, y quien revise el inventario después tiene que poder saber
      // por qué se movieron sin tener que reconstruirlo.
      console.warn(
        `[codigos] El numero ${objetivo} cambio de dueno: ${traspasados.length} activo(s) traspasado(s) a la persona ${nuevoPersonId} -> ${traspasados.join(', ')}`,
      );
    }
    return traspasados;
  }

  // El código que asigna HWIDApp (ej. "LAPT-406") es el código verdadero de
  // ese equipo: si el número no coincide con el que ya tenía la persona en
  // Gestor-Tech, se lo actualizamos y se propaga a sus demás activos
  // (llamado desde AssetsService.sincronizarDesdeHwid). Si el número ya lo
  // tenía otra persona, se lo intercambiamos por el que esta persona deja
  // libre, en vez de dejarlo con un valor de relleno.
  //
  // A PROPÓSITO ya NO llama a traspasarActivosDelNumero: esta función corre
  // SOLA, sin que nadie la revise, cada vez que hwid-server sincroniza a
  // cualquier persona. hwid-server no tiene forma de saber qué números ya
  // estaban reservados a mano en Gestor-Tech (activos que nunca pasan por
  // HWIDApp) — un número libre del lado de hwid-server puede chocar con uno
  // ya ocupado acá, y traspasar accesorios automáticamente en ese caso le
  // quita en silencio el equipo real a alguien que no tiene nada que ver.
  // Pasó de verdad: se le arrebató a una persona de Guayaquil su laptop,
  // cargador y cable para dárselos a alguien de Quevedo que coincidió con su
  // mismo número. El traspaso de accesorios sigue existiendo (ver
  // traspasarActivosDelNumero) pero solo se dispara desde create()/update(),
  // donde un administrador está cambiando el código A PROPÓSITO desde el
  // panel de Personas — nunca desde una sincronización automática.
  async establecerCodigoDesdeHwid(personId: number, codigo: string) {
    const actual = await this.prisma.person.findUnique({ where: { id: personId }, select: { codigo: true } });
    if (actual?.codigo === codigo) return; // ya coincide, nada que hacer

    // Tampoco liberarCodigoSiEstaEnUso automático: si el número ya es de
    // OTRA persona real en Gestor-Tech, no se lo quitamos solos — eso es
    // exactamente lo que le pasó a la persona de Guayaquil. Se deja
    // anotado para que alguien lo resuelva a mano desde el panel de
    // Personas (ahí sí, con un humano mirando, vale el intercambio).
    const otro = await this.prisma.person.findFirst({
      where: { codigo, id: { not: personId } },
      select: { id: true, firstName: true, lastName: true },
    });
    if (otro) {
      console.warn(
        `[codigos] hwid-server le asigna el numero ${codigo} a la persona ${personId}, pero en Gestor-Tech ya es de ` +
          `${otro.firstName} ${otro.lastName} (id ${otro.id}). No se cambia nada automatico -- resolver a mano.`,
      );
      return;
    }

    await this.prisma.person.update({ where: { id: personId }, data: { codigo } });
    await this.propagarCodigoAActivos(personId, codigo);
  }

  // Aplica el código de la persona (ej. "406") al código de todos sus
  // activos actualmente asignados, manteniendo el prefijo de cada uno
  // (LAPT-001 -> LAPT-406, CARGL-001 -> CARGL-406, etc.). Se llama cada vez
  // que se crea o actualiza una persona con un código nuevo, y también al
  // asignarle un activo (ver AssignmentHistoryService y AssetsService).
  private async propagarCodigoAActivos(personId: number, codigo: string) {
    const normalizarCodigo = (c: string) => String(c || '').replace(/\s+/g, '').toUpperCase();
    const activos = await this.prisma.asset.findMany({ where: { assignedPersonId: personId } });
    // Candidatos para el "ocupante" en TODA la tabla, no solo los de esta
    // persona: algunos códigos quedaron cargados a mano con espacios
    // ("CARGL - 006"), y una comparación exacta de texto nunca los
    // encuentra contra el formato canónico que se genera aquí.
    // Un equipo eliminado (borrado lógico) libera su código.
    const todos = await this.prisma.asset.findMany({
      where: { deletedAt: null },
      // assignedPersonId hace falta para no renumerar el equipo de un tercero.
      select: { id: true, assetCode: true, assignedPersonId: true },
    });

    for (const activo of activos) {
      const nuevoCodigo = aplicarCodigoDePersona(activo.assetCode, codigo);
      if (nuevoCodigo === activo.assetCode) continue;

      // El código del tipo (ej. "CARGL-006") es único: si ya lo tiene OTRO
      // activo hay que apartarlo antes. Pero SOLO si no es de otra persona.
      //
      // Renumerar el equipo de un tercero fue el eslabón que encadenó los
      // incidentes: al mover a alguien de número, los accesorios de quien ya
      // usaba el número de destino quedaban renumerados en silencio y
      // aparecían bajo una persona que nunca los recibió. Pasó con tres
      // personas seguidas por efecto dominó.
      //
      // Si el ocupante es de un tercero, este activo se queda con su código y
      // queda anotado: lo resuelve una persona desde el panel.
      const ocupante = todos.find(
        (a) => a.id !== activo.id && normalizarCodigo(a.assetCode) === normalizarCodigo(nuevoCodigo),
      );
      if (ocupante) {
        const esDeUnTercero =
          ocupante.assignedPersonId != null && ocupante.assignedPersonId !== personId;
        if (esDeUnTercero) {
          console.warn(
            `[codigos] No se renumera ${activo.assetCode} a ${nuevoCodigo}: ese codigo lo tiene el equipo id ${ocupante.id} de la persona ${ocupante.assignedPersonId}. Resolver a mano.`,
          );
          continue;
        }
        // En DOS pasos y en este orden: el ocupante no puede tomar el codigo
        // del activo mientras el activo todavia lo tiene puesto (assetCode es
        // UNICO). Primero se aparta a un temporal, despues el activo toma el
        // suyo, y al final el ocupante recibe el que quedo libre.
        await this.prisma.asset.update({
          where: { id: ocupante.id },
          data: { assetCode: `TMP-${ocupante.id}-${Date.now()}` },
        });
        await this.prisma.asset.update({ where: { id: activo.id }, data: { assetCode: nuevoCodigo } });
        await this.prisma.asset.update({ where: { id: ocupante.id }, data: { assetCode: activo.assetCode } });
        continue;
      }
      await this.prisma.asset.update({ where: { id: activo.id }, data: { assetCode: nuevoCodigo } });
    }
  }

  /**
   * Lleva los equipos de una persona a su sucursal.
   *
   * Una persona esta en UNA sucursal, y sus equipos estan donde esta ella. Al
   * cambiarla de sucursal, sus equipos y sus entregas abiertas se quedaban en
   * la anterior: en la pantalla de Asignaciones la misma persona aparecia con
   * equipos en dos sucursales distintas, lo cual no existe en la realidad.
   *
   * Solo se tocan las asignaciones ABIERTAS. Las cerradas son el registro de
   * una entrega que ya ocurrio -- varias estan impresas en actas firmadas -- y
   * reescribirlas seria falsear lo que se firmo ese dia.
   */
  async alinearSucursalDeSusEquipos(personId: number, branchId: number) {
    const equipos = await this.prisma.asset.findMany({
      where: { assignedPersonId: personId, deletedAt: null },
      select: { id: true, branchId: true },
    });
    const desalineados = equipos.filter((e) => e.branchId !== branchId).map((e) => e.id);
    if (desalineados.length === 0) return;

    await this.prisma.asset.updateMany({
      where: { id: { in: desalineados } },
      data: { branchId },
    });
    await this.prisma.assignmentHistory.updateMany({
      where: { assetId: { in: desalineados }, returnDate: null },
      data: { branchId },
    });
    console.warn(
      `[sucursales] La persona ${personId} cambio de sucursal: ${desalineados.length} equipo(s) y sus entregas abiertas pasan a la sucursal ${branchId}.`,
    );
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
        { codigo: { contains: term, mode: 'insensitive' } },
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

      let desplazadoId: number | null = null;
      if (payload.codigo) {
        const actual = await this.prisma.person.findUnique({ where: { id }, select: { codigo: true } });
        desplazadoId = await this.liberarCodigoSiEstaEnUso(payload.codigo, id, actual?.codigo ?? undefined);
      }

      const actualizada = await this.prisma.person.update({
        where: { id },
        data: payload,
      });

      if (payload.codigo) {
        if (desplazadoId) {
          await this.traspasarActivosDelNumero(payload.codigo, id, desplazadoId);
        }
        await this.propagarCodigoAActivos(id, payload.codigo);
      }

      // Si se la movio de sucursal, sus equipos se mudan con ella.
      if (payload.branchId !== undefined && payload.branchId !== null) {
        await this.alinearSucursalDeSusEquipos(id, Number(payload.branchId));
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


