'use client';
import { type AdminField, type AdminJsonValue } from '@/features/admin/types/admin.types';
import { Badge } from '@/shared/components/ui/badge';
import { useT } from '@/shared/hooks/use-t';

type AdminCellValueProps = {
  field: AdminField;
  value: AdminJsonValue | undefined;
};

const Empty = () => <span className="text-muted-foreground">-</span>;

// The last six characters are enough to tell ids apart in a table; the full id is in the title.
const ShortId = ({ id }: { id: string }) => (
  <span title={id} className="font-mono text-xs text-muted-foreground">
    …{id.slice(-6)}
  </span>
);

export const AdminCellValue = ({ field, value }: AdminCellValueProps) => {
  const { t, intl, dateTime } = useT();

  if (value === null || value === undefined || value === '') return <Empty />;

  switch (field.type) {
    case 'boolean':
      return <Badge variant={value === true ? 'soft' : 'muted'}>{value === true ? t.admin.yes : t.admin.no}</Badge>;
    case 'date':
      return typeof value === 'string' ? <span className="whitespace-nowrap">{dateTime(value)}</span> : <Empty />;
    case 'number':
      return <span className="tabular-nums">{typeof value === 'number' ? value.toLocaleString(intl) : String(value)}</span>;
    case 'objectId':
      return typeof value === 'string' ? <ShortId id={value} /> : <Empty />;
    case 'objectIdList':
      if (!Array.isArray(value) || value.length === 0) return <Empty />;
      return (
        <span className="flex flex-wrap gap-1.5">
          {value.slice(0, 2).map((id) => <ShortId key={String(id)} id={String(id)} />)}
          {value.length > 2 && <span className="text-xs text-muted-foreground">+{value.length - 2}</span>}
        </span>
      );
    case 'stringList':
      if (!Array.isArray(value) || value.length === 0) return <Empty />;
      return <span className="line-clamp-1 max-w-56">{value.join(', ')}</span>;
    case 'json':
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {Array.isArray(value) ? `[${value.length}]` : '{…}'}
        </span>
      );
    case 'select':
      return (
        <Badge variant={field.key === 'role' && value === 'admin' ? 'default' : 'outline'}>
          {field.key === 'role' ? (t.admin.roles[String(value)] ?? String(value)) : String(value)}
        </Badge>
      );
    default:
      return <span className="line-clamp-1 max-w-72 break-all">{String(value)}</span>;
  }
};
