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
    create(@Body() dto: CreateAssetDto) {
        return this.assetsService.create(dto);
    }

    @Get()
    @AdminOnly()
    @ApiOperation({ summary: 'Obtener todos los activos' })
    @ApiOkResponse({ description: 'Lista de activos', type: [CreateAssetDto] })
    findAll() {
        return this.assetsService.findAll();
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
