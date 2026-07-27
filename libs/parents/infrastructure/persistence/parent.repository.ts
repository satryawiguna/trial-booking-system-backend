import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { IParentRepository, Student, Parent } from '../../domain';
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

  async upsertParentByEmail(data: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<Parent> {
    const row = await this.prisma.parent.upsert({
      where: { email: data.email },
      update: { name: data.name, phone: data.phone },
      create: { name: data.name, email: data.email, phone: data.phone },
    });
    return new Parent(row.id, row.name, row.email, row.phone, row.createdAt);
  }

  async createStudent(data: {
    parentId: string;
    name: string;
    grade?: string;
  }): Promise<Student> {
    const row = await this.prisma.student.create({
      data: {
        parentId: data.parentId,
        name: data.name,
        grade: data.grade,
      },
    });
    return StudentMapper.toDomain(row);
  }
}
