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
  NotFoundException,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateStorageDto) {
    return this.storageService.create(dto);
  }

  @Get()
  findAll() {
    return this.storageService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const storage = await this.storageService.findOne(id);
    if (!storage) {
      throw new NotFoundException(`Storage with ID ${id} not found`);
    }
    return storage;
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStorageDto,
  ) {
    const updated = await this.storageService.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Storage with ID ${id} not found`);
    }
    return updated;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.storageService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Storage with ID ${id} not found`);
    }
    return;
  }
}
