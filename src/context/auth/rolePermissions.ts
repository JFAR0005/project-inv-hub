
export type UserRole = 'admin' | 'partner' | 'founder' | 'capital_team';

export const ROLE_PERMISSIONS = {
  admin: [
    'view:portfolio:full',
    'edit:companies',
    'view:deals',
    'manage:deals',
    'view:fundraising',
    'manage:fundraising',
    'view:meetings',
    'manage:meetings',
    'view:notes',
    'edit:notes',
    'manage:users'
  ],
  capital_team: [
    'view:portfolio:full',
    'view:deals',
    'manage:deals',
    'view:fundraising',
    'manage:fundraising',
    'view:meetings',
    'manage:meetings',
    'view:notes',
    'edit:notes'
  ],
  partner: [
    'view:portfolio:limited',
    'view:deals',
    'manage:deals',
    'view:meetings',
    'manage:meetings',
    'view:notes',
    'edit:notes'
  ],
  founder: [
    'view:portfolio:own',
    'submit:updates',
    'view:meetings',
    'view:notes'
  ]
};

export const hasPermission = (userRole: UserRole | undefined, permission: string): boolean => {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};
