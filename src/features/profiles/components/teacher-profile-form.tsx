'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { MediaUpload } from '@/features/media/components/media-upload';
import { FormSection } from '@/features/profiles/components/form-section';
import { SaveBar } from '@/features/profiles/components/save-bar';
import { SubjectInput } from '@/features/profiles/components/subject-input';
import { TeacherProfileInput, TeacherProfileSchema } from '@/features/profiles/validations/profile.validation';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';
import { normalizeSubjects } from '@/shared/utils/subjects';

type SaveMessage = { kind: 'success' | 'error'; text: string } | null;

export const TeacherProfileForm = () => {
  const { data: session } = useSession();
  const { t, fmt } = useT();
  const user = session?.user as { name?: string | null; avatar?: string | null } | undefined;
  const [message, setMessage] = useState<SaveMessage>(null);
  const form = useForm<TeacherProfileInput>({
    resolver: zodResolver(TeacherProfileSchema),
    defaultValues: { bio: '', subjects: [], experienceYears: 0, education: '', qualifications: '', certificates: [], licenses: [] },
  });
  const subjects = useWatch({ control: form.control, name: 'subjects' }) ?? [];
  const bio = useWatch({ control: form.control, name: 'bio' }) ?? '';

  useEffect(() => {
    void http.get<TeacherProfileInput>('/profiles/me').then((profile) => {
      if (!profile) return;
      form.reset({
        bio: profile.bio ?? '',
        subjects: normalizeSubjects(profile.subjects ?? []),
        experienceYears: profile.experienceYears ?? 0,
        education: profile.education ?? '',
        qualifications: profile.qualifications ?? '',
        certificates: profile.certificates ?? [],
        licenses: profile.licenses ?? [],
      });
    });
  }, [form]);

  const submit = async (data: TeacherProfileInput) => {
    setMessage(null);
    try {
      await http.put('/profiles/me', data);
      form.reset(data);
      setMessage({ kind: 'success', text: t.profileEditor.savedTeacher });
    } catch {
      setMessage({ kind: 'error', text: t.profileEditor.saveErrorTeacher });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} onChange={() => setMessage(null)}>
      <FormSection id="photo" title={t.profileEditor.photoTitle} description={t.profileEditor.photoTeacherText}>
        <MediaUpload
          kind="profile_image"
          label={t.profileEditor.uploadPhoto}
          hint={t.profileEditor.photoHint}
          accept="image/jpeg,image/png,image/webp"
          currentUrl={user?.avatar}
          name={user?.name ?? ''}
        />
      </FormSection>

      <FormSection title={t.profileEditor.aboutTitle} description={t.profileEditor.aboutText}>
        <Textarea
          {...form.register('bio')}
          rows={6}
          maxLength={2000}
          aria-label={t.profileEditor.bioLabel}
          placeholder={t.profileEditor.bioPlaceholder}
        />
        <p className="text-right text-xs tabular-nums text-muted-foreground">{bio.length} / 2000</p>
      </FormSection>

      <FormSection title={t.profileEditor.subjectsTitle} description={fmt(t.profileEditor.subjectsText, { count: subjects.length })}>
        <SubjectInput subjects={subjects} onChange={(next) => form.setValue('subjects', next, { shouldDirty: true, shouldValidate: true })} />
      </FormSection>

      <FormSection title={t.profileEditor.experienceTitle} description={t.profileEditor.experienceText}>
        <label className="block text-sm font-medium">
          {t.profileEditor.yearsLabel}
          <Input type="number" min={0} max={80} className="mt-2 w-32" {...form.register('experienceYears', { valueAsNumber: true })} />
        </label>
        <label className="block text-sm font-medium">
          {t.profileEditor.educationLabel}
          <Input className="mt-2" placeholder={t.profileEditor.educationPlaceholder} {...form.register('education')} />
        </label>
      </FormSection>

      <FormSection title={t.profileEditor.qualificationsTitle} description={t.profileEditor.qualificationsText}>
        <Textarea
          {...form.register('qualifications')}
          rows={4}
          maxLength={2000}
          aria-label={t.profileEditor.qualificationsTitle}
          placeholder={t.profileEditor.qualificationsPlaceholder}
        />
        <MediaUpload
          kind="qualification"
          label={t.profileEditor.uploadDocument}
          hint={t.profileEditor.documentHint}
          accept="application/pdf,image/jpeg,image/png"
        />
      </FormSection>

      <SaveBar saving={form.formState.isSubmitting} dirty={form.formState.isDirty} message={message} />
    </form>
  );
};
