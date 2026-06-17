import type { UserId } from '../types/units.js';

/**
 * Generic base repository interface.
 * All Firestore collections implement this contract.
 * @template T — The domain entity type
 * @template TCreate — The creation DTO type (omits id, timestamps)
 */
export interface IRepository<T, TCreate> {
  /**
   * Find a single entity by its ID.
   * @param id — Firestore document ID
   * @returns The entity or null if not found
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all entities belonging to a user (enforces uid filtering).
   * @param uid — Firebase Auth user ID
   * @param limit — Max results (default: 50, max: 200)
   */
  findByUserId(uid: UserId, limit?: number): Promise<readonly T[]>;

  /**
   * Create a new entity.
   * @param uid — Owner user ID (always attached server-side)
   * @param data — Creation data
   * @returns The created entity with generated ID and timestamps
   */
  create(uid: UserId, data: TCreate): Promise<T>;

  /**
   * Update an entity. Only the owner can update (enforced in implementation).
   * @param uid — Must match entity's uid field
   * @param id — Document ID
   * @param data — Partial update data
   * @throws AuthorizationError if uid doesn't match entity owner
   */
  update(uid: UserId, id: string, data: Partial<TCreate>): Promise<T>;

  /**
   * Soft-delete an entity (sets deletedAt, never removes from Firestore).
   * @param uid — Must match entity's uid field
   * @param id — Document ID
   */
  delete(uid: UserId, id: string): Promise<void>;
}
