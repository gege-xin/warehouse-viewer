import { useState } from 'react';
import { saveWarehouseItemsBatch } from '../lib/warehouseService.js';

export function useAdminDragMove(warehouseData) {
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState('');

  async function moveProduct(sourceCode, targetCode) {
    setError('');
    if (!sourceCode || !targetCode || sourceCode === targetCode) {
      return { changed: false };
    }

    const draft = structuredClone(warehouseData);
    const source = findLocation(draft, sourceCode);
    const target = findSlot(draft, targetCode);

    if (!source?.location?.model) {
      throw new Error('Source location has no product SKU.');
    }
    if (!target) {
      throw new Error(`Target location not found: ${targetCode}`);
    }

    const changedZoneKeys = new Set([source.zoneKey, target.zoneKey]);
    const sourceClone = withLocationCode(source.location, targetCode);

    if (target?.location?.model) {
      const confirmed = window.confirm('是否交换两个货位？');
      if (!confirmed) return { changed: false };

      const targetClone = withLocationCode(target.location, sourceCode);
      setLocationAt(draft, source, targetClone);
      setLocationAt(draft, target, sourceClone);
    } else {
      if (target?.location) {
        setLocationAt(draft, target, sourceClone);
        removeLocation(draft, source);
      } else {
        removeLocation(draft, source);
        addLocationToRack(draft, target, sourceClone);
      }
    }

    const changedItems = [...changedZoneKeys].map((zoneKey) => {
      const item = draft[zoneKey];
      if (!item?.id) {
        throw new Error('Firestore document id is missing. Import data to Firestore first.');
      }
      return item;
    });

    setMoving(true);
    try {
      await saveWarehouseItemsBatch(changedItems);
      return { changed: true };
    } catch (moveError) {
      setError(moveError.message);
      throw moveError;
    } finally {
      setMoving(false);
    }
  }

  return { error, moving, moveProduct, setError };
}

function findLocation(data, code) {
  for (let zoneIndex = 0; zoneIndex < data.length; zoneIndex += 1) {
    const zone = data[zoneIndex];
    if (zone.type !== 'zone') continue;

    for (let rackIndex = 0; rackIndex < (zone.racks || []).length; rackIndex += 1) {
      const rack = zone.racks[rackIndex];
      const locationIndex = (rack.locations || []).findIndex(
        (location) => location.code === code,
      );

      if (locationIndex >= 0) {
        return {
          location: rack.locations[locationIndex],
          locationIndex,
          rackIndex,
          zoneKey: zoneIndex,
        };
      }
    }
  }

  return null;
}

function findSlot(data, code) {
  const explicitLocation = findLocation(data, code);
  if (explicitLocation) return explicitLocation;

  const rackPrefix = code.match(/^([A-Z]+\d+)-/i)?.[1];
  if (!rackPrefix) return null;

  for (let zoneIndex = 0; zoneIndex < data.length; zoneIndex += 1) {
    const zone = data[zoneIndex];
    if (zone.type !== 'zone') continue;

    for (let rackIndex = 0; rackIndex < (zone.racks || []).length; rackIndex += 1) {
      const rack = zone.racks[rackIndex];
      const currentPrefix =
        rack.rackName.match(/[A-Z]+\d+/i)?.[0] || rack.rackName.replace(/\s/g, '');

      if (currentPrefix.toLowerCase() === rackPrefix.toLowerCase()) {
        return {
          location: null,
          locationIndex: -1,
          rackIndex,
          zoneKey: zoneIndex,
        };
      }
    }
  }

  return null;
}

function setLocationAt(data, target, location) {
  data[target.zoneKey].racks[target.rackIndex].locations[target.locationIndex] = location;
}

function addLocationToRack(data, target, location) {
  data[target.zoneKey].racks[target.rackIndex].locations.push(location);
}

function removeLocation(data, target) {
  const locations = data[target.zoneKey].racks[target.rackIndex].locations;
  locations.splice(target.locationIndex, 1);
}

function withLocationCode(location, code) {
  const nextLocation = { ...location, code };
  if (Object.prototype.hasOwnProperty.call(nextLocation, 'location')) {
    nextLocation.location = code;
  }
  return nextLocation;
}
