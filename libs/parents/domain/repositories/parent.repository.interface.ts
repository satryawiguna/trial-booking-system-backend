import { Student, Parent } from '../entities';

/**
 * Repository interface for Parent/Student domain.
 * Domain layer only knows the interface — implementation is in infrastructure.
 */
export interface IParentRepository {
  /** Retrieve all students (for booking form selection). */
  findAllStudents(): Promise<Student[]>;

  /** Find a single student by ID. */
  findStudentById(id: string): Promise<Student | null>;

  /** Upsert a parent by email (create or update). Returns the parent. */
  upsertParentByEmail(data: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<Parent>;

  /** Create a new student linked to a parent. */
  createStudent(data: {
    parentId: string;
    name: string;
    grade?: string;
  }): Promise<Student>;
}
