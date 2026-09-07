/**
 * The role that bypasses permission checks entirely.
 *
 * Compared by name in two places that must agree: PermissionsGuard, which
 * decides what the API allows, and /auth/me, which decides what the interface
 * offers. If those two disagree, the app either hides features the user is
 * entitled to or shows ones the API will reject.
 */
export const SUPER_ADMIN_ROLE = 'Super Admin';
