import { TrialClass } from '../entities';

/**
 * Represents a participant in the trial class roster (INV-007, INV-008).
 */
export interface RosterParticipant {
  studentId: string;
  studentName: string;
}

/**
 * Repository interface for TrialClass domain.
 */
export interface ITrialClassRepository {
  /** List all trial classes with confirmed booking count. */
  findAll(): Promise<TrialClass[]>;

  /** Find a single trial class by ID with confirmed booking count. */
  findById(id: string): Promise<TrialClass | null>;

  /** Get the roster of confirmed participants for a trial class (INV-007). */
  getRoster(trialClassId: string): Promise<RosterParticipant[]>;
}
