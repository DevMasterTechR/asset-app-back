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
    UseGuards,
    Request,
} from '@nestjs/common';
import { AssignmentHistoryService } from './assignment-history.service';
import { CreateAssignmentHistoryDto } from './dto/create-assignment-history.dto';
import { UpdateAssignmentHistoryDto } from './dto/update-assignment-history.dto';
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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Assignment History')
@UseGuards(JwtAuthGuard)
@Controller('assignment-history')
export class AssignmentHistoryController {
    constructor(private readonly service: AssignmentHistoryService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear un nuevo historial de asignación' })
    @ApiBody({ type: CreateAssignmentHistoryDto })
    @ApiCreatedResponse({
        description: 'Historial creado exitosamente',
        type: CreateAssignmentHistoryDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos para crear historial',
    })
    create(@Body() dto: CreateAssignmentHistoryDto) {
        return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los historiales de asignación' })
    @ApiOkResponse({
        description: 'Lista de historiales obtenida',
        type: [CreateAssignmentHistoryDto],
    })
    findAll() {
        return this.service.findAll();
    }

    @Get('user/my-assignments')
    @UseGuards(RolesGuard)
    @Roles('Admin', 'Usuario')
    @ApiOperation({ summary: 'Obtener asignaciones del usuario conectado' })
    @ApiOkResponse({
        description: 'Lista de asignaciones del usuario',
        type: [CreateAssignmentHistoryDto],
    })
    findMyAssignments(@Request() req) {
        // req.user.sub es el personId (viene del JWT)
        const personId = req.user.personId || req.user.sub;
        return this.service.findByPersonId(personId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un historial por ID' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID del historial',
        example: 1,
    })
    @ApiOkResponse({
        description: 'Historial encontrado',
        type: CreateAssignmentHistoryDto,
    })
    @ApiNotFoundResponse({ description: 'Historial no encontrado' })
    @ApiBadRequestResponse({ description: 'ID inválido' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un historial de asignación' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID del historial a actualizar',
        example: 1,
    })
    @ApiBody({ type: UpdateAssignmentHistoryDto })
    @ApiOkResponse({
        description: 'Historial actualizado',
        type: UpdateAssignmentHistoryDto,
    })
    @ApiNotFoundResponse({ description: 'Historial no encontrado' })
    @ApiBadRequestResponse({ description: 'Datos inválidos para actualizar' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAssignmentHistoryDto,
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Eliminar un historial de asignación' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID del historial a eliminar',
        example: 1,
    })
    @ApiOkResponse({ description: 'Historial eliminado exitosamente' })
    @ApiNotFoundResponse({ description: 'Historial no encontrado' })
    @ApiBadRequestResponse({ description: 'ID inválido' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
