import { readFile } from 'node:fs/promises';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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
const seed = JSON.parse(await readFile('data/warehouse.json', 'utf8'));
const collectionRef = db.collection('warehouseLocations');
const batch = db.batch();
const targetDocIds = new Set();

seed.forEach((item, index) => {
  const docId = `${String(index + 1).padStart(2, '0')}-${slug(item.nameEn || item.nameCn || item.type)}`;
  targetDocIds.add(docId);
  batch.set(collectionRef.doc(docId), {
    ...item,
    order: item.order ?? index + 1,
    updatedAt: new Date().toISOString(),
  });
});

const existingDocs = await collectionRef.listDocuments();
existingDocs.forEach((docRef) => {
  if (!targetDocIds.has(docRef.id)) {
    batch.delete(docRef);
  }
});

await batch.commit();

console.log(`Imported ${seed.length} documents to warehouseLocations.`);

function slug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
