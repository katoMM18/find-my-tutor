'use client';

import { useState } from 'react';

import { StarInput } from '@/features/ratings/components/star-input';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useT } from '@/shared/hooks/use-t';

type ReviewFormProps = {
  teacherName: string;
  onSubmit: (value: number, comment: string, result: string) => Promise<boolean>;
};

export const ReviewForm = ({ teacherName, onSubmit }: ReviewFormProps) => {
  const { t, fmt } = useT();
  const [value, setValue] = useState(0);
  const [comment, setComment] = useState('');
  const [result, setResult] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const submit = async () => {
    if (!value) return;
    setSubmitting(true);
    await onSubmit(value, comment.trim(), result.trim());
    setSubmitting(false);
    setConfirming(false);
  };

  return (
    <div className="space-y-3">
      <StarInput value={value} onChange={setValue} />
      <Textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={2000}
        placeholder={fmt(t.reviews.commentPlaceholder, { name: teacherName })}
        aria-label={t.reviews.commentLabel}
      />
      <div className="space-y-1.5">
        <Label htmlFor="review-result">{t.reviews.resultLabel}</Label>
        <Input
          id="review-result"
          value={result}
          onChange={(event) => setResult(event.target.value)}
          maxLength={120}
          placeholder={t.reviews.resultPlaceholder}
        />
        <p className="text-xs text-muted-foreground">{t.reviews.resultHint}</p>
      </div>
      {confirming ? (
        <div className="rounded-lg paper py-4 pl-6 pr-4">
          <p className="font-bold">{t.reviews.confirmTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{fmt(t.reviews.confirmBody, { name: teacherName })}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirming(false)} disabled={submitting}>{t.reviews.keepEditing}</Button>
            <Button type="button" onClick={submit} disabled={submitting}>{submitting ? t.reviews.posting : t.reviews.post}</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{t.reviews.permanentNote}</p>
          <Button type="button" onClick={() => setConfirming(true)} disabled={!value}>{t.reviews.post}</Button>
        </div>
      )}
    </div>
  );
};
