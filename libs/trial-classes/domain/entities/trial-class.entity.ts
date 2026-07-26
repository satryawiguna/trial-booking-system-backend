/**
 * TrialClass domain entity — represents an available trial class.
 * Maximum 4 confirmed students (BR-001, INV-001).
 */
export class TrialClass {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly capacity: number,
    public readonly startTime: Date,
    public readonly createdAt: Date,
    public readonly confirmedCount: number = 0,
  ) {}

  /** Number of available seats remaining. */
  get availableSeats(): number {
    return Math.max(0, this.capacity - this.confirmedCount);
  }

  /** Whether the class is full (BR-001, INV-001). */
  get isFull(): boolean {
    return this.confirmedCount >= this.capacity;
  }

  /** Whether the class has at least one available spot (BR-002). */
  get hasAvailableSeats(): boolean {
    return this.availableSeats > 0;
  }
}
