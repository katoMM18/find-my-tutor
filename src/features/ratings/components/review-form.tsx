'use client';

import { useState } from 'react';

import { StarInput } from '@/features/ratings/components/star-input';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { useT } from '@/shared/hooks/use-t';

type ReviewFormProps = {
  teacherName: string;
  onSubmit: (value: number, comment: string) => Promise<boolean>;
};

export const ReviewForm = ({ teacherName, onSubmit }: ReviewFormProps) => {
  const { t, fmt } = useT();
  const [value, setValue] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!value) return;
    setSubmitting(true);
    await onSubmit(value, comment.trim());
    setSubmitting(false);
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">{t.reviews.permanentNote}</p>
        <Button type="button" onClick={submit} disabled={!value || submitting}>
          {submitting ? t.reviews.posting : t.reviews.post}
        </Button>
      </div>
    </div>
  );
};
