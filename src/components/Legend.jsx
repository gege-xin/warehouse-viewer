import { statusLabels } from './LocationCell.jsx';

const legendItems = [
  [statusLabels.empty, 'bg-white border-slate-300'],
  [statusLabels.occupied, 'bg-emerald-100 border-emerald-600'],
  [statusLabels.reserved, 'bg-red-100 border-red-600'],
  [statusLabels.unassigned, 'bg-amber-100 border-amber-500'],
  ['叉车通道 / Forklift Aisle', 'bg-slate-200 border-slate-400 border-dashed'],
  ['主走廊 / Main Aisle', 'bg-slate-300 border-slate-500 border-dashed'],
  [statusLabels.aisle, 'bg-slate-200 border-slate-400'],
  [statusLabels.disabled, 'bg-slate-950 border-slate-950'],
];

function Legend() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <h2 className="text-base font-semibold text-slate-950">
        颜色图例 / Legend
      </h2>
      <div className="mt-4 grid gap-3">
        {legendItems.map(([label, colorClass]) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <span
              className={`h-6 w-9 rounded border ${colorClass}`}
              aria-hidden="true"
            />
            <span className="font-medium text-slate-700">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Legend;
