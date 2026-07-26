import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetStudentsUseCase } from '../../application/use-cases/get-students';

@ApiTags('parents')
@Controller('students')
export class ParentsController {
  constructor(private readonly getStudentsUseCase: GetStudentsUseCase) {}

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
}
