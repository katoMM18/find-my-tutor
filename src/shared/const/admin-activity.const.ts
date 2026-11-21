import { type AdminCollection } from '@/features/admin/types/admin.types';
import { AUTH_TOKEN_PURPOSES } from '@/shared/const/auth-token.const';
import { LESSON_AREAS, LESSON_FORMATS } from '@/shared/const/lesson.const';
import { REQUEST_GOALS } from '@/shared/const/requests.const';
import { VIP_STATUSES } from '@/shared/const/vip.const';

// What people do on the site: requests, chat, reviews and billing. Part of ADMIN_COLLECTIONS.
export const ADMIN_ACTIVITY_COLLECTIONS: AdminCollection[] = [
  {
    key: 'studentRequests',
    searchKeys: ['subject', 'note'],
    canCreate: true, canEdit: true, canDelete: true,
    fields: [
      { key: 'studentId', type: 'objectId', required: true, inTable: true },
      { key: 'subject', type: 'text', required: true, inTable: true },
      { key: 'goal', type: 'select', options: REQUEST_GOALS, required: true, inTable: true },
      { key: 'status', type: 'select', options: ['open', 'closed'], required: true, inTable: true },
      { key: 'budget', type: 'number', inTable: true },
      { key: 'format', type: 'select', options: LESSON_FORMATS },
      { key: 'area', type: 'select', options: LESSON_AREAS },
      { key: 'note', type: 'longText' },
      { key: 'repliedTeacherIds', type: 'objectIdList' },
    ],
  },
  {
    key: 'conversations',
    searchKeys: ['lastMessagePreview'],
    canCreate: true, canEdit: true, canDelete: true,
    fields: [
      { key: 'participants', type: 'objectIdList', required: true, inTable: true },
      { key: 'lastMessagePreview', type: 'text', inTable: true },
      { key: 'lastMessageAt', type: 'date', inTable: true },
      { key: 'unreadBy', type: 'objectIdList' },
    ],
  },
  {
    key: 'messages',
    searchKeys: ['body'],
    canCreate: true, canEdit: true, canDelete: true,
    fields: [
      { key: 'conversationId', type: 'objectId', required: true, readOnly: true, inTable: true },
      { key: 'senderId', type: 'objectId', required: true, readOnly: true, inTable: true },
      { key: 'body', type: 'longText', required: true, inTable: true },
      { key: 'readAt', type: 'date', inTable: true },
    ],
  },
  {
    key: 'ratingRequests',
    searchKeys: [],
    canCreate: true, canEdit: true, canDelete: true,
    fields: [
      { key: 'studentId', type: 'objectId', required: true, inTable: true },
      { key: 'teacherProfileId', type: 'objectId', required: true, inTable: true },
      { key: 'status', type: 'select', options: ['pending', 'approved', 'submitted', 'expired'], required: true, inTable: true },
      { key: 'expiresAt', type: 'date', required: true, inTable: true },
      { key: 'approvedAt', type: 'date' },
      { key: 'submittedAt', type: 'date' },
    ],
  },
  {
    // Reviews are permanent once written: the schema marks every field immutable. Admins can only remove one.
    key: 'ratings',
    searchKeys: ['comment', 'result'],
    canCreate: false, canEdit: false, canDelete: true,
    fields: [
      { key: 'teacherProfileId', type: 'objectId', required: true, readOnly: true, inTable: true },
      { key: 'studentId', type: 'objectId', required: true, readOnly: true, inTable: true },
      { key: 'value', type: 'number', required: true, readOnly: true, inTable: true },
      { key: 'comment', type: 'longText', readOnly: true, inTable: true },
      { key: 'result', type: 'text', readOnly: true },
      { key: 'requestId', type: 'objectId', required: true, readOnly: true },
      { key: 'submittedAt', type: 'date', required: true, readOnly: true, inTable: true },
    ],
  },
  {
    key: 'vipSubscriptions',
    searchKeys: ['billingStatus', 'dodoSubscriptionId'],
    canCreate: true, canEdit: true, canDelete: true,
    fields: [
      { key: 'userId', type: 'objectId', required: true, inTable: true },
      { key: 'status', type: 'select', options: VIP_STATUSES, required: true, inTable: true },
      { key: 'plan', type: 'select', options: VIP_STATUSES, required: true, inTable: true },
      { key: 'expiresAt', type: 'date', inTable: true },
      { key: 'cancelAtPeriodEnd', type: 'boolean', inTable: true },
      { key: 'billingStatus', type: 'text' },
      { key: 'dodoSubscriptionId', type: 'text' },
      { key: 'dodoProductId', type: 'text' },
    ],
  },
  {
    key: 'vipPlans',
    searchKeys: ['productId'],
    canCreate: true, canEdit: true, canDelete: true,
    fields: [
      { key: 'status', type: 'select', options: VIP_STATUSES.filter((status) => status !== 'none'), required: true, inTable: true },
      { key: 'productId', type: 'text', required: true, inTable: true },
    ],
  },
  {
    // One-time codes and reset links. Only their hash is stored and it is never shown; admins can revoke one.
    key: 'authTokens',
    searchKeys: [],
    canCreate: false, canEdit: false, canDelete: true,
    fields: [
      { key: 'userId', type: 'objectId', required: true, readOnly: true, inTable: true },
      { key: 'purpose', type: 'select', options: AUTH_TOKEN_PURPOSES, required: true, readOnly: true, inTable: true },
      { key: 'expiresAt', type: 'date', required: true, readOnly: true, inTable: true },
      { key: 'attempts', type: 'number', readOnly: true, inTable: true },
      { key: 'usedAt', type: 'date', readOnly: true, inTable: true },
    ],
  },
];
