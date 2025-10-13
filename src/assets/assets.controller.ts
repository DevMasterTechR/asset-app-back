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
    Req,
    BadRequestException,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiNoContentResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
} from '@nestjs/swagger';

import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';
import { UserOnly } from 'src/common/decorators/user-only.decorator';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SessionGuard } from 'src/auth/guards/session.guard';

@ApiTags('Assets')
@UseGuards(JwtAuthGuard, SessionGuard)
@Controller('assets')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) {}

    @Post()
    @AdminOnly()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear un nuevo activo' })
    @ApiCreatedResponse({ description: 'Activo creado exitosamente', type: CreateAssetDto })
    @ApiBadRequestResponse({ description: 'Datos inválidos para crear un activo' })
    @ApiBody({ type: CreateAssetDto })
    create(@Body() dto: CreateAssetDto) {
        return this.assetsService.create(dto);
    }

    @Get()
    @AdminOnly()
    @ApiOperation({ summary: 'Obtener todos los activos' })
    @ApiOkResponse({ description: 'Lista de activos', type: [CreateAssetDto] })
    findAll() {
        return this.assetsService.findAll();
    }

    @Get(':id')
    @AdminOnly()
    @ApiOperation({ summary: 'Obtener un activo por ID (admin)' })
    @ApiParam({ name: 'id', type: 'number', example: 1 })
    @ApiOkResponse({ description: 'Activo encontrado', type: CreateAssetDto })
    @ApiNotFoundResponse({ description: 'Activo no encontrado' })
    @ApiBadRequestResponse({ description: 'ID inválido' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.assetsService.findOne(id);
    }

    @Put(':id')
    @AdminOnly()
    @ApiOperation({ summary: 'Actualizar un activo' })
    @ApiParam({ name: 'id', type: 'number', example: 1 })
    @ApiBody({ type: UpdateAssetDto })
    @ApiOkResponse({ description: 'Activo actualizado', type: UpdateAssetDto })
    @ApiNotFoundResponse({ description: 'Activo no encontrado' })
    @ApiBadRequestResponse({ description: 'Datos inválidos' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAssetDto) {
        return this.assetsService.update(id, dto);
    }

    @Delete(':id')
    @AdminOnly()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar un activo' })
    @ApiParam({ name: 'id', type: 'number', example: 1 })
    @ApiNoContentResponse({ description: 'Activo eliminado' })
    @ApiNotFoundResponse({ description: 'Activo no encontrado' })
    @ApiBadRequestResponse({ description: 'ID inválido' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.assetsService.remove(id);
    }

    @Get('my-assets')
    @ApiOperation({ summary: 'Obtener activos propios del usuario autenticado' })
    findMyAssets(@Req() req: RequestWithUser) {
        const userId = req.user?.sub;
        if (!userId) {
        throw new BadRequestException('ID de usuario no encontrado en la sesión');
        }

        return this.assetsService.findAllByUser(userId);
    }

    @Get('my-assets/:id')
    @UserOnly()
    @ApiOperation({ summary: 'Obtener un activo propio por ID' })
    @ApiParam({ name: 'id', type: 'number', example: 1 })
    @ApiOkResponse({ description: 'Activo encontrado', type: CreateAssetDto })
    @ApiNotFoundResponse({ description: 'Activo no encontrado o no pertenece al usuario' })
    findMyAssetById(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: RequestWithUser,
    ) {
                const userId = req.user?.sub;
        if (!userId) {
        throw new BadRequestException('ID de usuario no encontrado en la sesión');
        }

        return this.assetsService.findOneOwnedByUser(id, userId);
    }
}
