import { z } from 'zod';

const QualificationSchema = z.object({
  name: z.string().min(1).max(200),
  issuer: z.string().min(1).max(200),
  issueDate: z.string().min(1).max(20),
  expirationDate: z.string().max(20),
});

export const TeacherProfileSchema = z.object({
  bio: z.string().max(2000),
  subjects: z.array(z.string().min(1).max(100)).max(20),
  experienceYears: z.number().int().min(0).max(80),
  education: z.string().max(1000),
  qualifications: z.string().max(2000),
  certificates: z.array(QualificationSchema).max(20),
  licenses: z.array(QualificationSchema).max(20),
});

export const StudentProfileSchema = z.object({
  bio: z.string().max(1000),
  subjects: z.array(z.string().min(1).max(100)).max(20),
});

export type TeacherProfileInput = z.infer<typeof TeacherProfileSchema>;
export type StudentProfileInput = z.infer<typeof StudentProfileSchema>;
