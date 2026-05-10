import { X } from 'lucide-react';
import { statusLabels } from './LocationCell.jsx';
import UnassignedBadge from './UnassignedBadge.jsx';

function LocationModal({ location, onClose }) {
  if (!location) return null;
  const isUnassigned =
    location.status === 'unassigned' ||
    String(location.code || '').toUpperCase().startsWith('TEMP-');

  const rows = [
    ['区域 / Zone', `${location.zoneNameCn} / ${location.zoneNameEn}`],
    ['货架 / Rack', `${location.rackName} / ${location.rackNameEn || ''}`],
    ['货位 / Location', location.code],
    ['型号 / Model', location.model || '-'],
    ['产品类型 / Type', location.type || '-'],
    ['分类 / Category', location.category || '-'],
    ['柜体型号 / Cabinet Model', location.cabinetModel || '-'],
    ['颜色 / Color', formatColor(location)],
    ['数量 / Quantity', `${location.qty} 件 / pcs`],
    ['状态 / Status', statusLabels[location.status] || location.status],
    ['备注 / Note', location.note || '-'],
  ];

  if (isUnassigned) {
    rows[0] = ['鍖哄煙 / Zone', '待整理区 / Staging Area'];
    rows[1] = ['璐ф灦 / Rack', '待分配 / Pending Location'];
    rows[2] = ['璐т綅 / Location', '待分配 / Pending Location'];
    rows[9] = ['鐘舶€?/ Status', '未上架 / Unassigned'];
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-slate-950/45 p-0 sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full overflow-y-auto rounded-t-xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300 sm:hidden" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-cyan-700">
              货位详情 / Location Detail
            </p>
            <h2
              id="location-modal-title"
              className="mt-1 text-xl font-bold text-slate-950"
            >
              {location.model || location.code}
            </h2>
            {isUnassigned ? (
              <div className="mt-3">
                <UnassignedBadge />
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭 / Close"
            className="grid h-9 w-9 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <dl className="mt-5 divide-y divide-slate-100">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-[128px_minmax(0,1fr)] gap-3 py-3 text-sm"
            >
              <dt className="font-medium text-slate-500">{label}</dt>
              <dd className="break-words font-semibold text-slate-900">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function formatColor(location) {
  if (!location.colorCode) return '-';
  return `${location.colorCode} - ${location.colorName || ''}${
    location.colorNameCn ? ` / ${location.colorNameCn}` : ''
  }`;
}

export default LocationModal;
