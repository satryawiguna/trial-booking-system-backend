import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GetStudentsUseCase } from '../../application/use-cases/get-students';
import { CreateStudentUseCase } from '../../application/use-cases/create-student';
import { CreateStudentDto } from '../dto/create-student.dto';

@ApiTags('parents')
@Controller('students')
export class ParentsController {
  constructor(
    private readonly getStudentsUseCase: GetStudentsUseCase,
    private readonly createStudentUseCase: CreateStudentUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all students' })
  @ApiResponse({
    status: 200,
    description: 'Students retrieved',
    schema: {
      type: 'object',
      properties: {
        students: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              birthDate: { type: 'string', format: 'date' },
            },
          },
        },
      },
    },
  })
  async list() {
    return this.getStudentsUseCase.execute();
  }

  @Post()
  @ApiOperation({
    summary:
      'Create a parent & student (upsert parent by email, create student)',
  })
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({
    status: 201,
    description: 'Student created',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string', format: 'uuid' },
        studentName: { type: 'string' },
        parentId: { type: 'string', format: 'uuid' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async create(@Body() dto: CreateStudentDto) {
    return this.createStudentUseCase.execute(dto);
  }
}
