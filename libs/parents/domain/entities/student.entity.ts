/**
 * Student domain entity — the student attending a trial class.
 */
export class Student {
  constructor(
    public readonly id: string,
    public readonly parentId: string,
    public readonly name: string,
    public readonly grade: string | null,
    public readonly birthDate: Date | null,
    public readonly createdAt: Date,
  ) {}
}
