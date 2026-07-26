import { Injectable, Inject } from '@nestjs/common';
import { IParentRepository, Student } from '../../../domain';
import { StudentMapper } from '../../../infrastructure/persistence/student.mapper';

export interface GetStudentsResult {
  students: ReturnType<typeof StudentMapper.toResponse>[];
}

@Injectable()
export class GetStudentsUseCase {
  constructor(@Inject("IParentRepository") private readonly parentRepository: IParentRepository) {}

  async execute(): Promise<GetStudentsResult> {
    const students = await this.parentRepository.findAllStudents();
    return {
      students: students.map(StudentMapper.toResponse),
    };
  }
}
