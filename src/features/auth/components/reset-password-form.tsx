'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { useResetPassword } from '@/features/auth/hooks/use-reset-password';
import { ResetPasswordFormSchema, ResetPasswordFormType } from '@/features/auth/validations/auth.validation';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { useT } from '@/shared/hooks/use-t';

type ResetPasswordFormProps = {
  token: string;
};

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const { t } = useT();
  const { resetPassword, saving, done, error } = useResetPassword(token);
  const form = useForm<ResetPasswordFormType>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  return (
    <Card className="w-full max-w-md border-rule">
      <CardHeader>
        <CardTitle className="text-3xl font-extrabold"><h1>{t.auth.resetTitle}</h1></CardTitle>
        <CardDescription>{t.auth.resetLead}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {done ? (
          <>
            <Alert role="status">{t.auth.resetDone}</Alert>
            <Button asChild className="w-full"><Link href="/sign-in">{t.common.signIn}</Link></Button>
          </>
        ) : !token ? (
          <Alert variant="destructive">{t.auth.resetInvalid}</Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(resetPassword)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.auth.newPassword}</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t.auth.confirmPassword}</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    {fieldState.error?.message === 'PASSWORDS_DIFFER' ? (
                      <p className="text-sm text-destructive">{t.auth.passwordsDiffer}</p>
                    ) : (
                      <FormMessage />
                    )}
                  </FormItem>
                )}
              />
              {error && <Alert variant="destructive">{error}</Alert>}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? t.auth.resetSaving : t.auth.resetSubmit}
              </Button>
            </form>
          </Form>
        )}
        {!done && (
          <p className="text-center text-sm">
            <Link href="/forgot-password" className="text-ink underline-offset-4 hover:underline">{t.auth.forgotSubmit}</Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
};
