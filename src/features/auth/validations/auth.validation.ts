import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export type LoginType = z.infer<typeof LoginSchema>;

export const SignUpSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['teacher', 'student']),
});

export type SignUpType = z.infer<typeof SignUpSchema>;

export const ChangeRoleSchema = z.object({
  role: z.enum(['teacher', 'student']),
});

export type ChangeRoleType = z.infer<typeof ChangeRoleSchema>;

export const VerifyEmailSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

export type VerifyEmailType = z.infer<typeof VerifyEmailSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordType = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(8).max(100),
});

export type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;

// Client-side form: same rule plus a repeat field that must match.
export const ResetPasswordFormSchema = z
  .object({ password: z.string().min(8).max(100), confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'PASSWORDS_DIFFER' });

export type ResetPasswordFormType = z.infer<typeof ResetPasswordFormSchema>;
