'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { RequestSummary } from '@/features/requests/components/request-summary';
import { useRequests } from '@/features/requests/hooks/use-requests';
import { PublicRequest } from '@/features/requests/types/request.types';
import { RequestFormSchema, RequestFormType } from '@/features/requests/validations/request.validation';
import { PageHeading } from '@/shared/components/layout/page-heading';
import { Alert } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Textarea } from '@/shared/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
import { LESSON_FORMATS, OTHER_CITIES, TBILISI_DISTRICTS } from '@/shared/const/lesson.const';
import { REQUEST_GOALS } from '@/shared/const/requests.const';
import { ANY_FILTER_VALUE, SUBJECT_CATALOG } from '@/shared/const/subjects.const';
import { useT } from '@/shared/hooks/use-t';
import { isLessonArea, isLessonFormat } from '@/shared/utils/lesson';

export const StudentRequests = () => {
  const { t, plural, subject: subjectName } = useT();
  const { items, busyId, error, create, close } = useRequests<PublicRequest>();
  const [posted, setPosted] = useState(false);
  const form = useForm<RequestFormType>({
    resolver: zodResolver(RequestFormSchema),
    defaultValues: { subject: '', goal: 'national_exams', format: '', area: '', budget: null, note: '' },
  });
  const [subject, goal, format, area] = useWatch({ control: form.control, name: ['subject', 'goal', 'format', 'area'] });

  const submit = async (data: RequestFormType) => {
    setPosted(false);
    if (await create(data)) {
      form.reset();
      setPosted(true);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeading title={t.requests.title} description={t.requests.lead} />

      <form onSubmit={form.handleSubmit(submit)} className="paper space-y-5 rounded-xl p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="request-subject">{t.requests.subject}</Label>
            <Select value={subject} onValueChange={(value) => form.setValue('subject', value, { shouldValidate: true })}>
              <SelectTrigger id="request-subject" aria-invalid={Boolean(form.formState.errors.subject)}>
                <SelectValue placeholder={t.discovery.allSubjects} />
              </SelectTrigger>
              <SelectContent>
                {SUBJECT_CATALOG.map((category) => (
                  <SelectGroup key={category.label}>
                    <SelectLabel>{t.subjectCategories[category.label] ?? category.label}</SelectLabel>
                    {category.subjects.map((item) => <SelectItem key={item} value={item}>{subjectName(item)}</SelectItem>)}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="request-budget">{t.requests.budget}</Label>
            <Input
              id="request-budget"
              type="number"
              min={1}
              {...form.register('budget', { setValueAs: (value) => (value === '' || value === null ? null : Number(value)) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t.requests.goal}</Label>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={goal}
            onValueChange={(value) => {
              const next = REQUEST_GOALS.find((item) => item === value);
              if (next) form.setValue('goal', next);
            }}
          >
            {REQUEST_GOALS.map((item) => <ToggleGroupItem key={item} value={item}>{t.requests.goals[item]}</ToggleGroupItem>)}
          </ToggleGroup>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select value={format || ANY_FILTER_VALUE} onValueChange={(value) => form.setValue('format', isLessonFormat(value) ? value : '')}>
            <SelectTrigger aria-label={t.lessons.format}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_FILTER_VALUE}>{t.lessons.anyFormat}</SelectItem>
              {LESSON_FORMATS.map((item) => <SelectItem key={item} value={item}>{t.lessons.formats[item]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={area || ANY_FILTER_VALUE} onValueChange={(value) => form.setValue('area', isLessonArea(value) ? value : '')}>
            <SelectTrigger aria-label={t.lessons.area}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_FILTER_VALUE}>{t.lessons.anyArea}</SelectItem>
              <SelectGroup>
                <SelectLabel>{t.lessons.tbilisi}</SelectLabel>
                {TBILISI_DISTRICTS.map((item) => <SelectItem key={item} value={item}>{t.lessons.areas[item]}</SelectItem>)}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>{t.lessons.otherCities}</SelectLabel>
                {OTHER_CITIES.map((item) => <SelectItem key={item} value={item}>{t.lessons.areas[item]}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="request-note">{t.requests.note}</Label>
          <Textarea id="request-note" rows={3} maxLength={1000} placeholder={t.requests.notePlaceholder} {...form.register('note')} />
        </div>

        {error && <Alert variant="destructive">{error}</Alert>}
        {posted && <Alert role="status">{t.requests.posted}</Alert>}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? t.requests.posting : t.requests.post}
        </Button>
      </form>

      <h2 className="mb-3 mt-10 font-heading text-2xl font-bold">{t.requests.mine}</h2>
      {items === null ? (
        <Skeleton className="h-28" />
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">{t.requests.noneMine}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((request) => (
            <li key={request.id} className="paper flex flex-col gap-3 rounded-xl p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-heading text-lg font-bold">{subjectName(request.subject)}</p>
                  <Badge variant={request.status === 'open' ? 'outline' : 'muted'}>
                    {request.status === 'open' ? t.requests.open : t.requests.closed}
                  </Badge>
                </div>
                <RequestSummary request={request} />
                <p className="text-sm font-medium">{plural(t.requests.replies, request.replyCount)}</p>
              </div>
              {request.status === 'open' && (
                <Button variant="outline" size="sm" disabled={busyId === request.id} onClick={() => void close(request.id)}>
                  {t.requests.close}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
