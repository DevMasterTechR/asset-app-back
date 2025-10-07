import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Roles') // <--- Agrupa este controlador en Swagger
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiResponse({ status: 201, description: 'Rol creado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los roles' })
  @ApiResponse({ status: 200, description: 'Lista de roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por su ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del rol' })
  @ApiResponse({ status: 200, description: 'Rol encontrado' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un rol existente' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del rol' })
  @ApiResponse({ status: 200, description: 'Rol actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un rol' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del rol' })
  @ApiResponse({ status: 200, description: 'Rol eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}
