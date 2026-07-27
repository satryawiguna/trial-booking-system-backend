import { Module } from '@nestjs/common';
import { ParentsController } from './presentation/controllers/parents.controller';
import { GetStudentsUseCase } from './application/use-cases/get-students';
import { CreateStudentUseCase } from './application/use-cases/create-student';
import { ParentRepository } from './infrastructure/persistence';
import { IParentRepository } from './domain';

@Module({
  controllers: [ParentsController],
  providers: [
    GetStudentsUseCase,
    CreateStudentUseCase,
    {
      provide: 'IParentRepository',
      useClass: ParentRepository,
    },
  ],
  exports: [GetStudentsUseCase, 'IParentRepository'],
})
export class ParentsModule {}
