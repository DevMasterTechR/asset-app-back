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
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

// ✅ Reutilizables
const ApiIdParam = () =>
  ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID de la sucursal',
    example: 1,
  });

const ApiBadRequest = (description = 'Solicitud inválida') =>
  ApiBadRequestResponse({ description });

const ApiNotFound = (description = 'Sucursal no encontrada') =>
  ApiNotFoundResponse({ description });


@ApiTags('Branches')
@UseGuards(JwtAuthGuard, SessionGuard,RolesGuard)
@AdminOnly()
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva sucursal' })
  @ApiCreatedResponse({
    description: 'Sucursal creada correctamente',
    type: CreateBranchDto,
  })
  @ApiBadRequest()
  @ApiBody({ type: CreateBranchDto })
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las sucursales' })
  @ApiOkResponse({
    description: 'Lista de sucursales',
    type: [CreateBranchDto],
  })
  findAll() {
    return this.branchesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sucursal por ID' })
  @ApiIdParam()
  @ApiOkResponse({
    description: 'Sucursal encontrada',
    type: CreateBranchDto,
  })
  @ApiNotFound()
  @ApiBadRequest()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const branch = await this.branchesService.findOne(id);
    if (!branch) throw new NotFoundException(`Branch with ID ${id} not found`);
    return branch;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una sucursal' })
  @ApiIdParam()
  @ApiBody({ type: UpdateBranchDto })
  @ApiOkResponse({
    description: 'Sucursal actualizada correctamente',
    type: UpdateBranchDto,
  })
  @ApiNotFound()
  @ApiBadRequest()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBranchDto,
  ) {
    const updated = await this.branchesService.update(id, dto);
    if (!updated) throw new NotFoundException(`Branch with ID ${id} not found`);
    return updated;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una sucursal' })
  @ApiIdParam()
  @ApiNoContentResponse({ description: 'Sucursal eliminada correctamente' })
  @ApiNotFound()
  @ApiBadRequest()
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.branchesService.remove(id);
    if (!deleted) throw new NotFoundException(`Branch with ID ${id} not found`);
  }
}
