/**
 * Base database entity interface with timestamp audit fields.
 */
export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Foundation interface for all multi-tenant entities.
 * Ensures organization scoping is strictly type-checked across all ERP modules.
 */
export interface TenantScopedEntity extends BaseEntity {
  organizationId: string;
}

/**
 * Authenticated user session representation.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
  roles?: string[];
}

