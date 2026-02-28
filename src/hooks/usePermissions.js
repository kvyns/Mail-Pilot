import { useAuthStore } from '../store/authStore';
import { can, hasRole, getRoleMeta } from '../utils/permissions';

/**
 * Hook that exposes permission helpers for the currently logged-in user.
 *
 * @example
 * const { can: userCan, role, roleMeta, isActive } = usePermissions();
 * if (userCan('view:credits')) { ... }
 * if (role === 'super-admin') { ... }
 */
export function usePermissions() {
  const { userAccess, selectedAccount } = useAuthStore();

  // Prefer live userAccess from /user/access, fall back to selectedAccount role
  const role =
    userAccess?.roleID ||
    selectedAccount?.roleID ||
    selectedAccount?.role ||
    'viewer';

  const isActive = userAccess ? userAccess.active !== false : true;

  return {
    /** The user's current roleID string, e.g. 'super-admin' */
    role,

    /** Display meta: { label, color } */
    roleMeta: getRoleMeta(role),

    /** Whether the account access is active */
    isActive,

    /** Check a named permission, e.g. can('view:credits') */
    can: (permission) => isActive && can(role, permission),

    /** Check if the user meets a minimum role level */
    hasRole: (requiredRole) => isActive && hasRole(role, requiredRole),
  };
}
