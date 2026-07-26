import { Injectable, Inject } from '@nestjs/common';
import { ITrialClassRepository } from '../../../domain';
import { TrialClassMapper } from '../../../infrastructure/persistence/trial-class.mapper';

@Injectable()
export class ListTrialClassesUseCase {
  constructor(@Inject("ITrialClassRepository") private readonly trialClassRepo: ITrialClassRepository) {}

  async execute() {
    const trialClasses = await this.trialClassRepo.findAll();
    return trialClasses.map(TrialClassMapper.toListItem);
  }
}
