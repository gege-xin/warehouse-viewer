export function formatLocationCode(zoneLetter, rackNumber, column, level) {
  return `${String(zoneLetter).toUpperCase()}-R${Number(rackNumber)}-C${String(
    column,
  ).padStart(2, '0')}-L${Number(level)}`;
}

export function migrateLegacyLocationCode(code) {
  const normalized = String(code || '');
  const legacy = normalized.match(/^([A-Z])(\d+)-(\d+)-(\d+)$/i);
  if (legacy) {
    return formatLocationCode(legacy[1], legacy[2], legacy[4], legacy[3]);
  }

  const shorthandLegacy = normalized.match(/^([A-Z])(\d+)-(\d+)$/i);
  if (shorthandLegacy) {
    return formatLocationCode(
      shorthandLegacy[1],
      shorthandLegacy[2],
      1,
      shorthandLegacy[3],
    );
  }

  return code;
}
