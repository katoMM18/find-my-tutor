'use client';

import { useWatch, type UseFormReturn } from 'react-hook-form';

import { FormSection } from '@/features/profiles/components/form-section';
import { TeacherProfileInput } from '@/features/profiles/validations/profile.validation';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
import { LESSON_FORMATS, OTHER_CITIES, PRICE_MAX_GEL, PRICE_MIN_GEL, TBILISI_DISTRICTS } from '@/shared/const/lesson.const';
import { useT } from '@/shared/hooks/use-t';
import { isLessonArea, isLessonFormat } from '@/shared/utils/lesson';

type LessonOfferSectionProps = {
  form: UseFormReturn<TeacherProfileInput>;
};

// Price, where lessons happen, the free intro lesson and whether new students are welcome.
export const LessonOfferSection = ({ form }: LessonOfferSectionProps) => {
  const { t, fmt } = useT();
  const [lessonFormats, areas, acceptingStudents, freeIntro] = useWatch({
    control: form.control,
    name: ['lessonFormats', 'areas', 'acceptingStudents', 'freeIntro'],
  });
  const inPerson = lessonFormats.some((format) => format !== 'online');

  return (
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
          checked={freeIntro}
          onCheckedChange={(checked) => form.setValue('freeIntro', checked === true, { shouldDirty: true })}
          className="mt-0.5"
        />
        <span>
          <span className="block font-medium">{t.lessons.freeIntroLabel}</span>
          <span className="block text-sm font-normal text-muted-foreground">{t.lessons.freeIntroHint}</span>
        </span>
      </Label>
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
  );
};
