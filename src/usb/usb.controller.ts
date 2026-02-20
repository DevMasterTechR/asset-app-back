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
import { UsbService } from './usb.service';
import { CreateUsbDto } from './dto/create-usb.dto';
import { UpdateUsbDto } from './dto/update-usb.dto';

@ApiTags('usb')
@Controller('usb')
export class UsbController {
  constructor(private readonly usbService: UsbService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo USB' })
  create(@Body() createUsbDto: CreateUsbDto) {
    return this.usbService.create(createUsbDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los USBs' })
  findAll() {
    return this.usbService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un USB por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usbService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un USB' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsbDto: UpdateUsbDto,
  ) {
    return this.usbService.update(id, updateUsbDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un USB' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usbService.remove(id);
  }
}
