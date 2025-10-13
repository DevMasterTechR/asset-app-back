import {
    Controller, Get, Post, Body, Param, Put, Delete,
    ParseIntPipe, HttpCode, HttpStatus, NotFoundException,
} from '@nestjs/common';
import {
    ApiTags, ApiOperation, ApiParam, ApiBody,
    ApiCreatedResponse, ApiOkResponse, ApiNoContentResponse,
    ApiBadRequestResponse, ApiNotFoundResponse,
} from '@nestjs/swagger';

import { StorageService } from './storage.service';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';


const ApiIdParam = () =>
    ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID del almacenamiento',
        example: 1,
    });

const ApiBadRequest = (description = 'Datos de entrada inválidos') =>
    ApiBadRequestResponse({ description });

const ApiNotFound = (description = 'Almacenamiento no encontrado') =>
    ApiNotFoundResponse({ description });


@ApiTags('Storage')
@AdminOnly()
@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear un nuevo almacenamiento' })
    @ApiCreatedResponse({
        description: 'Almacenamiento creado exitosamente',
        type: CreateStorageDto,
    })
    @ApiBody({ type: CreateStorageDto })
    @ApiBadRequest()
    create(@Body() dto: CreateStorageDto) {
        return this.storageService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los almacenamientos' })
    @ApiOkResponse({
        description: 'Lista de almacenamientos',
        type: [CreateStorageDto],
    })
    findAll() {
        return this.storageService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un almacenamiento por ID' })
    @ApiIdParam()
    @ApiOkResponse({
        description: 'Almacenamiento encontrado',
        type: CreateStorageDto,
    })
    @ApiNotFound()
    @ApiBadRequest('ID inválido')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const storage = await this.storageService.findOne(id);
        if (!storage) {
            throw new NotFoundException(`Storage with ID ${id} not found`);
        }
        return storage;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un almacenamiento' })
    @ApiIdParam()
    @ApiBody({ type: UpdateStorageDto })
    @ApiOkResponse({
        description: 'Actualizado exitosamente',
        type: UpdateStorageDto,
    })
    @ApiNotFound()
    @ApiBadRequest()
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStorageDto) {
        const updated = await this.storageService.update(id, dto);
        if (!updated) {
            throw new NotFoundException(`Storage with ID ${id} not found`);
        }
        return updated;
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar un almacenamiento' })
    @ApiIdParam()
    @ApiNoContentResponse({ description: 'Eliminado exitosamente' })
    @ApiNotFound()
    @ApiBadRequest('ID inválido')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const deleted = await this.storageService.remove(id);
        if (!deleted) {
            throw new NotFoundException(`Storage with ID ${id} not found`);
        }
    }
}
