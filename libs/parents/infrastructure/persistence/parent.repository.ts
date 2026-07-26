import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { IParentRepository, Student } from '../../domain';
import { StudentMapper } from './student.mapper';

@Injectable()
export class ParentRepository implements IParentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllStudents(): Promise<Student[]> {
    const students = await this.prisma.student.findMany({
      orderBy: { name: 'asc' },
    });
    return students.map(StudentMapper.toDomain);
  }

  async findStudentById(id: string): Promise<Student | null> {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) return null;
    return StudentMapper.toDomain(student);
  }
}
