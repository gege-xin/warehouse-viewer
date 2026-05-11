import { useEffect, useMemo, useState } from 'react';
import { saveWarehouseLayoutDraft } from '../lib/warehouseService.js';

const aisleDefaults = {
  forklift: {
    nameCn: '叉车通道',
    nameEn: 'Forklift Aisle',
    heightPx: 64,
  },
  main: {
    nameCn: '主走廊',
    nameEn: 'Main Aisle',
    heightPx: 96,
  },
  normal: {
    nameCn: '走廊',
    nameEn: 'Aisle',
    heightPx: 48,
  },
};

export function useLayoutEditor(warehouseData, currentUser) {
  const [draft, setDraft] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [selected, setSelected] = useState({ type: 'layout', index: -1 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDraft(normalizeDraft(warehouseData));
    setDeletedIds([]);
  }, [warehouseData]);

  const zones = useMemo(
    () =>
      draft
        .map((item, index) => ({ ...item, layoutIndex: index }))
        .filter((item) => item.type === 'zone'),
    [draft],
  );

  function updateItem(index, patch) {
    setDraft((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? normalizeLayoutItem({ ...item, ...patch }) : item,
      ),
    );
  }

  function updateRack(zoneIndex, rackIndex, patch) {
    setDraft((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== zoneIndex || item.type !== 'zone') return item;

        return {
          ...item,
          racks: (item.racks || []).map((rack, index) =>
            index === rackIndex ? normalizeRack({ ...rack, ...patch }) : rack,
          ),
        };
      }),
    );
  }

  function addZone({ nameCn, nameEn, insertIndex }) {
    insertItem(insertIndex, {
      type: 'zone',
      nameCn: nameCn || '新区',
      nameEn: nameEn || 'New Zone',
      racks: [],
    });
  }

  function addAisle({ aisleType, insertIndex }) {
    const defaults = aisleDefaults[aisleType] || aisleDefaults.normal;
    insertItem(insertIndex, {
      type: 'aisle',
      aisleType,
      ...defaults,
    });
  }

  function addRack({ zoneIndex, rackName, rackNameEn, columns, levels }) {
    setDraft((current) =>
      current.map((item, index) => {
        if (index !== zoneIndex || item.type !== 'zone') return item;

        const nextRackNumber = (item.racks || []).length + 1;
        return {
          ...item,
          racks: [
            ...(item.racks || []),
            normalizeRack({
              id: makeId('rack'),
              rackName: rackName || `Rack ${nextRackNumber}`,
              rackNameEn: rackNameEn || `Rack ${nextRackNumber}`,
              columns: Number(columns || 5),
              levels: Number(levels || 3),
              locations: [],
            }),
          ],
        };
      }),
    );
  }

  function insertItem(insertIndex, item) {
    setDraft((current) => {
      const next = [...current];
      next.splice(clampIndex(insertIndex, current.length), 0, normalizeLayoutItem(item));
      return next;
    });
  }

  function moveLayoutItem(fromIndex, toIndex) {
    setDraft((current) => arrayMove(current, fromIndex, toIndex));
  }

  function moveRack(zoneIndex, fromIndex, toIndex) {
    setDraft((current) =>
      current.map((item, index) => {
        if (index !== zoneIndex || item.type !== 'zone') return item;
        return {
          ...item,
          racks: arrayMove(item.racks || [], fromIndex, toIndex),
        };
      }),
    );
  }

  function deleteLayoutItem(index) {
    const item = draft[index];
    if (!item) return;
    const products = collectProductsFromItem(item);
    const prompt = products.length
      ? '该区域仍有产品，是否确认删除？产品会改为未上架。'
      : '确认删除这个结构元素？';

    if (!window.confirm(`${prompt} / Confirm delete?`)) return;

    setDraft((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      return products.length ? appendUnassignedProducts(next, products) : next;
    });
    if (item.id) setDeletedIds((current) => [...current, item.id]);
  }

  function deleteRack(zoneIndex, rackIndex) {
    const zone = draft[zoneIndex];
    const rack = zone?.racks?.[rackIndex];
    if (!rack) return;

    const products = collectProductsFromRack(rack);
    const prompt = products.length
      ? '该货架仍有产品，是否确认删除？产品会改为未上架。'
      : '确认删除这个货架？';

    if (!window.confirm(`${prompt} / Confirm delete rack?`)) return;

    setDraft((current) => {
      const next = current.map((item, index) => {
        if (index !== zoneIndex || item.type !== 'zone') return item;
        return {
          ...item,
          racks: (item.racks || []).filter((_, currentRackIndex) => currentRackIndex !== rackIndex),
        };
      });

      return products.length ? appendUnassignedProducts(next, products) : next;
    });
  }

  function moveSelected(direction) {
    if (selected.type === 'layout') {
      moveLayoutItem(selected.index, selected.index + direction);
      setSelected((current) => ({
        ...current,
        index: clampIndex(current.index + direction, draft.length - 1),
      }));
    }

    if (selected.type === 'rack') {
      const rackCount = draft[selected.zoneIndex]?.racks?.length || 0;
      moveRack(selected.zoneIndex, selected.rackIndex, selected.rackIndex + direction);
      setSelected((current) => ({
        ...current,
        rackIndex: clampIndex(current.rackIndex + direction, rackCount - 1),
      }));
    }
  }

  async function saveLayout() {
    setSaving(true);
    setMessage('');
    try {
      await saveWarehouseLayoutDraft(
        normalizeDraft(draft),
        deletedIds,
        currentUser?.email || '',
      );
      setDeletedIds([]);
      setMessage('仓库结构已保存 / Warehouse layout saved');
    } catch (error) {
      setMessage(`保存失败 / Save failed: ${error.message}`);
      throw error;
    } finally {
      setSaving(false);
    }
  }

  return {
    addAisle,
    addRack,
    addZone,
    deleteLayoutItem,
    deleteRack,
    draft,
    message,
    moveLayoutItem,
    moveRack,
    moveSelected,
    saveLayout,
    saving,
    selected,
    setSelected,
    updateItem,
    updateRack,
    zones,
  };
}

function normalizeDraft(items) {
  return (items || []).map((item, index) =>
    normalizeLayoutItem({
      ...item,
      order: item.order ?? index + 1,
    }),
  );
}

function normalizeLayoutItem(item) {
  if (item.type === 'zone') {
    return {
      ...item,
      racks: (item.racks || []).map(normalizeRack),
    };
  }

  const aisleType = item.aisleType || inferAisleType(item);
  const defaults = aisleDefaults[aisleType] || aisleDefaults.normal;

  return {
    ...defaults,
    ...item,
    type: 'aisle',
    aisleType,
  };
}

function normalizeRack(rack) {
  return {
    id: rack.id || makeId('rack'),
    ...rack,
    columns: Math.max(1, Number(rack.columns || 1)),
    levels: Math.min(3, Math.max(1, Number(rack.levels || 3))),
    locations: rack.locations || [],
  };
}

function inferAisleType(item) {
  const text = `${item.nameCn || ''} ${item.nameEn || ''}`.toLowerCase();
  if (text.includes('main') || text.includes('主')) return 'main';
  if (text.includes('forklift') || text.includes('叉车')) return 'forklift';
  return 'normal';
}

function arrayMove(items, fromIndex, toIndex) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function clampIndex(index, maxIndex) {
  return Math.max(0, Math.min(Number(index || 0), maxIndex));
}

function collectProductsFromItem(item) {
  if (item.type !== 'zone') return [];
  return (item.racks || []).flatMap(collectProductsFromRack);
}

function collectProductsFromRack(rack) {
  return (rack.locations || []).filter((location) => location.model);
}

function appendUnassignedProducts(items, products) {
  const existingCodes = new Set(
    items
      .filter((item) => item.type === 'zone')
      .flatMap((zone) => zone.racks || [])
      .flatMap((rack) => rack.locations || [])
      .map((location) => location.code),
  );
  const nextProducts = products.map((location) => {
    const code = makeTempCode(existingCodes);
    existingCodes.add(code);
    return {
      ...location,
      code,
      location: code,
      status: 'unassigned',
      qty: Number(location.qty || 0),
      note: location.note || '结构删除后待分配 / Pending after layout delete',
    };
  });

  const stagingIndex = items.findIndex(
    (item) => item.type === 'zone' && /staging/i.test(item.nameEn || ''),
  );

  if (stagingIndex >= 0) {
    return items.map((item, index) => {
      if (index !== stagingIndex) return item;
      const racks = item.racks?.length
        ? item.racks
        : [normalizeRack({ rackName: 'TEMP', rackNameEn: 'Staging Rack', columns: 10 })];
      return {
        ...item,
        racks: racks.map((rack, rackIndex) =>
          rackIndex === 0
            ? { ...rack, locations: [...(rack.locations || []), ...nextProducts] }
            : rack,
        ),
      };
    });
  }

  return [
    ...items,
    normalizeLayoutItem({
      type: 'zone',
      nameCn: '待整理区',
      nameEn: 'Staging Area',
      racks: [
        {
          rackName: 'TEMP',
          rackNameEn: 'Staging Rack',
          columns: 10,
          levels: 3,
          locations: nextProducts,
        },
      ],
    }),
  ];
}

function makeTempCode(existingCodes) {
  let index = existingCodes.size + 1;
  let code = `TEMP-LAYOUT-${String(index).padStart(3, '0')}`;
  while (existingCodes.has(code)) {
    index += 1;
    code = `TEMP-LAYOUT-${String(index).padStart(3, '0')}`;
  }
  return code;
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
