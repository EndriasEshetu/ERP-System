import { TenantScopedEntity } from './common.types.js';

export type NotificationType =
  | 'LOW_STOCK'
  | 'PO_APPROVED'
  | 'GOODS_RECEIVED'
  | 'SYSTEM_ALERT';

export interface NotificationDto extends TenantScopedEntity {
  userId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
}

export interface CreateNotificationInput {
  userId?: string;
  title: string;
  message: string;
  type: NotificationType;
}
