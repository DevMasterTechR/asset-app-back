import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MouseService } from './mouse.service';
import { CreateMouseDto } from './dto/create-mouse.dto';
import { UpdateMouseDto } from './dto/update-mouse.dto';

@ApiTags('mouse')
@Controller('mouse')
export class MouseController {
  constructor(private readonly mouseService: MouseService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo mouse' })
  create(@Body() createMouseDto: CreateMouseDto) {
    return this.mouseService.create(createMouseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los mouse' })
  findAll() {
    return this.mouseService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un mouse por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mouseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un mouse' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMouseDto: UpdateMouseDto,
  ) {
    return this.mouseService.update(id, updateMouseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un mouse' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mouseService.remove(id);
  }
}
