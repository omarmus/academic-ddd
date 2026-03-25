import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './application/user.service';
import { USER_REPOSITORY } from './domain/user.repository';
import { UserTypeOrmEntity } from './infrastructure/user-typeorm.entity';
import { UserTypeOrmRepository } from './infrastructure/user-typeorm.repository';

import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserTypeOrmEntity]), RolesModule],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: UserTypeOrmRepository,
    },
  ],
  exports: [UserService],
})
export class UsersModule { }
