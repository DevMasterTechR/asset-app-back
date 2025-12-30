import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MousePadService } from './mouse-pad.service';
import { CreateMousePadDto } from './dto/create-mouse-pad.dto';
import { UpdateMousePadDto } from './dto/update-mouse-pad.dto';

@ApiTags('mouse-pad')
@Controller('mouse-pad')
export class MousePadController {
  constructor(private readonly service: MousePadService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo mouse pad' })
  create(@Body() dto: CreateMousePadDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los mouse pad' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener mouse pad por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar mouse pad' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMousePadDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar mouse pad' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
