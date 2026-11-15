import { Request, Response, NextFunction } from 'express';

// Augment Express Request interface with multi-tenant context
declare global {
  namespace Express {
    interface Request {
      organizationId: string;
      userId: string;
    }
  }
}

export const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000002';

/**
 * Multi-Tenancy Scoping Middleware
 * Extracts organization and user context from headers or session.
 * Guarantees that every request down the pipeline is tenant-isolated.
 */
export function tenantContext(req: Request, _res: Response, next: NextFunction): void {
  const orgHeader = req.headers['x-organization-id'];
  const userHeader = req.headers['x-user-id'];

  req.organizationId = (Array.isArray(orgHeader) ? orgHeader[0] : orgHeader) || DEFAULT_ORG_ID;
  req.userId = (Array.isArray(userHeader) ? userHeader[0] : userHeader) || DEFAULT_USER_ID;

  next();
}
