export const cabinetCategories = [
  {
    category: 'Base Cabinet',
    categoryCn: '地柜',
    models: ['B09', 'B12', 'B15', 'B18', 'B21', 'B24', 'B27', 'B30', 'B33', 'B36', 'B39', 'B42'],
  },
  {
    category: 'Drawer Base',
    categoryCn: '抽屉地柜',
    models: ['DB12', 'DB15', 'DB18', 'DB21', 'DB24', 'DB30', 'DB36'],
  },
  {
    category: 'Sink Base',
    categoryCn: '水槽柜',
    models: ['SB30', 'SB33', 'SB36', 'SB42'],
  },
  {
    category: 'Corner Base',
    categoryCn: '转角地柜',
    models: ['BBC36', 'LS36', 'EZR36'],
  },
  {
    category: 'Wall Cabinet',
    categoryCn: '吊柜',
    models: [
      'W0930', 'W1230', 'W1530', 'W1830', 'W2130', 'W2430', 'W2730', 'W3030', 'W3330', 'W3630',
      'W0936', 'W1236', 'W1536', 'W1836', 'W2136', 'W2436', 'W2736', 'W3036', 'W3336', 'W3636',
      'W0942', 'W1242', 'W1542', 'W1842', 'W2142', 'W2442', 'W2742', 'W3042', 'W3342', 'W3642',
    ],
  },
  {
    category: 'Wall Bridge Cabinet',
    categoryCn: '桥柜',
    models: ['W3012', 'W3312', 'W3612', 'W3015', 'W3315', 'W3615', 'W3018', 'W3318', 'W3618', 'W3024', 'W3324', 'W3624'],
  },
  {
    category: 'Tall Pantry Cabinet',
    categoryCn: '高柜',
    models: ['P1884', 'P1890', 'P1896', 'P2484', 'P2490', 'P2496', 'P3084', 'P3090', 'P3096', 'P3684', 'P3690', 'P3696'],
  },
  {
    category: 'Vanity Cabinet',
    categoryCn: '浴室柜',
    models: ['VB12', 'VB15', 'VB18', 'VB21', 'VB24', 'VB30', 'VB36', 'VSB24', 'VSB30', 'VSB36'],
  },
  {
    category: 'Accessory',
    categoryCn: '配件',
    models: ['TK8', 'F330', 'F336', 'F342', 'PNL2430', 'PNL2436', 'PNL2442'],
  },
];

export const cabinetColors = [
  { colorCode: 'SW', colorName: 'White', colorNameCn: '白色' },
  { colorCode: 'SLG', colorName: 'Light Gray', colorNameCn: '浅灰' },
  { colorCode: 'SG', colorName: 'Gray', colorNameCn: '灰色' },
  { colorCode: 'SC', colorName: 'Charcoal', colorNameCn: '深灰' },
];

const warehousePlan = [
  {
    type: 'zone',
    order: 1,
    nameCn: 'A区',
    nameEn: 'Zone A',
    rackCount: 4,
  },
  {
    type: 'aisle',
    order: 2,
    nameCn: '主走廊',
    nameEn: 'Main Aisle',
    aisleType: 'main',
  },
  {
    type: 'zone',
    order: 3,
    nameCn: 'B区',
    nameEn: 'Zone B',
    rackCount: 3,
  },
  {
    type: 'aisle',
    order: 4,
    nameCn: '叉车通道',
    nameEn: 'Forklift Aisle',
    aisleType: 'forklift',
  },
  {
    type: 'zone',
    order: 5,
    nameCn: 'C区',
    nameEn: 'Zone C',
    rackCount: 3,
  },
];

const rackColumns = 5;
const rackLevels = 10;
const rackCapacity = rackColumns * rackLevels;

export function buildCabinetSkuSeed() {
  const skus = buildCabinetSkus();
  let skuIndex = 0;

  return warehousePlan.map((item) => {
    if (item.type === 'aisle') {
      return item;
    }

    const zoneLetter = item.nameEn.replace('Zone ', '');
    const racks = Array.from({ length: item.rackCount }, (_, rackIndex) => {
      const rackNumber = rackIndex + 1;
      const rackName = `${zoneLetter}${rackNumber}货架`;
      const rackNameEn = `Rack ${zoneLetter}${rackNumber}`;
      const locations = [];

      for (let slot = 0; slot < rackCapacity && skuIndex < skus.length; slot += 1) {
        const level = Math.floor(slot / rackColumns) + 1;
        const column = (slot % rackColumns) + 1;
        const code = `${zoneLetter}${rackNumber}-${String(level).padStart(2, '0')}-${String(column).padStart(2, '0')}`;

        locations.push({
          ...skus[skuIndex],
          code,
          status: 'occupied',
          note: '系统自动分配 / Auto assigned',
        });
        skuIndex += 1;
      }

      return {
        rackName,
        rackNameEn,
        columns: rackColumns,
        levels: rackLevels,
        locations,
      };
    });

    return {
      type: 'zone',
      order: item.order,
      nameCn: item.nameCn,
      nameEn: item.nameEn,
      racks,
    };
  });
}

function buildCabinetSkus() {
  return cabinetCategories.flatMap((group) =>
    group.models.flatMap((cabinetModel) => {
      const box = {
        model: `BOX-${cabinetModel}`,
        type: 'box',
        category: group.category,
        categoryCn: group.categoryCn,
        cabinetModel,
        qty: 0,
      };

      const doors = cabinetColors.map((color) => ({
        model: `${color.colorCode}-${cabinetModel}`,
        type: 'door',
        category: group.category,
        categoryCn: group.categoryCn,
        colorCode: color.colorCode,
        colorName: color.colorName,
        colorNameCn: color.colorNameCn,
        cabinetModel,
        qty: 0,
      }));

      return [box, ...doors];
    }),
  );
}
