'use client';
import { type UseFormReturn } from 'react-hook-form';

import { type AdminField, type AdminFieldType, type AdminFormValues } from '@/features/admin/types/admin.types';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { useT } from '@/shared/hooks/use-t';

// Radix Select has no empty value, so an optional select uses this stand-in for "nothing".
const NONE = '__none__';

const INPUT_TYPES: Partial<Record<AdminFieldType, string>> = {
  number: 'number',
  date: 'datetime-local',
  email: 'email',
  password: 'password',
};

type AdminFieldInputProps = {
  field: AdminField;
  form: UseFormReturn<AdminFormValues>;
  disabled: boolean;
  isNew: boolean;
};

export const AdminFieldInput = ({ field, form, disabled, isNew }: AdminFieldInputProps) => {
  const { t, fmt } = useT();

  const hint =
    field.type === 'password'
      ? isNew ? t.admin.passwordCreateHint : t.admin.passwordHint
      : field.type === 'json'
        ? t.admin.jsonHint
        : field.type === 'objectIdList' || field.type === 'stringList'
          ? field.options
            ? `${t.admin.listHint} ${fmt(t.admin.optionsHint, { options: field.options.join(', ') })}`
            : t.admin.listHint
          : null;

  const label = `${field.key}${field.required || (field.type === 'password' && isNew) ? ' *' : ''}`;

  return (
    <FormField
      control={form.control}
      name={field.key}
      render={({ field: control }) => (
        <FormItem className={field.type === 'boolean' ? 'flex flex-row items-center gap-3 space-y-0' : undefined}>
          {field.type === 'boolean' ? (
            <>
              <FormControl>
                <Checkbox checked={control.value === true} onCheckedChange={(checked) => control.onChange(checked === true)} disabled={disabled} />
              </FormControl>
              <FormLabel className="font-mono text-sm">{label}</FormLabel>
            </>
          ) : (
            <>
              <FormLabel className="font-mono text-sm">{label}</FormLabel>
              <FormControl>
                {field.type === 'select' ? (
                  <Select
                    value={typeof control.value === 'string' && control.value ? control.value : NONE}
                    onValueChange={(value) => control.onChange(value === NONE ? '' : value)}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {!field.required && <SelectItem value={NONE}>{t.admin.none}</SelectItem>}
                      {field.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {field.key === 'role' ? (t.admin.roles[option] ?? option) : option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'longText' || field.type === 'json' || field.type === 'objectIdList' || field.type === 'stringList' ? (
                  <Textarea
                    value={typeof control.value === 'string' ? control.value : ''}
                    onChange={control.onChange}
                    onBlur={control.onBlur}
                    name={control.name}
                    disabled={disabled}
                    rows={field.type === 'json' ? 8 : 3}
                    spellCheck={field.type === 'longText'}
                    className={field.type === 'longText' ? undefined : 'font-mono text-xs'}
                  />
                ) : (
                  <Input
                    value={typeof control.value === 'string' ? control.value : ''}
                    onChange={control.onChange}
                    onBlur={control.onBlur}
                    name={control.name}
                    disabled={disabled}
                    type={INPUT_TYPES[field.type] ?? 'text'}
                    step={field.type === 'number' ? 'any' : undefined}
                    autoComplete={field.type === 'password' ? 'new-password' : 'off'}
                    className={field.type === 'objectId' ? 'font-mono text-xs' : undefined}
                  />
                )}
              </FormControl>
              {hint && <FormDescription>{hint}</FormDescription>}
            </>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
