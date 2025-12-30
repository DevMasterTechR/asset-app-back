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
import { KeyboardService } from './keyboard.service';
import { CreateKeyboardDto } from './dto/create-keyboard.dto';
import { UpdateKeyboardDto } from './dto/update-keyboard.dto';

@ApiTags('keyboard')
@Controller('keyboard')
export class KeyboardController {
  constructor(private readonly keyboardService: KeyboardService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo teclado' })
  create(@Body() createKeyboardDto: CreateKeyboardDto) {
    return this.keyboardService.create(createKeyboardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los teclados' })
  findAll() {
    return this.keyboardService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un teclado por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.keyboardService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un teclado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKeyboardDto: UpdateKeyboardDto,
  ) {
    return this.keyboardService.update(id, updateKeyboardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un teclado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.keyboardService.remove(id);
  }
}
