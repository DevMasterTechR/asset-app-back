import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UtpCableService } from './utp-cable.service';
import { CreateUtpCableDto } from './dto/create-utp-cable.dto';
import { UpdateUtpCableDto } from './dto/update-utp-cable.dto';

@Controller('utp-cables')
export class UtpCableController {
  constructor(private readonly utpCableService: UtpCableService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUtpCableDto) {
    return this.utpCableService.create(dto);
  }

  @Get()
  findAll() {
    return this.utpCableService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.utpCableService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUtpCableDto,
  ) {
    return this.utpCableService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.utpCableService.remove(id);
  }
}
