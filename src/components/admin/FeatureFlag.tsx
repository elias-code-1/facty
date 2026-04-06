import React from 'react';
import Switch from '../ui/Switch';

interface FeatureFlagProps {
  label: string;
  description: string;
  settingKey: string;
  value: string;
  onToggle: (key: string, value: string) => void;
  disabled?: boolean;
  badge?: string;
}

export default function FeatureFlag({
  label,
  description,
  settingKey,
  value,
  onToggle,
  disabled = false,
  badge
}: FeatureFlagProps) {
  const isChecked = value === 'true';

  return (
    <div className="flex justify-between items-center py-4 border-b border-slate-100 last:border-0">
      <div className="pr-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-800">{label}</span>
          {badge && (
            <span className="bg-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-wider rounded px-2 py-0.5">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">
        <Switch
          checked={isChecked}
          onChange={(val) => onToggle(settingKey, val ? 'true' : 'false')}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
