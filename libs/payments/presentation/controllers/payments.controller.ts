import { Controller, Post, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment';
import { RecordPaymentDto } from '../dto/record-payment.dto';

@ApiTags('payments')
@Controller('bookings')
export class PaymentsController {
  constructor(private readonly processPaymentUseCase: ProcessPaymentUseCase) {}

  @Post(':id/payments')
  @ApiOperation({ summary: 'Process payment and confirm booking atomically' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: RecordPaymentDto })
  @ApiResponse({ status: 200, description: 'Payment processed' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 409, description: 'Class full or duplicate booking' })
  @ApiResponse({ status: 422, description: 'Invalid booking status' })
  async record(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.processPaymentUseCase.execute({
      bookingId: id,
      result: dto.result,
    });
  }
}
