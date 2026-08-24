import { Module } from '@nestjs/common';
import { PeopleService } from './people.service';
import { UserPeopleController } from './Controllers/user.people.controller';
import { AdminPeopleController } from './Controllers/admin.people.controller';
import { IntegrationPeopleController } from './Controllers/integration.people.controller';


@Module({
  providers: [PeopleService],
  controllers: [AdminPeopleController, UserPeopleController, IntegrationPeopleController],
  exports: [PeopleService],
})
export class PeopleModule {}
