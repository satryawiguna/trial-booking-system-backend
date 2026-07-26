import { Injectable, Inject } from '@nestjs/common';
import { IBookingRepository } from '../../../domain';
import { ResourceNotFoundException } from '@app/shared/exceptions';
import { BookingMapper } from '../../../infrastructure/persistence/booking.mapper';

@Injectable()
export class GetBookingUseCase {
  constructor(@Inject("IBookingRepository") private readonly bookingRepo: IBookingRepository) {}

  async execute(id: string) {
    const booking = await this.bookingRepo.findById(id);

    if (!booking) {
      throw new ResourceNotFoundException('Booking', id);
    }

    return BookingMapper.toResponse(booking);
  }
}
