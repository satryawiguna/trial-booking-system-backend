import {
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateBookingUseCase } from '../../application/use-cases/create-booking';
import { GetBookingUseCase } from '../../application/use-cases/get-booking';
import { CancelBookingUseCase } from '../../application/use-cases/cancel-booking';
import { CreateBookingDto } from '../dto/create-booking.dto';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly createUseCase: CreateBookingUseCase,
    private readonly getUseCase: GetBookingUseCase,
    private readonly cancelUseCase: CancelBookingUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trial booking (PENDING_PAYMENT)' })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({ status: 201, description: 'Booking created' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'Student or class not found' })
  async create(@Body() dto: CreateBookingDto) {
    return this.createUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Booking details' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return this.getUseCase.execute(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 422, description: 'Invalid transition' })
  async cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.cancelUseCase.execute(id);
  }
}
