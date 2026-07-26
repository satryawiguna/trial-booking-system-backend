import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { IBookingRepository } from '../../../domain';
import { IParentRepository, Student } from '@app/parents';
import { ITrialClassRepository } from '@app/trial-classes';
import { ResourceNotFoundException } from '@app/shared/exceptions';
import { BookingMapper } from '../../../infrastructure/persistence/booking.mapper';

@Injectable()
export class CreateBookingUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject("IBookingRepository") private readonly bookingRepo: IBookingRepository,
    @Inject("ITrialClassRepository") private readonly trialClassRepo: ITrialClassRepository,
    @Inject("IParentRepository") private readonly parentRepo: IParentRepository,
  ) {}

  async execute(input: { studentId: string; trialClassId: string }) {
    return this.prisma.$transaction(async (tx) => {
      // Validate student exists (BR-003, INV-004)
      const student = await this.parentRepo.findStudentById(input.studentId);
      if (!student) {
        throw new ResourceNotFoundException('Student', input.studentId);
      }

      // Validate trial class exists (BR-003)
      const trialClass = await this.trialClassRepo.findById(input.trialClassId);
      if (!trialClass) {
        throw new ResourceNotFoundException('Trial class', input.trialClassId);
      }

      // Create booking in PENDING_PAYMENT status (BR-005)
      const booking = await this.bookingRepo.create({
        studentId: input.studentId,
        trialClassId: input.trialClassId,
      });

      return BookingMapper.toResponse(booking);
    });
  }
}
