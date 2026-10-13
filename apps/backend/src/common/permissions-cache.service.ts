import { Injectable } from '@nestjs/common';

/** Resolved authorisation state for one user. */
export interface ResolvedPermissions {
  permissions: string[];
  isSuperAdmin: boolean;
}

interface CacheEntry extends ResolvedPermissions {
  expiresAt: number;
}

/**
 * Short-lived cache of each user's resolved permission set.
 *
 * PermissionsGuard runs on every authenticated request and used to resolve
 * permissions with a four-level join (user -> roles -> role -> permissions ->
 * permission) each time. A page that issues seven API calls paid for seven of
 * those joins before doing any real work.
 *
 * The TTL is deliberately short, and every path that changes a role or a user's
 * role assignments invalidates explicitly, so a permission change takes effect
 * immediately rather than after the TTL.
 */
@Injectable()
export class PermissionsCacheService {
  private readonly ttlMs = 60_000;
  private readonly entries = new Map<string, CacheEntry>();

  get(userId: string): ResolvedPermissions | undefined {
    const entry = this.entries.get(userId);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(userId);
      return undefined;
    }
    return { permissions: entry.permissions, isSuperAdmin: entry.isSuperAdmin };
  }

  set(userId: string, resolved: ResolvedPermissions): void {
    this.entries.set(userId, {
      ...resolved,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  /** Called when a specific user's role assignments change. */
  invalidateUser(userId: string): void {
    this.entries.delete(userId);
  }

  /**
   * Called when a role's permissions change. The cache is not indexed by role,
   * and roles are edited rarely, so dropping everything is both correct and
   * cheaper than tracking the reverse mapping.
   */
  invalidateAll(): void {
    this.entries.clear();
  }
}
