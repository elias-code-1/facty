import React from 'react';

interface UserStatusBadgeProps {
  is_suspended: boolean;
  size?: 'sm' | 'md';
}

/** Badge de statut pour un utilisateur (Actif/Suspendu) */
export default function UserStatusBadge({ is_suspended, size = 'md' }: UserStatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  
  if (is_suspended) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-red-100 text-red-600 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Suspendu
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-green-100 text-green-600 ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      Actif
    </span>
  );
}
