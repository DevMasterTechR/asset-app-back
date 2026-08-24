import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { SyncHwidAssetDto } from './dto/sync-hwid-asset.dto';
import { handlePrismaError } from 'src/common/utils/prisma-error.util';
import { aplicarCodigoDePersona } from 'src/common/utils/asset-code.util';
import { PeopleService } from '../people/people.service';


@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly peopleService: PeopleService,
  ) {}

  async create(data: CreateAssetDto) {
    try {
      // Log entrada para depuración
      if (process.env.DEBUG_ASSETS_SERVICE === 'true') {
        console.log('[AssetsService.create] payload:', JSON.stringify(data));
      }

      // Normalizar posibles campos de fecha que vienen como strings desde el frontend
      const payload: any = { ...data };
      const dateFields = ['purchaseDate', 'deliveryDate', 'receivedDate'];
      for (const f of dateFields) {
        if (payload[f]) {
          const d = new Date(payload[f]);
          // Si la fecha no es válida, dejamos que Prisma/handler lance el error,
          // pero convertimos cadenas válidas a objetos Date para que Prisma acepte el valor.
          if (!isNaN(d.getTime())) payload[f] = d;
        }
      }

      return await this.prisma.asset.create({ data: payload });
    } catch (error) {
      // Always log the error (helps debugging when DEBUG flag isn't set)
      console.error('[AssetsService.create] caught error:', error && error.stack ? error.stack : error);

      // Delegate to the Prisma error handler which will throw an HTTP exception
      handlePrismaError(error, 'Activo');
    }
  }

  async createBulk(quantity: number, template: CreateAssetDto) {
    try {
      if (quantity < 1 || quantity > 1000) {
        throw new BadRequestException('La cantidad debe estar entre 1 y 1000');
      }

      // Log entrada para depuración
      if (process.env.DEBUG_ASSETS_SERVICE === 'true') {
        console.log('[AssetsService.createBulk] quantity:', quantity, 'template:', JSON.stringify(template));
      }

      // Preparar los datos base
      const basePayload: any = { ...template };
      const dateFields = ['purchaseDate', 'deliveryDate', 'receivedDate'];
      for (const f of dateFields) {
        if (basePayload[f]) {
          const d = new Date(basePayload[f]);
          if (!isNaN(d.getTime())) basePayload[f] = d;
        }
      }

      // Crear un array con la cantidad solicitada de dispositivos
      const assetsToCreate = Array.from({ length: quantity }, (_, idx) => ({
        ...basePayload,
        assetCode: `${basePayload.assetCode}-${String(idx + 1).padStart(3, '0')}`,
      }));

      // Usar createMany para crear todos los activos de una vez
      const result = await this.prisma.asset.createMany({
        data: assetsToCreate,
        skipDuplicates: false,
      });

      return {
        created: result.count,
        quantity: quantity,
        message: `Se crearon ${result.count} activos exitosamente`,
      };
    } catch (error) {
      console.error('[AssetsService.createBulk] caught error:', error && error.stack ? error.stack : error);
      handlePrismaError(error, 'Activos (creación masiva)');
    }
  }

  // Obtener activos con soporte de búsqueda y paginación
  async findAll(q?: string, page = 1, limit = 10) {
    const where: any = {};

    if (q && q.trim().length > 0) {
      const term = q.trim();
      where.OR = [
        { assetCode: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
        { model: { contains: term, mode: 'insensitive' } },
        { serialNumber: { contains: term, mode: 'insensitive' } },
      ];
    }

    const take = Number(limit) > 0 ? Number(limit) : 10;
    const skip = (Number(page) > 1 ? Number(page) - 1 : 0) * take;

    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({ 
        where, 
        skip, 
        take,
        select: {
          id: true,
          assetCode: true,
          assetType: true,
          serialNumber: true,
          brand: true,
          model: true,
          status: true,
          branchId: true,
          assignedPersonId: true,
          purchaseDate: true,
          deliveryDate: true,
          receivedDate: true,
          notes: true,
          attributesJson: true,
          createdAt: true,
          updatedAt: true,
          branch: {
            select: {
              id: true,
              name: true
            }
          },
          assignedPerson: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      this.prisma.asset.count({ where }),
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

  async findOne(id: number) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException(`Activo con ID ${id} no encontrado`);
    return asset;
  }

  async update(id: number, data: UpdateAssetDto) {
    try {
      // Log entrada para depuración
      if (process.env.DEBUG_ASSETS_SERVICE === 'true') {
        console.log('[AssetsService.update] id, payload:', id, JSON.stringify(data));
      }

      // Obtener el activo actual para validar reglas de negocio
      const existingAsset = await this.prisma.asset.findUnique({ where: { id } });
      if (!existingAsset) throw new NotFoundException(`Activo con ID ${id} no encontrado`);

      // Si el activo está asignado, no permitir cambiar el estado ni la fecha de recepción
      const isAssigned = existingAsset.status === 'assigned' || !!existingAsset.assignedPersonId;
      if (isAssigned) {
        // Si el cliente intenta modificar el estado o la fecha de recepción
        if ((data.status !== undefined && data.status !== existingAsset.status) || (data.receivedDate !== undefined && data.receivedDate !== null)) {
          throw new BadRequestException('No puedes editar este dispositivo hasta que no tenga una asignación activa');
        }
      }

      // Normalizar posibles campos de fecha que vienen como strings desde el frontend
      const payload: any = { ...data };
      const dateFields = ['purchaseDate', 'deliveryDate', 'receivedDate'];
      for (const f of dateFields) {
        if (payload[f]) {
          const d = new Date(payload[f]);
          if (!isNaN(d.getTime())) payload[f] = d;
        }
      }

      // Construir objeto limpio para evitar enviar propiedades undefined/''
      const updateData: any = {};
      for (const key of Object.keys(payload)) {
        const val = payload[key];
        if (val === undefined) continue;
        // Evitar enviar cadenas vacías que puedan sobrescribir valores existentes
        if (typeof val === 'string' && val.trim() === '') continue;
        updateData[key] = val;
      }

      // Si el activo está asignado, asegurar que no podamos modificar campos
      // críticos que llevarían a dejarlo en disponible accidentalmente.
      if (isAssigned) {
        if (process.env.DEBUG_ASSETS_SERVICE === 'true') {
          console.log('[AssetsService.update] activo asignado - impidiendo cambios en status/receivedDate/assignedPersonId');
          console.log('[AssetsService.update] payload antes de limpiar:', payload);
          console.log('[AssetsService.update] updateData antes de borrar campos:', updateData);
        }
        delete updateData.status;
        delete updateData.receivedDate;
        // Evitar quitar la referencia a la persona asignada desde un update
        // genérico de activo (se gestiona desde AssignmentHistory)
        delete updateData.assignedPersonId;
        if (process.env.DEBUG_ASSETS_SERVICE === 'true') {
          console.log('[AssetsService.update] updateData después de borrar campos:', updateData);
        }
      }

      // Asignación directa (fuera del flujo normal de AssignmentHistory): si
      // este PUT le pone assignedPersonId a un activo que estaba disponible
      // y la persona tiene código propio, el activo lo hereda -salvo que el
      // propio PUT ya venga con un assetCode explícito, que manda.
      if (!isAssigned && updateData.assignedPersonId && data.assetCode === undefined) {
        const persona = await this.prisma.person.findUnique({ where: { id: updateData.assignedPersonId } });
        if (persona?.codigo) {
          const nuevoCodigo = aplicarCodigoDePersona(existingAsset.assetCode, persona.codigo);
          if (nuevoCodigo !== existingAsset.assetCode) updateData.assetCode = nuevoCodigo;
        }
      }

      if (process.env.DEBUG_ASSETS_SERVICE === 'true') {
        console.log('[AssetsService.update] Ejecutando prisma.asset.update con:', updateData);
      }
      return await this.prisma.asset.update({ where: { id }, data: updateData });
    } catch (error) {
      // Log the error to help debugging
      console.error('[AssetsService.update] caught error:', error && error.stack ? error.stack : error);
      handlePrismaError(error, 'Activo', id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.asset.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, 'Activo', id);
    }
  }

  async findOneOwnedByUser(assetId: number, userId: number) {
    const asset = await this.prisma.asset.findFirst({
      where: { id: assetId, assignedPersonId: userId },
    });
    if (!asset) throw new NotFoundException('Activo no encontrado o no pertenece al usuario');
    return asset;
  }

  findAllByUser(userId: number) {
    return this.prisma.asset.findMany({
      where: { assignedPersonId: userId },
    });
  }

  async findByAssignedPersonId(personId: number) {
    // Obtener asignaciones activas (sin fecha de devolución)
    const activeAssignments = await this.prisma.assignmentHistory.findMany({
      where: { 
        personId,
        returnDate: null, // Solo asignaciones activas
      },
      include: {
        asset: {
          select: {
            id: true,
            assetCode: true,
            assetType: true,
            brand: true,
            model: true,
            serialNumber: true,
            status: true,
            purchaseDate: true,
          },
        },
      },
    });

    // Retornar solo los assets
    return activeAssignments.map(assignment => assignment.asset);
  }

  async findUniqueAssetTypes() {
    const types = await this.prisma.asset.findMany({
      distinct: ['assetType'],
      select: { assetType: true },
    });
    return types.map((t) => t.assetType).filter((t) => t);
  }

  async getAssetsGroupedByPerson() {
    const people = await this.prisma.person.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        departmentId: true,
        roleId: true,
        branchId: true,
        assets: {
          select: {
            id: true,
            assetCode: true,
            assetType: true,
            brand: true,
            model: true,
            status: true,
            serialNumber: true,
            purchaseDate: true,
            deliveryDate: true,
            receivedDate: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return people.map((p) => ({
      person: {
        id: p.id,
        name: `${p.firstName} ${p.lastName}`.trim(),
        username: p.username,
      },
      assets: p.assets,
      count: p.assets.length,
    }));
  }

  // Sincroniza el activo que corresponde a un equipo de HWIDApp. El código
  // que manda HWIDApp (ej. "LAPT-406") es el código VERDADERO para ese
  // activo: crea el Asset si no existe, o lo actualiza si ya existe.
  //
  // Si aparece otro activo con el mismo número de serie pero un código
  // distinto, se considera un duplicado (alta manual repetida del mismo
  // equipo físico) y se elimina. Si ese duplicado ya tiene historial real
  // (asignaciones, préstamos, capacidades de almacenamiento), Postgres
  // rechaza el borrado por integridad referencial: en vez de forzarlo y
  // perder ese historial, se deja señalado para revisión manual.
  //
  // Limitación conocida: si esto reasigna el activo a otra persona, NO se
  // crea un AssignmentHistory (eso lo maneja únicamente el flujo normal de
  // asignaciones); solo se actualiza el campo directo del activo.
  async sincronizarDesdeHwid(dto: SyncHwidAssetDto) {
    try {
      const duplicadosEliminados: string[] = [];
      const duplicadosConHistorial: string[] = [];

      const serial = dto.serialNumber?.trim();
      if (serial) {
        const duplicados = await this.prisma.asset.findMany({
          where: { serialNumber: serial, assetCode: { not: dto.assetCode } },
        });
        for (const dup of duplicados) {
          try {
            await this.prisma.asset.delete({ where: { id: dup.id } });
            duplicadosEliminados.push(dup.assetCode);
          } catch {
            duplicadosConHistorial.push(dup.assetCode);
          }
        }
      }

      let branchId: number | undefined;
      const sucursal = dto.sucursal?.trim();
      if (sucursal) {
        const branch = await this.prisma.branch.findFirst({
          where: { name: { equals: sucursal, mode: 'insensitive' } },
        });
        branchId = branch?.id;
      }

      let persona: { id: number; codigo: string | null } | null = null;
      const cedula = dto.cedula?.trim();
      if (cedula) {
        const resultado = await this.peopleService.findByCedulaConFallback(cedula);
        if (resultado.match !== 'none' && resultado.cedulaEncontrada) {
          persona = await this.prisma.person.findUnique({
            where: { nationalId: resultado.cedulaEncontrada },
            select: { id: true, codigo: true },
          });
        }
      }

      const datosBase: any = {
        assetType: dto.assetType,
        serialNumber: serial || undefined,
        brand: dto.brand?.trim() || undefined,
        model: dto.model?.trim() || undefined,
        attributesJson: dto.attributesJson || undefined,
        ...(branchId !== undefined ? { branchId } : {}),
        ...(persona ? { assignedPersonId: persona.id, status: 'assigned' as const } : {}),
      };

      // Comparación exacta de assetCode NO alcanza: códigos cargados a mano
      // alguna vez quedaron con espacios ("LAPT - 006") y el que manda
      // HWIDApp siempre viene sin ellos ("LAPT-006"). Si no se normaliza,
      // esto se trataba como "otro equipo" y se creaba un duplicado en blanco
      // en vez de actualizar el que ya tenía sus datos (fecha de compra,
      // entrega, etc.). Al encontrar el existente por código normalizado, se
      // reescribe también su assetCode al formato correcto de una vez.
      const normalizarCodigo = (c: string) => String(c || '').replace(/\s+/g, '').toUpperCase();
      const candidatos = await this.prisma.asset.findMany({ select: { id: true, assetCode: true } });
      let coincidencia: { id: number; assetCode: string } | undefined;

      // Si conocemos a la persona (por cédula), el equipo del MISMO TIPO que
      // ya tiene asignado es, sin ninguna ambigüedad, el mismo objeto físico
      // visto bajo su código anterior — se prioriza esto sobre buscar por
      // texto de código. Si no, buscar solo por código podía "enganchar" por
      // error el equipo de OTRA persona que coincidía de casualidad en el
      // número (así se mezclaron los equipos de Zoila y Jair al compartir el
      // número 006 sin ninguna relación real entre ellos).
      if (persona) {
        const propio = await this.prisma.asset.findFirst({
          where: { assignedPersonId: persona.id, assetType: dto.assetType },
          select: { id: true, assetCode: true },
        });
        if (propio) coincidencia = propio;
      }

      // Si no hay persona, o no tiene nada de ese tipo todavía: comparación
      // por código, ignorando espacios (algunos se cargaron a mano como
      // "LAPT - 006" en vez de "LAPT-006").
      if (!coincidencia) {
        coincidencia = candidatos.find((a) => normalizarCodigo(a.assetCode) === normalizarCodigo(dto.assetCode));
      }

      // Intercambio automático: si el código de destino YA lo tiene otro
      // activo (uno que no es el que estamos actualizando — ej. la laptop de
      // Jair traía "LAPT - 006" cargado a mano desde antes, sin relación con
      // este sistema), y esta actualización deja libre un código propio
      // (el anterior de "coincidencia"), se lo damos a ese otro activo en
      // vez de fallar por el índice único o dejarlo huérfano. Así nunca hace
      // falta arreglar esto a mano: quien pierde el número se queda con el
      // que la otra parte deja libre, como cambiar de lugar dos personas.
      const codigoQueQuedaLibre =
        coincidencia && normalizarCodigo(coincidencia.assetCode) !== normalizarCodigo(dto.assetCode)
          ? coincidencia.assetCode.replace(/\s+/g, '') // de paso, formato canónico sin espacios
          : undefined;
      if (codigoQueQuedaLibre) {
        const ocupante = candidatos.find(
          (a) => normalizarCodigo(a.assetCode) === normalizarCodigo(dto.assetCode) && a.id !== coincidencia?.id,
        );
        if (ocupante) {
          await this.prisma.asset.update({ where: { id: ocupante.id }, data: { assetCode: codigoQueQuedaLibre } });
        }
      }

      const activo = coincidencia
        ? await this.prisma.asset.update({
            where: { id: coincidencia.id },
            data: { ...datosBase, assetCode: dto.assetCode },
          })
        : await this.prisma.asset.create({
            data: { assetCode: dto.assetCode, status: persona ? 'assigned' : 'available', ...datosBase },
          });

      if (persona) {
        const numero = /-(\d+)$/.exec(dto.assetCode)?.[1];
        // Siempre se vuelve a propagar, aunque el código ya coincida: es
        // idempotente (aplicarCodigoDePersona no toca lo que ya está bien) y
        // así, si algún activo se quedó "pegado" con el número viejo por
        // cualquier motivo (como pasó con un código cargado con espacios),
        // se autocorrige solo en el siguiente envío en vez de quedar
        // atascado hasta que alguien lo note y lo arregle a mano.
        if (numero) {
          await this.peopleService.establecerCodigoDesdeHwid(persona.id, numero);
        }
      }

      return {
        asset: activo,
        personaVinculada: persona?.id ?? null,
        duplicadosEliminados,
        duplicadosConHistorial,
      };
    } catch (error) {
      handlePrismaError(error, 'Activo (sincronización HWID)');
    }
  }
}
