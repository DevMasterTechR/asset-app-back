import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
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

import { SimCardsService } from './sim-cards.service';
import { CreateSimCardDto } from './dto/create-sim-card.dto';
import { UpdateSimCardDto } from './dto/update-sim-card.dto';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';


const ApiIdParam = () =>
    ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID de la tarjeta SIM',
        example: 1,
    });

const ApiBadRequest = (description = 'Datos inválidos') =>
    ApiBadRequestResponse({ description });

const ApiNotFound = (description = 'Tarjeta SIM no encontrada') =>
    ApiNotFoundResponse({ description });


@ApiTags('Sim Cards')
@AdminOnly()
@Controller('sim-cards')
export class SimCardsController {
    constructor(private readonly service: SimCardsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear una tarjeta SIM' })
    @ApiCreatedResponse({ description: 'Tarjeta SIM creada', type: CreateSimCardDto })
    @ApiBadRequest()
    @ApiBody({ type: CreateSimCardDto })
    create(@Body() dto: CreateSimCardDto) {
        return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas las tarjetas SIM' })
    @ApiOkResponse({ description: 'Lista de tarjetas SIM', type: [CreateSimCardDto] })
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una tarjeta SIM por ID' })
    @ApiIdParam()
    @ApiOkResponse({ description: 'Tarjeta SIM encontrada', type: CreateSimCardDto })
    @ApiNotFound()
    @ApiBadRequest('ID inválido')
    findOne(@Param('id', ParseIntPipe) id: number) {
        const sim = this.service.findOne(id);
        if (!sim) throw new NotFoundException(`SIM card with ID ${id} not found`);
        return sim;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar una tarjeta SIM' })
    @ApiIdParam()
    @ApiBody({ type: UpdateSimCardDto })
    @ApiOkResponse({ description: 'Tarjeta SIM actualizada', type: UpdateSimCardDto })
    @ApiNotFound()
    @ApiBadRequest()
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSimCardDto) {
        const updated = this.service.update(id, dto);
        if (!updated) throw new NotFoundException(`SIM card with ID ${id} not found`);
        return updated;
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar una tarjeta SIM' })
    @ApiIdParam()
    @ApiNoContentResponse({ description: 'Tarjeta SIM eliminada' })
    @ApiNotFound()
    @ApiBadRequest('ID inválido')
    remove(@Param('id', ParseIntPipe) id: number) {
        const deleted = this.service.remove(id);
        if (!deleted) throw new NotFoundException(`SIM card with ID ${id} not found`);
    }
}
