import React from 'react';
import * as LucideIcons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function DynamicIcon({ name, size = 24, className = '' }: DynamicIconProps) {
  if (!name || typeof name !== 'string') return <LucideIcons.HelpCircle size={size} className={className} />;

  // Extract the icon component from Lucide
  // Convert kebab-case or camelCase to PascalCase (e.g., "alert-triangle" -> "AlertTriangle")
  const formattedName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const Icon = (LucideIcons as any)[formattedName] || (LucideIcons as any)[name];

  if (!Icon) {
    // Fallback icon if the requested one is not found
    return <LucideIcons.HelpCircle size={size} className={className} />;
  }

  return <Icon size={size} className={className} />;
}
