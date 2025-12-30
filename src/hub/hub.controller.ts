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
import { HubService } from './hub.service';
import { CreateHubDto } from './dto/create-hub.dto';
import { UpdateHubDto } from './dto/update-hub.dto';

@ApiTags('hub')
@Controller('hub')
export class HubController {
  constructor(private readonly hubService: HubService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un Hub USB' })
  create(@Body() createHubDto: CreateHubDto) {
    return this.hubService.create(createHubDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los Hubs USB' })
  findAll() {
    return this.hubService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un Hub USB por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hubService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un Hub USB' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHubDto: UpdateHubDto,
  ) {
    return this.hubService.update(id, updateHubDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un Hub USB' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.hubService.remove(id);
  }
}
