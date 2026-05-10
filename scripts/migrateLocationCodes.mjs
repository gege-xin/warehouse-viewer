import { readFile } from 'node:fs/promises';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { migrateLegacyLocationCode } from './locationCode.mjs';

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountPath && !serviceAccountJson) {
  throw new Error(
    'Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON file path, or set FIREBASE_SERVICE_ACCOUNT to the JSON string.',
  );
}

const credential = serviceAccountJson
  ? cert(JSON.parse(serviceAccountJson))
  : cert(JSON.parse(await readFile(serviceAccountPath, 'utf8')));

if (!getApps().length) {
  initializeApp({ credential });
}

const db = getFirestore();
const snapshot = await db.collection('warehouseLocations').get();
const batch = db.batch();
let changedDocs = 0;
let changedLocations = 0;

snapshot.docs.forEach((docSnapshot) => {
  const item = docSnapshot.data();
  if (item.type !== 'zone') return;

  let docChanged = false;
  const racks = (item.racks || []).map((rack) => {
    const nextRack = {
      ...rack,
      levels: 3,
      locations: (rack.locations || []).map((location) => {
        const nextCode = migrateLegacyLocationCode(location.code);
        if (nextCode !== location.code) {
          changedLocations += 1;
          docChanged = true;
          return { ...location, code: nextCode };
        }

        return location;
      }),
    };

    if (rack.levels !== 3) docChanged = true;
    return nextRack;
  });

  if (docChanged) {
    changedDocs += 1;
    batch.update(docSnapshot.ref, {
      racks,
      updatedAt: new Date().toISOString(),
    });
  }
});

if (changedDocs > 0) {
  await batch.commit();
}

console.log(
  `Migrated ${changedLocations} location codes in ${changedDocs} warehouse documents.`,
);
