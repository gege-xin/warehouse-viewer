function OccupiedOnlyToggle({ enabled, onChange }) {
  return (
    <label className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-cyan-700"
      />
      <span>只显示有货 / Show Occupied Only</span>
    </label>
  );
}

export default OccupiedOnlyToggle;
