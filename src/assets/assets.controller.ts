import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    Req,
    BadRequestException,
    UseGuards,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiNoContentResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse, 
} from '@nestjs/swagger';

import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';
import { Authenticated } from 'src/common/decorators/authenticated.decorator';

@ApiTags('Assets')
@AdminOnly()
@Controller('assets')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Post()
    @AdminOnly()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear un nuevo activo' })
    @ApiCreatedResponse({ description: 'Activo creado exitosamente', type: CreateAssetDto })
    @ApiBadRequestResponse({ description: 'Datos inválidos para crear un activo' })
    @ApiBody({ type: CreateAssetDto })
    create(@Req() req: any, @Body() dto: CreateAssetDto) {
        // Log temporal para diagnosticar por qué algunas peticiones llegan
        // no autenticadas (401). Esto se quitará cuando confirmemos el
        // comportamiento esperado.
        try {
            // No usar console.log pesado en producción; es temporal.
            // eslint-disable-next-line no-console
            console.log('[DEBUG] AssetsController.create req.user =', req.user);
        } catch (e) {
            // Ignorar cualquier error de logging
        }
        return this.assetsService.create(dto);
    }

    @Get()
    @AdminOnly()
    @ApiOperation({ summary: 'Obtener todos los activos (soporta búsqueda y paginación con q,page,limit)' })
    @ApiOkResponse({ description: 'Lista de activos (paginated)', type: [CreateAssetDto] })
    findAll(@Query('q') q?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
        const pageNum = page ? Number(page) : undefined;
        const limitNum = limit ? Number(limit) : undefined;
        return this.assetsService.findAll(q, pageNum ?? 1, limitNum ?? 10);
    }

    @Get('public')
    @Authenticated()
    @ApiOperation({ summary: 'Obtener todos los activos (vista pública para usuarios autenticados). Soporta q,page,limit.' })
    @ApiOkResponse({ description: 'Lista pública de activos (paginated)', type: [CreateAssetDto] })
    findAllPublic(@Query('q') q?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
        const pageNum = page ? Number(page) : undefined;
        const limitNum = limit ? Number(limit) : undefined;
        return this.assetsService.findAll(q, pageNum ?? 1, limitNum ?? 10);
    }

    @Get(':id')
    @AdminOnly()
    @ApiOperation({ summary: 'Obtener un activo por ID (admin)' })
    @ApiParam({ name: 'id', type: 'number', example: 1 })
    @ApiOkResponse({ description: 'Activo encontrado', type: CreateAssetDto })
    @ApiNotFoundResponse({ description: 'Activo no encontrado' })
    @ApiBadRequestResponse({ description: 'ID inválido' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.assetsService.findOne(id);
    }

    @Put(':id')
    @AdminOnly()
    @ApiOperation({ summary: 'Actualizar un activo' })
    @ApiParam({ name: 'id', type: 'number', example: 1 })
    @ApiBody({ type: UpdateAssetDto })
    @ApiOkResponse({ description: 'Activo actualizado', type: UpdateAssetDto })
    @ApiNotFoundResponse({ description: 'Activo no encontrado' })
    @ApiBadRequestResponse({ description: 'Datos inválidos' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAssetDto) {
        return this.assetsService.update(id, dto);
    }

    @Delete(':id')
    @AdminOnly()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar un activo' })
    @ApiParam({ name: 'id', type: 'number', example: 1 })
    @ApiNoContentResponse({ description: 'Activo eliminado' })
    @ApiNotFoundResponse({ description: 'Activo no encontrado' })
    @ApiBadRequestResponse({ description: 'ID inválido' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.assetsService.remove(id);
    }
}
