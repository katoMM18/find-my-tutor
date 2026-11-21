import { type Types } from 'mongoose';

import { type ADMIN_COLLECTION_KEYS } from '@/shared/const/admin.const';

export type AdminCollectionKey = (typeof ADMIN_COLLECTION_KEYS)[number];

// How a field is shown in the table and edited in the form.
// text/email/longText/select: one string. number, boolean, date: their own type.
// objectId: one 24-character id. objectIdList / stringList: one item per line. json: nested arrays and objects.
// password: write-only; the service stores its hash and never sends it back.
export type AdminFieldType =
  | 'text'
  | 'email'
  | 'longText'
  | 'number'
  | 'boolean'
  | 'select'
  | 'date'
  | 'objectId'
  | 'objectIdList'
  | 'stringList'
  | 'json'
  | 'password';

export type AdminField = {
  key: string;
  type: AdminFieldType;
  // Allowed values for select, and for each item of a stringList.
  options?: readonly string[];
  required?: boolean;
  // Shown in the form but never sent on update (immutable in the schema).
  readOnly?: boolean;
  // Shown as a column in the collection table.
  inTable?: boolean;
};

export type AdminCollection = {
  key: AdminCollectionKey;
  fields: AdminField[];
  // String fields matched by the search box. An exact 24-character id always matches _id too.
  searchKeys: string[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

// A value as Mongoose returns it from .lean().
export type AdminRawValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | Types.ObjectId
  | AdminRawValue[]
  | { [key: string]: AdminRawValue };

export type AdminRawDocument = { _id: Types.ObjectId; [key: string]: AdminRawValue };

// The same value after ids and dates become strings, safe to send as JSON.
export type AdminJsonValue = string | number | boolean | null | AdminJsonValue[] | { [key: string]: AdminJsonValue };

export type AdminDocument = { _id: string; [key: string]: AdminJsonValue };

// What a field becomes before it is written to MongoDB.
export type AdminWriteValue = string | number | boolean | Date | null | string[] | AdminJsonValue;

export type AdminWriteData = Record<string, AdminWriteValue>;

export type AdminSearchFilter = {
  _id?: string;
  $or?: Array<Record<string, { $regex: string; $options: 'i' }>>;
};

export type AdminDocumentPage = {
  items: AdminDocument[];
  total: number;
  page: number;
  limit: number;
};

export type AdminStat = {
  key:
    | 'users'
    | 'students'
    | 'tutors'
    | 'admins'
    | 'newUsers'
    | 'verifiedTutors'
    | 'pendingVerifications'
    | 'vipTutors'
    | 'openRequests'
    | 'conversations'
    | 'messages'
    | 'ratings';
  value: number;
};

export type AdminRecentUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string | null;
};

export type AdminOverview = {
  stats: AdminStat[];
  averageRating: number | null;
  collectionCounts: Record<AdminCollectionKey, number>;
  recentUsers: AdminRecentUser[];
};

// Field values as the form edits them: strings for everything except checkboxes.
export type AdminFormValues = Record<string, string | boolean>;
