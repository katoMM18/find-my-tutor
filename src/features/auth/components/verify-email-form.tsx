'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useVerifyEmail } from '@/features/auth/hooks/use-verify-email';
import { VerifyEmailSchema, VerifyEmailType } from '@/features/auth/validations/auth.validation';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { useT } from '@/shared/hooks/use-t';

type VerifyEmailFormProps = {
  email: string;
};

export const VerifyEmailForm = ({ email }: VerifyEmailFormProps) => {
  const { t, fmt } = useT();
  const { verify, resend, verifying, error, notice, cooldownUntil } = useVerifyEmail(useSearchParams().get('next'));
  const [now, setNow] = useState(() => Date.now());
  const secondsLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const form = useForm<VerifyEmailType>({
    resolver: zodResolver(VerifyEmailSchema),
    defaultValues: { code: '' },
  });

  return (
    <Card className="w-full max-w-md border-rule">
      <CardHeader>
        <CardTitle className="text-3xl font-extrabold"><h1>{t.auth.verifyTitle}</h1></CardTitle>
        <CardDescription>{fmt(t.auth.verifyLead, { email })}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(verify)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.auth.verifyCode}</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      className="h-14 text-center font-heading text-2xl font-bold tracking-widest"
                      {...field}
                      onChange={(event) => field.onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <Alert variant="destructive">{error}</Alert>}
            {notice && <Alert role="status">{notice}</Alert>}
            <Button type="submit" className="w-full" disabled={verifying}>
              {verifying ? t.auth.verifying : t.auth.verifySubmit}
            </Button>
            <Button type="button" variant="outline" className="w-full" disabled={secondsLeft > 0} onClick={() => void resend()}>
              {secondsLeft > 0 ? fmt(t.auth.verifyResendIn, { seconds: secondsLeft }) : t.auth.verifyResend}
            </Button>
            <Button type="button" variant="link" className="w-full text-muted-foreground" onClick={() => void signOut({ callbackUrl: '/sign-up' })}>
              {t.auth.verifyWrongEmail}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
