/**
 * Parent domain entity — the parent who books trial classes for students.
 */
export class Parent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly createdAt: Date,
  ) {}
}
