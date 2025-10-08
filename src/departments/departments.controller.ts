import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

// ✅ Decoradores reutilizables
const ApiIdParam = () =>
  ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del departamento',
    example: 1,
  });

const ApiBadRequest = (description = 'Solicitud inválida') =>
  ApiBadRequestResponse({ description });

const ApiNotFound = (description = 'Departamento no encontrado') =>
  ApiNotFoundResponse({ description });

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo departamento' })
  @ApiCreatedResponse({
    description: 'Departamento creado correctamente',
    type: CreateDepartmentDto,
  })
  @ApiBadRequest()
  @ApiBody({ type: CreateDepartmentDto })
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los departamentos' })
  @ApiOkResponse({
    description: 'Lista de departamentos',
    type: [CreateDepartmentDto],
  })
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un departamento por ID' })
  @ApiIdParam()
  @ApiOkResponse({ description: 'Departamento encontrado', type: CreateDepartmentDto })
  @ApiNotFound()
  @ApiBadRequest()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const dept = await this.departmentsService.findOne(id);
    if (!dept) throw new NotFoundException(`Department with ID ${id} not found`);
    return dept;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un departamento por ID' })
  @ApiIdParam()
  @ApiBody({ type: UpdateDepartmentDto })
  @ApiOkResponse({ description: 'Departamento actualizado', type: UpdateDepartmentDto })
  @ApiNotFound()
  @ApiBadRequest()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ) {
    const updated = await this.departmentsService.update(id, dto);
    if (!updated) throw new NotFoundException(`Department with ID ${id} not found`);
    return updated;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un departamento por ID' })
  @ApiIdParam()
  @ApiNoContentResponse({ description: 'Departamento eliminado correctamente' })
  @ApiNotFound()
  @ApiBadRequest()
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.departmentsService.remove(id);
    if (!deleted) throw new NotFoundException(`Department with ID ${id} not found`);
  }
}
