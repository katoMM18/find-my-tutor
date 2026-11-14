'use client';

import { LISTING_MIN_BIO_LENGTH } from '@/shared/const/listing.const';
import { useT } from '@/shared/hooks/use-t';

type BioCounterProps = {
  bio: string;
  max: number;
};

// Under the bio: how far the tutor is from appearing in search, and the usual character count.
export const BioCounter = ({ bio, max }: BioCounterProps) => {
  const { t, fmt } = useT();
  const length = bio.trim().length;

  return (
    <p className="flex justify-between gap-3 text-xs tabular-nums text-muted-foreground">
      <span aria-live="polite">
        {length < LISTING_MIN_BIO_LENGTH ? fmt(t.profileEditor.bioToList, { count: LISTING_MIN_BIO_LENGTH - length }) : t.profileEditor.bioListed}
      </span>
      <span>{bio.length} / {max}</span>
    </p>
  );
};
