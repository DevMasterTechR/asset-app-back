import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    ParseIntPipe,
    UseGuards,
    Request,
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
    ApiBearerAuth,
} from '@nestjs/swagger';

import { PeopleService } from './people.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
// ✅ Decoradores reutilizables
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
@Controller('people')
export class PeopleController {
    constructor(private readonly peopleService: PeopleService) {}

    @Post()
    @UseGuards(JwtAuthGuard, SessionGuard)
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
    @UseGuards(JwtAuthGuard, SessionGuard)
    @ApiOperation({ summary: 'Obtener todas las personas' })
    @ApiOkResponse({
        description: 'Lista de personas',
        type: [CreatePersonDto],
    })
    findAll() {
        return this.peopleService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, SessionGuard)
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
    @UseGuards(JwtAuthGuard, SessionGuard)
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
    @UseGuards(JwtAuthGuard, SessionGuard)
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

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
    @ApiBearerAuth() // <- IMPORTANTE para mostrar el botón "Authorize" en Swagger
    @ApiOkResponse({
        description: 'Perfil del usuario autenticado',
        schema: {
            example: {
                sub: 12,
                email: 'usuario@ejemplo.com',
                role: 'ADMIN',
                iat: 1699999999,
                exp: 1700003599,
            },
        },
    })
    getProfile(@Request() req) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return req.user;
    }
}
