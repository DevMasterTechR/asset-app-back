import {
  Controller,
  Get,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PeopleService } from '../people.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserOnly } from 'src/common/decorators/user-only.decorator';

@ApiTags('User')
@UserOnly()
@ApiBearerAuth()
@Controller('/user')

export class UserPeopleController {
  constructor(private readonly peopleService: PeopleService) {}

@Get()
@ApiOperation({ summary: 'Obtener datos del usuario autenticado' })
@ApiOkResponse({ description: 'Datos del usuario obtenidos con éxito' })
@ApiUnauthorizedResponse({ description: 'No autorizado' })
async getCurrentUser(@Req() req: Request) {
  const user = req.user as { sub: number };

  if (!user?.sub) {
    throw new NotFoundException('ID de usuario no encontrado en el token');
  }

  const person = await this.peopleService.findUserDetails(user.sub);

  if (!person) {
    throw new NotFoundException(`Usuario con ID ${user.sub} no encontrado`);
  }

  return person;
}

}
