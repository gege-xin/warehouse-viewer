import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import sampleWarehouse from '../../data/warehouse.json';
import { db, hasFirebaseConfig } from './firebase.js';

const collectionName = 'warehouseLocations';

export function normalizeWarehouseData(items) {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function subscribeWarehouseData(onData, onError) {
  if (!hasFirebaseConfig || !db) {
    onData(normalizeWarehouseData(sampleWarehouse));
    return () => {};
  }

  const q = query(collection(db, collectionName), orderBy('order', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const firestoreItems = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      onData(
        firestoreItems.length > 0
          ? normalizeWarehouseData(firestoreItems)
          : normalizeWarehouseData(sampleWarehouse),
      );
    },
    onError,
  );
}

export async function seedWarehouseData(items = sampleWarehouse) {
  if (!db) throw new Error('Firebase is not configured.');

  const batch = writeBatch(db);
  items.forEach((item, index) => {
    const ref = doc(collection(db, collectionName));
    batch.set(ref, {
      ...item,
      order: item.order ?? index + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });
  await batch.commit();
}

export async function createWarehouseItem(item) {
  if (!db) throw new Error('Firebase is not configured.');

  await addDoc(collection(db, collectionName), {
    ...item,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function saveWarehouseItem(item) {
  if (!db) throw new Error('Firebase is not configured.');
  if (!item.id) throw new Error('Missing Firestore document id.');

  const { id, ...payload } = item;
  await setDoc(
    doc(db, collectionName, id),
    {
      ...payload,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function patchWarehouseItem(id, payload) {
  if (!db) throw new Error('Firebase is not configured.');

  await updateDoc(doc(db, collectionName, id), {
    ...payload,
    updatedAt: new Date().toISOString(),
  });
}

export async function removeWarehouseItem(id) {
  if (!db) throw new Error('Firebase is not configured.');

  await deleteDoc(doc(db, collectionName, id));
}
