import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'Student UUID',
    format: 'uuid',
    example: '10000000-0000-0000-0000-000000000001',
  })
  @IsUUID()
  studentId: string;

  @ApiProperty({
    description: 'Trial class UUID',
    format: 'uuid',
    example: '20000000-0000-0000-0000-000000000001',
  })
  @IsUUID()
  trialClassId: string;
}
