function LargeTextToggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={[
        'inline-flex min-h-10 items-center justify-center rounded-md border px-3 text-sm font-bold transition',
        enabled
          ? 'border-cyan-700 bg-cyan-700 text-white'
          : 'border-slate-300 bg-white text-slate-700',
      ].join(' ')}
      aria-pressed={enabled}
    >
      大字体模式 / Large Text
    </button>
  );
}

export default LargeTextToggle;
