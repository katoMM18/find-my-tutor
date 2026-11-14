'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { MediaUpload } from '@/features/media/components/media-upload';
import { BioCounter } from '@/features/profiles/components/bio-counter';
import { FormSection } from '@/features/profiles/components/form-section';
import { SaveBar } from '@/features/profiles/components/save-bar';
import { SubjectInput } from '@/features/profiles/components/subject-input';
import { TeacherProfileInput, TeacherProfileSchema } from '@/features/profiles/validations/profile.validation';
import { VerificationStatus } from '@/features/verification/components/verification-status';
import { useMyVerification } from '@/features/verification/hooks/use-my-verification';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
import { LESSON_FORMATS, OTHER_CITIES, PRICE_MAX_GEL, PRICE_MIN_GEL, TBILISI_DISTRICTS } from '@/shared/const/lesson.const';
import { LISTING_MAX_EXPERIENCE_YEARS as MAX_YEARS } from '@/shared/const/listing.const';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';
import { isLessonArea, isLessonFormat } from '@/shared/utils/lesson';
import { normalizeSubjects } from '@/shared/utils/subjects';

type SaveMessage = { kind: 'success' | 'error'; text: string } | null;

export const TeacherProfileForm = () => {
  const { data: session } = useSession();
  const { t, fmt } = useT();
  const user = session?.user as { name?: string | null; avatar?: string | null } | undefined;
  const [message, setMessage] = useState<SaveMessage>(null);
  const { verification, refresh: refreshVerification } = useMyVerification();
  const form = useForm<TeacherProfileInput>({
    resolver: zodResolver(TeacherProfileSchema),
    defaultValues: {
      bio: '',
      subjects: [],
      experienceYears: 0,
      education: '',
      qualifications: '',
      certificates: [],
      licenses: [],
      pricePerLesson: null,
      lessonFormats: ['online'],
      areas: [],
      acceptingStudents: true,
    },
  });
  const subjects = useWatch({ control: form.control, name: 'subjects' }) ?? [];
  const bio = useWatch({ control: form.control, name: 'bio' }) ?? '';
  const lessonFormats = useWatch({ control: form.control, name: 'lessonFormats' }) ?? [];
  const areas = useWatch({ control: form.control, name: 'areas' }) ?? [];
  const acceptingStudents = useWatch({ control: form.control, name: 'acceptingStudents' }) ?? true;
  const inPerson = lessonFormats.some((format) => format !== 'online');

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
        pricePerLesson: profile.pricePerLesson ?? null,
        lessonFormats: profile.lessonFormats?.length ? profile.lessonFormats : ['online'],
        areas: profile.areas ?? [],
        acceptingStudents: profile.acceptingStudents ?? true,
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
          rows={6} maxLength={2000}
          aria-label={t.profileEditor.bioLabel}
          placeholder={t.profileEditor.bioPlaceholder}
        />
        <BioCounter bio={bio} max={2000} />
      </FormSection>

      <FormSection title={t.profileEditor.subjectsTitle} description={fmt(t.profileEditor.subjectsText, { count: subjects.length })}>
        <SubjectInput subjects={subjects} onChange={(next) => form.setValue('subjects', next, { shouldDirty: true, shouldValidate: true })} />
      </FormSection>

      <FormSection title={t.lessons.formatsLabel} description={t.lessons.priceHint}>
        <div className="space-y-2">
          <Label htmlFor="profile-price">{t.lessons.priceLabel}</Label>
          <Input
            id="profile-price"
            type="number"
            min={PRICE_MIN_GEL}
            max={PRICE_MAX_GEL}
            className="w-32"
            {...form.register('pricePerLesson', { setValueAs: (value) => (value === '' || value === null ? null : Number(value)) })}
          />
          {form.formState.errors.pricePerLesson && (
            <p className="text-sm text-destructive">{fmt(t.lessons.upTo, { price: PRICE_MAX_GEL })}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>{t.lessons.formatsLabel}</Label>
          <ToggleGroup
            type="multiple"
            variant="outline"
            size="sm"
            value={lessonFormats}
            onValueChange={(next) => next.length && form.setValue('lessonFormats', next.filter(isLessonFormat), { shouldDirty: true })}
          >
            {LESSON_FORMATS.map((format) => <ToggleGroupItem key={format} value={format}>{t.lessons.formats[format]}</ToggleGroupItem>)}
          </ToggleGroup>
        </div>
        {inPerson && (
          <div className="space-y-2">
            <Label>{t.lessons.areasLabel}</Label>
            <p className="text-sm text-muted-foreground">{t.lessons.areasHint}</p>
            {[{ label: t.lessons.tbilisi, items: TBILISI_DISTRICTS }, { label: t.lessons.otherCities, items: OTHER_CITIES }].map((group) => (
              <div key={group.label} className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground">{group.label}</p>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  size="sm"
                  value={areas.filter((area) => (group.items as readonly string[]).includes(area))}
                  onValueChange={(next) => {
                    const others = areas.filter((area) => !(group.items as readonly string[]).includes(area));
                    form.setValue('areas', [...others, ...next.filter(isLessonArea)], { shouldDirty: true });
                  }}
                >
                  {group.items.map((area) => <ToggleGroupItem key={area} value={area}>{t.lessons.areas[area]}</ToggleGroupItem>)}
                </ToggleGroup>
              </div>
            ))}
          </div>
        )}
        <Label className="flex items-start gap-3">
          <Checkbox
            checked={acceptingStudents}
            onCheckedChange={(checked) => form.setValue('acceptingStudents', checked === true, { shouldDirty: true })}
            className="mt-0.5"
          />
          <span>
            <span className="block font-medium">{t.lessons.acceptingLabel}</span>
            <span className="block text-sm font-normal text-muted-foreground">{t.lessons.acceptingHint}</span>
          </span>
        </Label>
      </FormSection>

      <FormSection title={t.profileEditor.experienceTitle} description={t.profileEditor.experienceText}>
        <div className="space-y-2">
          <Label htmlFor="profile-years">{t.profileEditor.yearsLabel}</Label>
          <Input id="profile-years" type="number" min={0} max={MAX_YEARS} className="w-32" {...form.register('experienceYears', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-education">{t.profileEditor.educationLabel}</Label>
          <Input id="profile-education" placeholder={t.profileEditor.educationPlaceholder} {...form.register('education')} />
        </div>
      </FormSection>

      <FormSection title={t.profileEditor.qualificationsTitle} description={t.profileEditor.qualificationsText}>
        <Textarea
          {...form.register('qualifications')}
          rows={4}
          maxLength={2000}
          aria-label={t.profileEditor.qualificationsTitle}
          placeholder={t.profileEditor.qualificationsPlaceholder}
        />
      </FormSection>

      <FormSection id="verification" title={t.verification.sectionTitle} description={t.verification.sectionText}>
        <VerificationStatus verification={verification} />
        <MediaUpload
          kind="qualification"
          label={verification?.status === 'rejected' ? t.verification.resubmit : t.verification.upload}
          hint={t.verification.uploadHint}
          accept="application/pdf,image/jpeg,image/png"
          onUploaded={refreshVerification}
        />
      </FormSection>

      <SaveBar saving={form.formState.isSubmitting} dirty={form.formState.isDirty} message={message} />
    </form>
  );
};
