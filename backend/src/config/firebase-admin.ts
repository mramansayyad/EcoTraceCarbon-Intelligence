import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  const projectId = process.env.GCP_PROJECT_ID || 'virtual-promptwars-492614';
  
  // In local development, if emulators are defined, initialize appropriately.
  admin.initializeApp({
    projectId,
    storageBucket: `${projectId}.appspot.com`
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export default admin;
