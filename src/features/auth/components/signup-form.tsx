'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';

import { RolePicker } from '@/features/auth/components/role-picker';
import { useRegister } from '@/features/auth/hooks/use-register';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { SignUpSchema, SignUpType } from '@/features/auth/validations/auth.validation';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { useT } from '@/shared/hooks/use-t';
import { safeRedirect } from '@/shared/utils/safe-redirect';

export const SignUpForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const { register } = useRegister(callbackUrl);
  const { loading, error } = useAuthStore();
  const { t } = useT();

  const form = useForm<SignUpType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: searchParams.get('role') === 'teacher' ? 'teacher' : 'student',
    },
  });
  const signInHref = callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/sign-in';

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">{t.auth.createTitle}</CardTitle>
        <CardDescription>{t.auth.createLead}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(register)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <RolePicker value={field.value} onChange={field.onChange} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.auth.fullName}</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" placeholder={t.auth.fullNamePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.common.email}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.common.password}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" placeholder={t.auth.passwordHint} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.auth.creating : t.auth.create}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t.common.or}</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signIn('google', { callbackUrl: safeRedirect(callbackUrl) })}
            >
              {t.common.continueWithGoogle}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t.auth.haveAccount}{' '}
              <Link href={signInHref} className="underline underline-offset-4 hover:text-primary">
                {t.common.signIn}
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
