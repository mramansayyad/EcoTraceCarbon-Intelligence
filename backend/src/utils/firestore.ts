import { db } from '../config/firebase-admin';

/**
 * Executes a batch of writes.
 * @param callback Callback providing a Firestore WriteBatch
 */
export async function runBatch(callback: (batch: FirebaseFirestore.WriteBatch) => void | Promise<void>): Promise<void> {
  const batch = db.batch();
  await callback(batch);
  await batch.commit();
}

/**
 * Runs a transactional read/write.
 */
export async function runTransaction<T>(
  callback: (transaction: FirebaseFirestore.Transaction) => Promise<T>
): Promise<T> {
  return db.runTransaction(callback);
}
