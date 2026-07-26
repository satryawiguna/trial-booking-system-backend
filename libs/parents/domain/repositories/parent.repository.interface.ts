import { Student } from '../entities';

/**
 * Repository interface for Parent/Student domain.
 * Domain layer only knows the interface — implementation is in infrastructure.
 */
export interface IParentRepository {
  /** Retrieve all students (for booking form selection). */
  findAllStudents(): Promise<Student[]>;

  /** Find a single student by ID. */
  findStudentById(id: string): Promise<Student | null>;
}
