import { Student } from '../../domain';

/**
 * Maps Prisma model data to the Student domain entity.
 */
export class StudentMapper {
  static toDomain(prisma: {
    id: string;
    parentId: string;
    name: string;
    grade: string | null;
    birthDate: Date | null;
    createdAt: Date;
  }): Student {
    return new Student(
      prisma.id,
      prisma.parentId,
      prisma.name,
      prisma.grade,
      prisma.birthDate,
      prisma.createdAt,
    );
  }

  static toResponse(student: Student) {
    return {
      id: student.id,
      name: student.name,
      grade: student.grade,
      birthDate: student.birthDate?.toISOString().split('T')[0] ?? null,
    };
  }
}
