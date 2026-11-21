'use client';
import { useCallback, useEffect, useState } from 'react';

import {
  type AdminCollectionKey,
  type AdminDocument,
  type AdminDocumentPage,
  type AdminFormValues,
} from '@/features/admin/types/admin.types';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useT } from '@/shared/hooks/use-t';
import { type HttpErrorDetails, http } from '@/shared/lib/http';

export type AdminMutationResult = { ok: true; document?: AdminDocument } | { ok: false; message: string; field?: string };

const SEARCH_DELAY_MS = 300;

const errorDetails = (error: Error & { details?: HttpErrorDetails }): HttpErrorDetails => error.details ?? {};

export const useAdminCollection = (key: AdminCollectionKey) => {
  const { t, fmt } = useT();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [data, setData] = useState<AdminDocumentPage | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const debouncedQuery = useDebounce(query.trim(), SEARCH_DELAY_MS);

  const load = useCallback(() => {
    void http
      .get<AdminDocumentPage>(`/admin/collections/${key}`, { params: { page, q: debouncedQuery || undefined } })
      .then((result) => {
        setData(result);
        setLoadFailed(false);
      })
      .catch(() => setLoadFailed(true));
  }, [key, page, debouncedQuery]);

  useEffect(load, [load]);

  // A new search starts again from the first page.
  const search = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const describe = (error: Error & { details?: HttpErrorDetails }): AdminMutationResult => {
    const details = errorDetails(error);
    const code = typeof details.error === 'string' ? details.error : '';
    const field = typeof details.field === 'string' ? details.field : undefined;
    if (code === 'INVALID_FIELD' && field) {
      const reason = details.reason === 'REQUIRED' ? 'REQUIRED' : 'INVALID';
      return { ok: false, field, message: fmt(t.admin.errors[reason], { field }) };
    }
    const template = t.admin.errors[code] ?? t.admin.errors.generic;
    return { ok: false, message: fmt(template, { reason: typeof details.reason === 'string' ? details.reason : '' }) };
  };

  const create = async (values: AdminFormValues): Promise<AdminMutationResult> => {
    try {
      const document = await http.post<AdminDocument>(`/admin/collections/${key}`, { values });
      setPage(1);
      load();
      return { ok: true, document };
    } catch (error) {
      return describe(error as Error & { details?: HttpErrorDetails });
    }
  };

  const update = async (id: string, values: AdminFormValues): Promise<AdminMutationResult> => {
    try {
      const document = await http.patch<AdminDocument>(`/admin/collections/${key}/${id}`, { values });
      setData((current) => current && { ...current, items: current.items.map((item) => (item._id === id ? document : item)) });
      return { ok: true, document };
    } catch (error) {
      return describe(error as Error & { details?: HttpErrorDetails });
    }
  };

  const remove = async (id: string): Promise<AdminMutationResult> => {
    try {
      await http.delete(`/admin/collections/${key}/${id}`);
      // Step back a page when the last record on this one is gone.
      if (data && data.items.length === 1 && page > 1) setPage(page - 1);
      else load();
      return { ok: true };
    } catch (error) {
      return describe(error as Error & { details?: HttpErrorDetails });
    }
  };

  return { data, page, setPage, query, search, loadFailed, create, update, remove };
};
