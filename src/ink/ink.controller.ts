import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    ParseIntPipe,
    HttpStatus,
    HttpCode,
    NotFoundException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiBody,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
} from '@nestjs/swagger';

import { InkService } from './ink.service';
import { CreateInkDto } from './dto/create-ink.dto';
import { UpdateInkDto } from './dto/update-ink.dto';

import { AdminOnly } from 'src/common/decorators/admin-only.decorator';

const ApiIdParam = () =>
    ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID de la tinta',
        example: 1,
    });

const ApiBadRequest = (description = 'Datos inválidos') =>
    ApiBadRequestResponse({ description });

const ApiNotFound = (description = 'Tinta no encontrada') =>
    ApiNotFoundResponse({ description });


@ApiTags('Inks')
@AdminOnly()
@Controller('inks')
export class InkController {
    constructor(private readonly inkService: InkService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear una nueva tinta' })
    @ApiCreatedResponse({
        description: 'Tinta creada exitosamente',
        type: CreateInkDto,
    })
    @ApiBadRequest()
    @ApiBody({ type: CreateInkDto })
    create(@Body() dto: CreateInkDto) {
        return this.inkService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas las tintas' })
    @ApiOkResponse({
        description: 'Lista de tintas',
        type: [CreateInkDto],
    })
    findAll() {
        return this.inkService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener tinta por ID' })
    @ApiIdParam()
    @ApiOkResponse({ description: 'Tinta encontrada', type: CreateInkDto })
    @ApiNotFound()
    @ApiBadRequest('ID inválido')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const ink = await this.inkService.findOne(id);
        if (!ink) throw new NotFoundException(`Ink with ID ${id} not found`);
        return ink;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar tinta por ID' })
    @ApiIdParam()
    @ApiBody({ type: UpdateInkDto })
    @ApiOkResponse({
        description: 'Tinta actualizada exitosamente',
        type: UpdateInkDto,
    })
    @ApiNotFound()
    @ApiBadRequest()
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateInkDto,
    ) {
        const updated = await this.inkService.update(id, dto);
        if (!updated) throw new NotFoundException(`Ink with ID ${id} not found`);
        return updated;
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar tinta por ID' })
    @ApiIdParam()
    @ApiNoContentResponse({ description: 'Tinta eliminada exitosamente' })
    @ApiNotFound()
    @ApiBadRequest()
    async remove(@Param('id', ParseIntPipe) id: number) {
        const deleted = await this.inkService.remove(id);
        if (!deleted) throw new NotFoundException(`Ink with ID ${id} not found`);
    }
}
