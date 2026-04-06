import React from 'react';
import { motion } from 'motion/react';

interface SwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  colorOn?: string;
  colorOff?: string;
}

export default function Switch({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  colorOn = 'bg-indigo-600',
  colorOff = 'bg-slate-200'
}: SwitchProps) {
  const isSm = size === 'sm';
  const width = isSm ? 'w-8' : 'w-12';
  const height = isSm ? 'h-4' : 'h-6';
  const circleSize = isSm ? 'w-3 h-3' : 'w-5 h-5';
  const padding = isSm ? 'p-0.5' : 'p-0.5';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative flex items-center ${width} ${height} ${padding} rounded-full transition-colors duration-300 ${
        checked ? colorOn : colorOff
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`${circleSize} bg-white rounded-full shadow-sm`}
        style={{
          marginLeft: checked ? 'auto' : '0',
          marginRight: checked ? '0' : 'auto'
        }}
      />
    </button>
  );
}
