'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password';
import { ForgotPasswordSchema, ForgotPasswordType } from '@/features/auth/validations/auth.validation';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { useT } from '@/shared/hooks/use-t';

export const ForgotPasswordForm = () => {
  const { t } = useT();
  const { requestReset, sending, sent, error } = useForgotPassword();
  const form = useForm<ForgotPasswordType>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  return (
    <Card className="w-full max-w-md border-rule">
      <CardHeader>
        <CardTitle className="text-3xl font-extrabold"><h1>{t.auth.forgotTitle}</h1></CardTitle>
        <CardDescription>{t.auth.forgotLead}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sent ? (
          <Alert role="status">{t.auth.forgotSent}</Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(requestReset)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.common.email}</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <Alert variant="destructive">{error}</Alert>}
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? t.auth.forgotSending : t.auth.forgotSubmit}
              </Button>
            </form>
          </Form>
        )}
        <p className="text-center text-sm">
          <Link href="/sign-in" className="text-ink underline-offset-4 hover:underline">{t.auth.backToSignIn}</Link>
        </p>
      </CardContent>
    </Card>
  );
};
