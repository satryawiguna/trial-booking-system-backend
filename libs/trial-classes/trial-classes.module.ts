import { Module } from '@nestjs/common';
import { TrialClassesController } from './presentation/controllers/trial-classes.controller';
import { ListTrialClassesUseCase } from './application/use-cases/list-trial-classes';
import { GetTrialClassDetailUseCase } from './application/use-cases/get-trial-class-detail';
import { GetRosterUseCase } from './application/use-cases/get-roster';
import { TrialClassRepository } from './infrastructure/persistence';

@Module({
  controllers: [TrialClassesController],
  providers: [
    ListTrialClassesUseCase,
    GetTrialClassDetailUseCase,
    GetRosterUseCase,
    {
      provide: 'ITrialClassRepository',
      useClass: TrialClassRepository,
    },
  ],
  exports: ['ITrialClassRepository'],
})
export class TrialClassesModule {}
