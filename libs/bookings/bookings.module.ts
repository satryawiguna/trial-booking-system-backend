import { Module } from '@nestjs/common';
import { BookingsController } from './presentation/controllers/bookings.controller';
import { CreateBookingUseCase } from './application/use-cases/create-booking';
import { GetBookingUseCase } from './application/use-cases/get-booking';
import { CancelBookingUseCase } from './application/use-cases/cancel-booking';
import { BookingRepository } from './infrastructure/persistence';
import { ParentsModule } from '@app/parents';
import { TrialClassesModule } from '@app/trial-classes';

@Module({
  imports: [ParentsModule, TrialClassesModule],
  controllers: [BookingsController],
  providers: [
    CreateBookingUseCase,
    GetBookingUseCase,
    CancelBookingUseCase,
    {
      provide: 'IBookingRepository',
      useClass: BookingRepository,
    },
  ],
  exports: ['IBookingRepository'],
})
export class BookingsModule {}
