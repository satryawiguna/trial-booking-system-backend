import { ApiProperty } from '@nestjs/swagger';

export class RosterParticipantDto {
  @ApiProperty({
    description: 'Booking UUID',
    format: 'uuid',
    example: '30000000-0000-0000-0000-000000000001',
  })
  bookingId: string;

  @ApiProperty({
    description: 'Student UUID',
    format: 'uuid',
    example: '10000000-0000-0000-0000-000000000001',
  })
  studentId: string;

  @ApiProperty({
    description: 'Student full name',
    example: 'John Doe',
  })
  studentName: string;

  @ApiProperty({
    description: 'ISO-8601 timestamp of when the booking was created',
    example: '2026-07-25T10:00:00.000Z',
  })
  createdAt: string;
}

export class RosterResponseDto {
  @ApiProperty({
    description: 'Trial class UUID',
    format: 'uuid',
    example: '20000000-0000-0000-0000-000000000001',
  })
  trialClassId: string;

  @ApiProperty({
    description: 'List of confirmed participants',
    type: [RosterParticipantDto],
  })
  participants: RosterParticipantDto[];
}
