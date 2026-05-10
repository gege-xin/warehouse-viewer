export function formatLocationCode(zoneLetter, rackNumber, column, level) {
  return `${String(zoneLetter).toUpperCase()}-R${Number(rackNumber)}-C${String(
    column,
  ).padStart(2, '0')}-L${Number(level)}`;
}

export function parseLocationCode(code) {
  const normalized = String(code || '').trim();

  const modern = normalized.match(/^([A-Z])-R(\d+)-C(\d+)-L([1-3])$/i);
  if (modern) {
    return {
      zoneLetter: modern[1].toUpperCase(),
      rackNumber: Number(modern[2]),
      column: Number(modern[3]),
      level: Number(modern[4]),
    };
  }

  const legacy = normalized.match(/^([A-Z])(\d+)-(\d+)-(\d+)$/i);
  if (legacy) {
    return {
      zoneLetter: legacy[1].toUpperCase(),
      rackNumber: Number(legacy[2]),
      column: Number(legacy[4]),
      level: Number(legacy[3]),
      legacy: true,
    };
  }

  const shorthandLegacy = normalized.match(/^([A-Z])(\d+)-(\d+)$/i);
  if (shorthandLegacy) {
    return {
      zoneLetter: shorthandLegacy[1].toUpperCase(),
      rackNumber: Number(shorthandLegacy[2]),
      column: 1,
      level: Number(shorthandLegacy[3]),
      legacy: true,
    };
  }

  return null;
}

export function migrateLegacyLocationCode(code) {
  const parsed = parseLocationCode(code);
  if (!parsed) return code;

  return formatLocationCode(
    parsed.zoneLetter,
    parsed.rackNumber,
    parsed.column,
    parsed.level,
  );
}

export function getRackCodePrefixFromRackName(rackName) {
  const match = String(rackName || '').match(/([A-Z])(\d+)/i);
  if (!match) return null;

  return {
    zoneLetter: match[1].toUpperCase(),
    rackNumber: Number(match[2]),
  };
}
