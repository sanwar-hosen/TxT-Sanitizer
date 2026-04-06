export type PresetItem = {
  id: string;
  name: string;
};

type PresetListProps = {
  presets: PresetItem[];
  selectedPresetId: string | null;
  onSelectPreset: (presetId: string) => void;
};

export function PresetList({ presets, selectedPresetId, onSelectPreset }: PresetListProps) {
  if (presets.length === 0) {
    return <div className="text-sm text-[#5b6b81]">No presets available.</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onSelectPreset(preset.id)}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            preset.id === selectedPresetId
              ? "border-[#0b5fcc] bg-[#eef5ff] text-[#0b5fcc]"
              : "border-[#d1dae5] bg-white text-[#435774]"
          }`}
        >
          {preset.name}
        </button>
      ))}
    </div>
  );
}
