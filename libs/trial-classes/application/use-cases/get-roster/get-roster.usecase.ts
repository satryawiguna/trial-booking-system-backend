import { Injectable, Inject } from '@nestjs/common';
import { ITrialClassRepository } from '../../../domain';
import { ResourceNotFoundException } from '@app/shared/exceptions';
import { TrialClassMapper } from '../../../infrastructure/persistence/trial-class.mapper';

@Injectable()
export class GetRosterUseCase {
  constructor(@Inject("ITrialClassRepository") private readonly trialClassRepo: ITrialClassRepository) {}

  async execute(trialClassId: string) {
    // Verify trial class exists
    const trialClass = await this.trialClassRepo.findById(trialClassId);
    if (!trialClass) {
      throw new ResourceNotFoundException('Trial class', trialClassId);
    }

    // Only confirmed bookings (BR-011, INV-007)
    const participants = await this.trialClassRepo.getRoster(trialClassId);

    return TrialClassMapper.toRosterResponse(trialClassId, participants);
  }
}
