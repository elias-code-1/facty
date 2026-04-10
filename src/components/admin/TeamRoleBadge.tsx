import React from 'react';

interface Props {
  role: string
  size?: 'sm' | 'md'
}

const ROLE_CONFIG: Record<string, {
  label: string
  icon: string
  bg: string
  text: string
}> = {
  admin: {
    label: 'Admin',
    icon: '🛡️',
    bg: 'bg-violet-100',
    text: 'text-violet-600'
  },
  manager: {
    label: 'Manager',
    icon: '⭐',
    bg: 'bg-indigo-100',
    text: 'text-indigo-600'
  },
  landing_editor: {
    label: 'Landing',
    icon: '🌐',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  chat_agent: {
    label: 'Chat',
    icon: '💬',
    bg: 'bg-green-100',
    text: 'text-green-600'
  },
  user_manager: {
    label: 'Users',
    icon: '👤',
    bg: 'bg-orange-100',
    text: 'text-orange-600'
  },
  support_agent: {
    label: 'Support',
    icon: '🎧',
    bg: 'bg-pink-100',
    text: 'text-pink-600'
  },
}

export default function TeamRoleBadge({ role, size = 'md' }: Props) {
  const config = ROLE_CONFIG[role] ?? {
    label: role,
    icon: '👤',
    bg: 'bg-slate-100',
    text: 'text-slate-600'
  }

  return (
    <span className={`
      inline-flex items-center gap-1
      rounded-full font-medium
      ${config.bg} ${config.text}
      ${size === 'sm'
        ? 'px-2 py-0.5 text-xs'
        : 'px-3 py-1 text-xs'
      }
    `}>
      {config.icon} {config.label}
    </span>
  )
}
