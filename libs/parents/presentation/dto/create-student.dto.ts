import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ description: 'Parent / guardian full name' })
  @IsString()
  @MinLength(1)
  parentName: string;

  @ApiProperty({ description: 'Student full name' })
  @IsString()
  @MinLength(1)
  studentName: string;

  @ApiProperty({ description: 'Parent phone number', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ description: 'Parent email address' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Student grade level (e.g. Grade 1)',
    required: false,
  })
  @IsString()
  @IsOptional()
  grade?: string;
}
