import { Module } from '@nestjs/common';
import { PaymentsController } from './presentation/controllers/payments.controller';
import { ProcessPaymentUseCase } from './application/use-cases/process-payment';
import { MockPaymentService } from './infrastructure/mock-payment.service';
import { BookingsModule } from '@app/bookings';

@Module({
  imports: [BookingsModule],
  controllers: [PaymentsController],
  providers: [ProcessPaymentUseCase, MockPaymentService],
  exports: [MockPaymentService],
})
export class PaymentsModule {}
