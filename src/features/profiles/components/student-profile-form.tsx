'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { MediaUpload } from '@/features/media/components/media-upload';
import { FormSection } from '@/features/profiles/components/form-section';
import { SaveBar } from '@/features/profiles/components/save-bar';
import { SubjectInput } from '@/features/profiles/components/subject-input';
import { StudentProfileInput, StudentProfileSchema } from '@/features/profiles/validations/profile.validation';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';
import { normalizeSubjects } from '@/shared/utils/subjects';

type SaveMessage = { kind: 'success' | 'error'; text: string } | null;

export const StudentProfileForm = () => {
  const { data: session } = useSession();
  const { t, fmt, subject } = useT();
  const user = session?.user as { name?: string | null; avatar?: string | null } | undefined;
  const [message, setMessage] = useState<SaveMessage>(null);
  const [saved, setSaved] = useState(false);
  const form = useForm<StudentProfileInput>({
    resolver: zodResolver(StudentProfileSchema),
    defaultValues: { bio: '', subjects: [] },
  });
  const subjects = useWatch({ control: form.control, name: 'subjects' }) ?? [];

  useEffect(() => {
    void http.get<StudentProfileInput>('/profiles/me').then((profile) => {
      if (profile) form.reset({ bio: profile.bio ?? '', subjects: normalizeSubjects(profile.subjects ?? []) });
    });
  }, [form]);

  const submit = async (data: StudentProfileInput) => {
    setMessage(null);
    try {
      await http.put('/profiles/me', data);
      form.reset(data);
      setSaved(true);
      setMessage({ kind: 'success', text: t.profileEditor.savedStudent });
    } catch {
      setMessage({ kind: 'error', text: t.profileEditor.saveErrorStudent });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} onChange={() => setMessage(null)}>
      <FormSection title={t.profileEditor.learnTitle} description={t.profileEditor.learnText}>
        <SubjectInput subjects={subjects} onChange={(next) => form.setValue('subjects', next, { shouldDirty: true, shouldValidate: true })} />
      </FormSection>

      <FormSection title={t.profileEditor.goalTitle} description={t.profileEditor.goalText}>
        <Textarea
          {...form.register('bio')}
          rows={4}
          maxLength={1000}
          aria-label={t.profileEditor.goalTitle}
          placeholder={t.profileEditor.goalPlaceholder}
        />
      </FormSection>

      <FormSection id="photo" title={t.profileEditor.photoTitle} description={t.profileEditor.photoStudentText}>
        <MediaUpload
          kind="profile_image"
          label={t.profileEditor.uploadPhoto}
          hint={t.profileEditor.photoHint}
          accept="image/jpeg,image/png,image/webp"
          currentUrl={user?.avatar}
          name={user?.name ?? ''}
        />
      </FormSection>

      {saved && subjects.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">{fmt(t.profileEditor.readyToFind, { subject: subject(subjects[0]) })}</p>
          <Button asChild size="sm"><Link href={`/teachers?subject=${encodeURIComponent(subjects[0])}`}>{t.profileEditor.findTutors}</Link></Button>
        </div>
      )}

      <SaveBar saving={form.formState.isSubmitting} dirty={form.formState.isDirty} message={message} />
    </form>
  );
};
