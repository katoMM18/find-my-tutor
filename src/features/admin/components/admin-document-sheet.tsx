'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { AdminFieldInput } from '@/features/admin/components/admin-field-input';
import { type AdminMutationResult } from '@/features/admin/hooks/use-admin-collection';
import {
  type AdminCollection,
  type AdminDocument,
  type AdminField,
  type AdminFormValues,
  type AdminJsonValue,
} from '@/features/admin/types/admin.types';
import { AdminFormSchema } from '@/features/admin/validations/admin.validation';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Form } from '@/shared/components/ui/form';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { useT } from '@/shared/hooks/use-t';

type AdminDocumentSheetProps = {
  collection: AdminCollection;
  // null: closed. 'new': create form. A document: edit (or view, when the collection is read-only).
  target: AdminDocument | 'new' | null;
  onClose: () => void;
  onCreate: (values: AdminFormValues) => Promise<AdminMutationResult>;
  onUpdate: (id: string, values: AdminFormValues) => Promise<AdminMutationResult>;
  onDelete: (id: string) => Promise<AdminMutationResult>;
};

const pad = (value: number) => String(value).padStart(2, '0');

// datetime-local inputs work in the browser's time zone; ISO strings are UTC.
const toLocalInput = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toFormValue = (field: AdminField, value: AdminJsonValue | undefined): string | boolean => {
  if (field.type === 'boolean') return value === true;
  if (value === null || value === undefined || field.type === 'password') return '';
  if (field.type === 'date') return typeof value === 'string' ? toLocalInput(value) : '';
  if (field.type === 'json') return JSON.stringify(value, null, 2);
  if (Array.isArray(value)) return value.map(String).join('\n');
  return String(value);
};

const toFormValues = (fields: AdminField[], document: AdminDocument | null): AdminFormValues =>
  Object.fromEntries(fields.map((field) => [field.key, toFormValue(field, document?.[field.key])]));

// Dates go back to the server as UTC so its own time zone never shifts them.
const toSubmitValues = (fields: AdminField[], values: AdminFormValues): AdminFormValues =>
  Object.fromEntries(
    fields
      .filter((field) => values[field.key] !== undefined)
      .map((field) => {
        const value = values[field.key];
        if (field.type === 'date' && typeof value === 'string' && value) return [field.key, new Date(value).toISOString()];
        return [field.key, value];
      })
  );

type DocumentFormProps = Omit<AdminDocumentSheetProps, 'target'> & { document: AdminDocument | null };

// Remounted for every record (keyed by id), so its defaults always match the open record.
const AdminDocumentForm = ({ collection, document, onClose, onCreate, onUpdate, onDelete }: DocumentFormProps) => {
  const { t } = useT();
  const isNew = document === null;
  const editable = isNew ? collection.canCreate : collection.canEdit;
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(AdminFormSchema),
    defaultValues: toFormValues(collection.fields, document),
  });

  const submit = async (values: AdminFormValues) => {
    setSaving(true);
    setError(null);
    const payload = toSubmitValues(
      collection.fields.filter((field) => isNew || !field.readOnly),
      values
    );
    const result = isNew ? await onCreate(payload) : await onUpdate(document._id, payload);
    setSaving(false);
    if (result.ok) {
      onClose();
      return;
    }
    if (result.field) form.setError(result.field, { message: result.message });
    setError(result.message);
  };

  const remove = async () => {
    if (!document) return;
    setSaving(true);
    setError(null);
    const result = await onDelete(document._id);
    setSaving(false);
    if (result.ok) onClose();
    else {
      setConfirmingDelete(false);
      setError(result.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pb-6">
          {!editable && <Alert>{t.admin.readOnlyNote}</Alert>}
          {collection.fields.map((field) => (
            <AdminFieldInput
              key={field.key}
              field={field}
              form={form}
              isNew={isNew}
              disabled={saving || !editable || (!isNew && field.readOnly === true)}
            />
          ))}
          {document && (
            <details className="rounded-lg border border-rule p-3 text-sm">
              <summary className="cursor-pointer font-medium">{t.admin.rawDocument}</summary>
              <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-muted-foreground">
                {JSON.stringify(document, null, 2)}
              </pre>
            </details>
          )}
        </div>

        <div className="space-y-3 border-t border-rule bg-card px-5 py-4">
          {error && <Alert variant="destructive">{error}</Alert>}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {document && collection.canDelete ? (
              confirmingDelete ? (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="destructive" size="sm" disabled={saving} onClick={() => void remove()}>
                    {t.admin.confirmDelete}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" disabled={saving} onClick={() => setConfirmingDelete(false)}>
                    {t.admin.cancel}
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="ghost" size="sm" className="text-destructive" disabled={saving} onClick={() => setConfirmingDelete(true)}>
                  {t.admin.delete}
                </Button>
              )
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
                {t.admin.cancel}
              </Button>
              {editable && (
                <Button type="submit" disabled={saving}>
                  {saving ? t.admin.saving : isNew ? t.admin.saveNew : t.admin.save}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export const AdminDocumentSheet = ({ target, ...props }: AdminDocumentSheetProps) => {
  const { t, fmt } = useT();
  const document = target === 'new' ? null : target;
  const label = t.admin.collections[props.collection.key] ?? props.collection.key;
  const title = target === 'new' ? fmt(t.admin.createTitle, { collection: label }) : props.collection.canEdit ? t.admin.editTitle : t.admin.viewTitle;

  return (
    <Sheet open={target !== null} onOpenChange={(open) => !open && props.onClose()}>
      <SheetContent side="right" closeLabel={t.admin.cancel} className="left-2 w-auto sm:left-auto sm:w-full sm:max-w-xl">
        <SheetHeader className="px-5 pt-5">
          <SheetTitle className="pr-10 font-heading text-2xl font-extrabold">{title}</SheetTitle>
          <SheetDescription className="truncate font-mono text-xs">{document ? document._id : label}</SheetDescription>
        </SheetHeader>
        {target !== null && <AdminDocumentForm key={document?._id ?? 'new'} document={document} {...props} />}
      </SheetContent>
    </Sheet>
  );
};
