import { z } from 'zod';

import {
  type AdminField,
  type AdminJsonValue,
  type AdminWriteData,
  type AdminWriteValue,
} from '@/features/admin/types/admin.types';
import { ADMIN_COLLECTION_KEYS } from '@/shared/const/admin.const';

export const AdminCollectionKeySchema = z.enum(ADMIN_COLLECTION_KEYS);

export const AdminObjectIdSchema = z.string().regex(/^[0-9a-f]{24}$/i);

export const AdminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  q: z.string().trim().max(200).default(''),
});

export type AdminListQueryType = z.infer<typeof AdminListQuerySchema>;

// The form sends every field as a string, except checkboxes.
export const AdminDocumentBodySchema = z.object({
  values: z.record(z.string(), z.union([z.string().max(100000), z.boolean()])),
});

export type AdminDocumentBodyType = z.infer<typeof AdminDocumentBodySchema>;

// Client-side shape check for the edit form; the server does the real per-field validation.
export const AdminFormSchema = z.record(z.string(), z.union([z.string(), z.boolean()]));

export type AdminFieldError = { field: string; reason: 'REQUIRED' | 'INVALID' };

export type AdminParseResult = { ok: true; data: AdminWriteData } | { ok: false; error: AdminFieldError };

const JsonContainerSchema: z.ZodType<AdminJsonValue> = z.union([z.array(z.json()), z.record(z.string(), z.json())]);

const listItems = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const parseJson = (value: string): AdminJsonValue | undefined => {
  try {
    const parsed = JsonContainerSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
};

// Turns one non-empty form value into what MongoDB stores, or undefined when it is not valid for the field.
const parseFieldValue = (field: AdminField, value: string | boolean): AdminWriteValue | undefined => {
  if (field.type === 'boolean') return typeof value === 'boolean' ? value : undefined;
  if (typeof value !== 'string') return undefined;

  switch (field.type) {
    case 'email': {
      const parsed = z.email().safeParse(value);
      return parsed.success ? parsed.data.toLowerCase() : undefined;
    }
    case 'select':
      return field.options?.includes(value) ? value : undefined;
    case 'number': {
      const parsed = z.coerce.number().finite().safeParse(value);
      return parsed.success ? parsed.data : undefined;
    }
    case 'date': {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }
    case 'objectId':
      return AdminObjectIdSchema.safeParse(value).success ? value : undefined;
    case 'objectIdList': {
      const items = listItems(value);
      return items.every((item) => AdminObjectIdSchema.safeParse(item).success) ? items : undefined;
    }
    case 'stringList': {
      const items = listItems(value);
      return !field.options || items.every((item) => field.options?.includes(item)) ? items : undefined;
    }
    case 'json':
      return parseJson(value);
    case 'password':
      return value.length >= 8 && value.length <= 128 ? value : undefined;
    default:
      return value;
  }
};

// What an emptied optional field becomes on update: lists empty out, everything else is cleared.
const emptyValue = (field: AdminField): AdminWriteValue => (field.type === 'objectIdList' || field.type === 'stringList' ? [] : null);

// Validates the submitted form against the collection's fields.
// create: every field is considered; empty optional fields are left out so schema defaults apply.
// update: only submitted, editable fields change; an emptied optional field is cleared.
export function parseAdminValues(
  fields: AdminField[],
  values: Record<string, string | boolean>,
  mode: 'create' | 'update'
): AdminParseResult {
  const data: AdminWriteData = {};

  for (const field of fields) {
    const submitted = values[field.key];
    const raw = typeof submitted === 'string' ? submitted.trim() : submitted;
    if (mode === 'update' && (field.readOnly || raw === undefined)) continue;

    if (raw === undefined || raw === '') {
      if (field.type === 'password') continue;
      if (field.required) return { ok: false, error: { field: field.key, reason: 'REQUIRED' } };
      if (mode === 'update') data[field.key] = emptyValue(field);
      continue;
    }

    const parsed = parseFieldValue(field, raw);
    if (parsed === undefined) return { ok: false, error: { field: field.key, reason: 'INVALID' } };
    data[field.key] = parsed;
  }

  return { ok: true, data };
}
