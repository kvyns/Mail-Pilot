/**
 * Role-Based Access Control (RBAC)
 *
 * Roles (hierarchy, highest → lowest):
 *   super-admin → admin → manager → member → viewer
 *
 * Permissions are additive — higher roles inherit lower-role permissions.
 */

export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN:       'admin',
  MANAGER:     'manager',
  MEMBER:      'member',
  VIEWER:      'viewer',
};

/** Ordered from highest to lowest privilege */
export const ROLE_HIERARCHY = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.MEMBER,
  ROLES.VIEWER,
];

/** Human-readable label + color style per role */
export const ROLE_META = {
  [ROLES.SUPER_ADMIN]: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700' },
  [ROLES.ADMIN]:       { label: 'Admin',        color: 'bg-blue-100 text-blue-700' },
  [ROLES.MANAGER]:     { label: 'Manager',      color: 'bg-green-100 text-green-700' },
  [ROLES.MEMBER]:      { label: 'Member',        color: 'bg-gray-100 text-gray-600' },
  [ROLES.VIEWER]:      { label: 'Viewer',        color: 'bg-slate-100 text-slate-500' },
};

/**
 * Permission → minimum role required.
 * Any role at that level or higher will pass.
 */
export const PERMISSIONS = {
  // Dashboard
  'view:overview':    ROLES.VIEWER,

  // Campaigns
  'view:campaigns':   ROLES.VIEWER,
  'manage:campaigns': ROLES.MEMBER,

  // Templates
  'view:templates':   ROLES.VIEWER,
  'manage:templates': ROLES.MEMBER,

  // Users
  'view:users':       ROLES.MANAGER,
  'manage:users':     ROLES.ADMIN,
  'invite:users':     ROLES.ADMIN,

  // Team
  'view:team':        ROLES.MANAGER,
  'manage:team':      ROLES.ADMIN,

  // Credits
  'view:credits':     ROLES.ADMIN,
  'manage:credits':   ROLES.SUPER_ADMIN,

  // Settings
  'view:settings':    ROLES.ADMIN,
  'manage:settings':  ROLES.SUPER_ADMIN,
};

/**
 * Returns true if `userRole` meets or exceeds the minimum role for `permission`.
 * @param {string} userRole   - e.g. 'super-admin'
 * @param {string} permission - key from PERMISSIONS
 */
export function can(userRole, permission) {
  const minRole = PERMISSIONS[permission];
  if (!minRole) return false; // unknown permission → deny
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const minLevel  = ROLE_HIERARCHY.indexOf(minRole);
  if (userLevel === -1) return false; // unknown role → deny
  return userLevel <= minLevel; // lower index = higher privilege
}

/**
 * Returns true if `userRole` meets or exceeds `requiredRole` in the hierarchy.
 * @param {string} userRole
 * @param {string} requiredRole
 */
export function hasRole(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const reqLevel  = ROLE_HIERARCHY.indexOf(requiredRole);
  if (userLevel === -1 || reqLevel === -1) return false;
  return userLevel <= reqLevel;
}

/** Returns the display meta for a role (label + color classes). */
export function getRoleMeta(roleID) {
  return ROLE_META[roleID] || { label: roleID || 'Unknown', color: 'bg-gray-100 text-gray-500' };
}
