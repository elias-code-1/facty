export const TEAM_ROLES = {
  manager: {
    label: 'Manager',
    description: 'Accès complet sauf invitations',
    color: 'indigo',
    pages: [
      '/admin/facty',
      '/admin/facty/users',
      '/admin/facty/invoices',
      '/admin/facty/logs',
      '/admin/facty/stats',
      '/admin/facty/chat',
      '/admin/facty/support',
      '/admin/facty/landing',
      '/admin/facty/communication',
    ]
  },
  landing_editor: {
    label: 'Éditeur Landing',
    description: 'Gestion de la landing page',
    color: 'blue',
    pages: [
      '/admin/facty',
      '/admin/facty/landing',
    ]
  },
  chat_agent: {
    label: 'Agent Chat',
    description: 'Live chat uniquement',
    color: 'green',
    pages: [
      '/admin/facty',
      '/admin/facty/chat',
    ]
  },
  user_manager: {
    label: 'Gestionnaire Users',
    description: 'Users et factures',
    color: 'orange',
    pages: [
      '/admin/facty',
      '/admin/facty/users',
      '/admin/facty/invoices',
    ]
  },
  support_agent: {
    label: 'Agent Support',
    description: 'Tickets et chat',
    color: 'pink',
    pages: [
      '/admin/facty',
      '/admin/facty/support',
      '/admin/facty/chat',
    ]
  },
};
