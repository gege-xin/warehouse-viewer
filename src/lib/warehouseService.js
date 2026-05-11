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
import { auth, db, hasFirebaseConfig } from './firebase.js';

const collectionName = 'warehouseLocations';

export function normalizeWarehouseData(items) {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function getAuditFields(actorEmail) {
  const email = actorEmail || auth?.currentUser?.email || '';

  return email ? { updatedBy: email } : {};
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

export async function seedWarehouseData(items = sampleWarehouse, actorEmail = '') {
  if (!db) throw new Error('Firebase is not configured.');

  const batch = writeBatch(db);
  const now = new Date().toISOString();
  const auditFields = getAuditFields(actorEmail);

  items.forEach((item, index) => {
    const ref = doc(collection(db, collectionName));
    batch.set(ref, {
      ...item,
      order: item.order ?? index + 1,
      createdAt: item.createdAt || now,
      updatedAt: now,
      ...auditFields,
    });
  });
  await batch.commit();
}

export async function createWarehouseItem(item, actorEmail = '') {
  if (!db) throw new Error('Firebase is not configured.');

  await addDoc(collection(db, collectionName), {
    ...item,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...getAuditFields(actorEmail),
  });
}

export async function saveWarehouseItem(item, actorEmail = '') {
  if (!db) throw new Error('Firebase is not configured.');
  if (!item.id) throw new Error('Missing Firestore document id.');

  const { id, ...payload } = item;
  await setDoc(
    doc(db, collectionName, id),
    {
      ...payload,
      updatedAt: new Date().toISOString(),
      ...getAuditFields(actorEmail),
    },
    { merge: true },
  );
}

export async function saveWarehouseItemsBatch(items, actorEmail = '') {
  if (!db) throw new Error('Firebase is not configured.');
  if (!items.length) return;

  const batch = writeBatch(db);
  const updatedAt = new Date().toISOString();
  const auditFields = getAuditFields(actorEmail);

  items.forEach((item) => {
    if (!item.id) throw new Error('Missing Firestore document id.');
    const { id, ...payload } = item;
    batch.set(
      doc(db, collectionName, id),
      {
        ...payload,
        updatedAt,
        ...auditFields,
      },
      { merge: true },
    );
  });

  await batch.commit();
}

export async function saveWarehouseLayoutDraft(items, deletedIds = [], actorEmail = '') {
  if (!db) throw new Error('Firebase is not configured.');

  const batch = writeBatch(db);
  const now = new Date().toISOString();
  const auditFields = getAuditFields(actorEmail);

  deletedIds.forEach((id) => {
    batch.delete(doc(db, collectionName, id));
  });

  items.forEach((item, index) => {
    const { id, ...payload } = item;
    const ref = id ? doc(db, collectionName, id) : doc(collection(db, collectionName));

    batch.set(
      ref,
      {
        ...payload,
        order: index + 1,
        createdAt: payload.createdAt || now,
        updatedAt: now,
        ...auditFields,
      },
      { merge: true },
    );
  });

  await batch.commit();
}

export async function patchWarehouseItem(id, payload, actorEmail = '') {
  if (!db) throw new Error('Firebase is not configured.');

  await updateDoc(doc(db, collectionName, id), {
    ...payload,
    updatedAt: new Date().toISOString(),
    ...getAuditFields(actorEmail),
  });
}

export async function removeWarehouseItem(id) {
  if (!db) throw new Error('Firebase is not configured.');

  await deleteDoc(doc(db, collectionName, id));
}
