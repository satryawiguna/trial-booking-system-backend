import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class RecordPaymentDto {
  @ApiProperty({
    description: 'Payment result. Use "failed" to simulate failure (EC-003).',
    enum: ['success', 'failed'],
    default: 'success',
  })
  @IsOptional()
  @IsString()
  @IsIn(['success', 'failed'])
  result?: string;
}
