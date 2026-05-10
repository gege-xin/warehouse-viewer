import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildCabinetSkuSeed } from './cabinetSeedData.mjs';

const outputPath = resolve('data/warehouse.json');
const seed = buildCabinetSkuSeed();

await writeFile(outputPath, `${JSON.stringify(seed, null, 2)}\n`, 'utf8');

const skuCount = seed
  .filter((item) => item.type === 'zone')
  .flatMap((zone) => zone.racks || [])
  .reduce((count, rack) => count + (rack.locations?.length || 0), 0);

console.log(`Generated ${skuCount} assigned cabinet SKUs in ${outputPath}`);
