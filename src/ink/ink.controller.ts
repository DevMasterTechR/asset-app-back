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
} from '@nestjs/common';
import { InkService } from './ink.service';
import { CreateInkDto } from './dto/create-ink.dto';
import { UpdateInkDto } from './dto/update-ink.dto';

@Controller('inks')
export class InkController {
  constructor(private readonly inkService: InkService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateInkDto) {
    return this.inkService.create(dto);
  }

  @Get()
  findAll() {
    return this.inkService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inkService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInkDto,
  ) {
    return this.inkService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inkService.remove(id);
  }
}
