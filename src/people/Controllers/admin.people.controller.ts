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
    NotFoundException,
    Query,
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


import { AdminOnly } from 'src/common/decorators/admin-only.decorator';
import { PeopleService } from '../people.service';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';

const ApiIdParam = () =>
    ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID de la persona',
        example: 1,
    });

const ApiBadRequest = (description = 'Datos inválidos') =>
    ApiBadRequestResponse({ description });

const ApiNotFound = (description = 'Persona no encontrada') =>
    ApiNotFoundResponse({ description });

@ApiTags('People')
@AdminOnly()
@Controller('people')
export class AdminPeopleController {
    constructor(private readonly peopleService: PeopleService) { }

    @Post()

    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear una nueva persona' })
    @ApiCreatedResponse({
        description: 'Persona creada exitosamente',
        type: CreatePersonDto,
    })
    @ApiBadRequest()
    @ApiBody({ type: CreatePersonDto })
    create(@Body() dto: CreatePersonDto) {
        return this.peopleService.create(dto);
    }

    @Get()

    @ApiOperation({ summary: 'Obtener todas las personas (soporta búsqueda y paginación con query params q,page,limit)' })
    @ApiOkResponse({
        description: 'Lista de personas (paginated)',
        type: [CreatePersonDto],
    })
    findAll(@Query('q') q?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
        const pageNum = page ? Number(page) : undefined;
        const limitNum = limit ? Number(limit) : undefined;
        return this.peopleService.findAll(q, pageNum, limitNum);
    }

    @Get(':id')

    @ApiOperation({ summary: 'Obtener persona por ID' })
    @ApiIdParam()
    @ApiOkResponse({ description: 'Persona encontrada', type: CreatePersonDto })
    @ApiNotFound()
    @ApiBadRequest('ID inválido')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const person = await this.peopleService.findOne(id);
        if (!person)
            throw new NotFoundException(`Person with ID ${id} not found`);
        return person;
    }

    @Put(':id')

    @ApiOperation({ summary: 'Actualizar una persona' })
    @ApiIdParam()
    @ApiBody({ type: UpdatePersonDto })
    @ApiOkResponse({
        description: 'Persona actualizada',
        type: UpdatePersonDto,
    })
    @ApiNotFound()
    @ApiBadRequest()
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePersonDto,
    ) {
        const updated = await this.peopleService.update(id, dto);
        if (!updated)
            throw new NotFoundException(`Person with ID ${id} not found`);
        return updated;
    }

    @Delete(':id')

    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar una persona' })
    @ApiIdParam()
    @ApiNoContentResponse({ description: 'Persona eliminada' })
    @ApiNotFound()
    @ApiBadRequest('ID inválido')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const deleted = await this.peopleService.remove(id);
        if (!deleted)
            throw new NotFoundException(`Person with ID ${id} not found`);
    }

}
