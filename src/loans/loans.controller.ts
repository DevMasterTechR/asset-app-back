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
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
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

@ApiTags('Loans')
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
    constructor(private readonly service: LoansService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear un nuevo préstamo' })
    @ApiBody({ type: CreateLoanDto })
    @ApiCreatedResponse({
        description: 'Préstamo creado exitosamente',
        type: CreateLoanDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos para crear préstamo',
    })
    create(@Body() dto: CreateLoanDto) {
        return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los préstamos' })
    @ApiOkResponse({
        description: 'Lista de préstamos obtenida',
        type: [CreateLoanDto],
    })
    findAll() {
        return this.service.findAll();
    }

    @Get('user/my-loans')
    @UseGuards(RolesGuard)
    @Roles('Admin', 'Usuario', 'Recursos Humanos', 'RRHH', 'Human Resources')
    @ApiOperation({ summary: 'Obtener préstamos del usuario conectado' })
    @ApiOkResponse({
        description: 'Lista de préstamos del usuario',
        type: [CreateLoanDto],
    })
    findMyLoans(@Request() req) {
        // req.user.sub es el personId (viene del JWT)
        const personId = req.user.personId || req.user.sub;
        return this.service.findByPersonId(personId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un préstamo por ID' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID del préstamo',
        example: 1,
    })
    @ApiOkResponse({
        description: 'Préstamo encontrado',
        type: CreateLoanDto,
    })
    @ApiNotFoundResponse({ description: 'Préstamo no encontrado' })
    @ApiBadRequestResponse({ description: 'ID inválido' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un préstamo' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID del préstamo',
        example: 1,
    })
    @ApiBody({ type: UpdateLoanDto })
    @ApiOkResponse({
        description: 'Préstamo actualizado exitosamente',
        type: UpdateLoanDto,
    })
    @ApiNotFoundResponse({ description: 'Préstamo no encontrado' })
    @ApiBadRequestResponse({ description: 'Datos inválidos o ID inválido' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLoanDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar un préstamo' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID del préstamo',
        example: 1,
    })
    @ApiNoContentResponse({
        description: 'Préstamo eliminado exitosamente',
    })
    @ApiNotFoundResponse({ description: 'Préstamo no encontrado' })
    @ApiBadRequestResponse({ description: 'ID inválido' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
