import { Injectable, Inject } from '@nestjs/common';
import { ITrialClassRepository } from '../../../domain';
import { ResourceNotFoundException } from '@app/shared/exceptions';
import { TrialClassMapper } from '../../../infrastructure/persistence/trial-class.mapper';

@Injectable()
export class GetTrialClassDetailUseCase {
  constructor(@Inject("ITrialClassRepository") private readonly trialClassRepo: ITrialClassRepository) {}

  async execute(id: string) {
    const trialClass = await this.trialClassRepo.findById(id);

    if (!trialClass) {
      throw new ResourceNotFoundException('Trial class', id);
    }

    return TrialClassMapper.toDetail(trialClass);
  }
}
