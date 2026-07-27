import { Injectable, Inject } from '@nestjs/common';
import { IParentRepository } from '../../../domain';

@Injectable()
export class CreateStudentUseCase {
  constructor(
    @Inject('IParentRepository')
    private readonly parentRepo: IParentRepository,
  ) {}

  async execute(input: {
    parentName: string;
    studentName: string;
    phoneNumber?: string;
    email: string;
    grade?: string;
  }) {
    // 1. Upsert parent by email (create or update)
    const parent = await this.parentRepo.upsertParentByEmail({
      name: input.parentName,
      email: input.email,
      phone: input.phoneNumber,
    });

    // 2. Create student linked to parent
    const student = await this.parentRepo.createStudent({
      parentId: parent.id,
      name: input.studentName,
      grade: input.grade,
    });

    return {
      studentId: student.id,
      studentName: student.name,
      parentId: parent.id,
    };
  }
}
