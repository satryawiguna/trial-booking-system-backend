import { Student } from '../../domain';

/**
 * Maps Prisma model data to the Student domain entity.
 */
export class StudentMapper {
  static toDomain(prisma: {
    id: string;
    parentId: string;
    name: string;
    birthDate: Date;
    createdAt: Date;
  }): Student {
    return new Student(
      prisma.id,
      prisma.parentId,
      prisma.name,
      prisma.birthDate,
      prisma.createdAt,
    );
  }

  static toResponse(student: Student) {
    return {
      id: student.id,
      name: student.name,
      birthDate: student.birthDate.toISOString().split('T')[0],
    };
  }
}
