'use client';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { useState } from 'react';

import { AdminCellValue } from '@/features/admin/components/admin-cell-value';
import { AdminDocumentSheet } from '@/features/admin/components/admin-document-sheet';
import { useAdminCollection } from '@/features/admin/hooks/use-admin-collection';
import { type AdminCollection, type AdminCollectionKey, type AdminDocument } from '@/features/admin/types/admin.types';
import { PageHeading } from '@/shared/components/layout/page-heading';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ADMIN_COLLECTIONS } from '@/shared/const/admin.const';
import { useT } from '@/shared/hooks/use-t';

type AdminCollectionViewProps = {
  collectionKey: AdminCollectionKey;
};

type RowActionsProps = {
  collection: AdminCollection;
  document: AdminDocument;
  onOpen: () => void;
  onDelete: () => Promise<boolean>;
};

const RowActions = ({ collection, document, onOpen, onDelete }: RowActionsProps) => {
  const { t } = useT();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (confirming) {
    return (
      <div className="flex justify-end gap-1.5">
        <Button
          variant="destructive"
          size="xs"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const ok = await onDelete();
            setBusy(false);
            if (!ok) setConfirming(false);
          }}
        >
          {t.admin.confirmDelete}
        </Button>
        <Button variant="ghost" size="xs" disabled={busy} onClick={() => setConfirming(false)}>
          {t.admin.cancel}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-1.5">
      <Button variant="outline" size="xs" onClick={onOpen} aria-label={`${collection.canEdit ? t.admin.edit : t.admin.view} ${document._id}`}>
        {collection.canEdit ? t.admin.edit : t.admin.view}
      </Button>
      {collection.canDelete && (
        <Button variant="ghost" size="xs" className="text-destructive" onClick={() => setConfirming(true)}>
          {t.admin.delete}
        </Button>
      )}
    </div>
  );
};

export const AdminCollectionView = ({ collectionKey }: AdminCollectionViewProps) => {
  const { t, fmt, plural, intl, dateTime } = useT();
  const collection = ADMIN_COLLECTIONS.find((item) => item.key === collectionKey);
  const { data, page, setPage, query, search, loadFailed, create, update, remove } = useAdminCollection(collectionKey);
  const [target, setTarget] = useState<AdminDocument | 'new' | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  if (!collection) return null;

  const columns = collection.fields.filter((field) => field.inTable);
  const title = t.admin.collections[collection.key] ?? collection.key;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const from = data && data.total > 0 ? (data.page - 1) * data.limit + 1 : 0;
  const to = data ? Math.min(data.page * data.limit, data.total) : 0;

  return (
    <div>
      <PageHeading
        title={title}
        description={data ? plural(t.admin.records, data.total, { count: data.total.toLocaleString(intl) }) : undefined}
        actions={
          collection.canCreate && (
            <Button onClick={() => setTarget('new')}>
              <Plus className="size-4" aria-hidden="true" />
              {t.admin.create}
            </Button>
          )
        }
      />

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          value={query}
          onChange={(event) => search(event.target.value)}
          placeholder={t.admin.searchPlaceholder}
          aria-label={t.admin.searchLabel}
          className="pl-10"
        />
      </div>

      {(loadFailed || rowError) && (
        <Alert variant="destructive" className="mb-4">
          {rowError ?? t.admin.errors.loadFailed}
        </Alert>
      )}

      {!data ? (
        !loadFailed && (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-12 rounded-lg" />)}
          </div>
        )
      ) : data.items.length === 0 ? (
        <p className="paper rounded-xl p-6 text-muted-foreground">{query.trim() ? fmt(t.admin.noMatches, { q: query.trim() }) : t.admin.empty}</p>
      ) : (
        <div className="paper overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left text-sm">
              <thead className="border-b border-rule bg-muted/60">
                <tr>
                  {columns.map((field) => (
                    <th key={field.key} scope="col" className="px-4 py-3 font-mono text-xs font-semibold text-muted-foreground">
                      {field.key}
                    </th>
                  ))}
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-muted-foreground">{t.admin.createdAt}</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                    <span className="sr-only">{t.admin.actions}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {data.items.map((document) => (
                  <tr key={document._id} className="align-middle transition-colors hover:bg-accent/60">
                    {columns.map((field) => (
                      <td key={field.key} className="px-4 py-3">
                        <AdminCellValue field={field} value={document[field.key]} />
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {typeof document.createdAt === 'string' ? dateTime(document.createdAt) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        collection={collection}
                        document={document}
                        onOpen={() => setTarget(document)}
                        onDelete={async () => {
                          setRowError(null);
                          const result = await remove(document._id);
                          if (!result.ok) setRowError(result.message);
                          return result.ok;
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-4 py-3 text-sm">
            <span className="text-muted-foreground tabular-nums">
              {fmt(t.admin.showing, { from: from.toLocaleString(intl), to: to.toLocaleString(intl), total: data.total.toLocaleString(intl) })}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="size-4" aria-hidden="true" />
                {t.admin.previous}
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                {t.admin.next}
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <AdminDocumentSheet
        collection={collection}
        target={target}
        onClose={() => setTarget(null)}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
      />
    </div>
  );
};
