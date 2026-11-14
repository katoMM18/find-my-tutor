'use client';

import { Check, Share2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { useT } from '@/shared/hooks/use-t';

type ShareProfileButtonProps = {
  name: string;
  className?: string;
};

const COPIED_MS = 2000;

// Parents forward tutors to each other: the phone's share sheet when there is one, otherwise copy the link.
export const ShareProfileButton = ({ name, className }: ShareProfileButtonProps) => {
  const { t, fmt } = useT();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href.split('#')[0];
    const title = fmt(t.profile.shareTitle, { name });
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <Button type="button" variant="outline" onClick={() => void share()} className={className}>
      {copied ? <Check className="size-4" aria-hidden="true" /> : <Share2 className="size-4" aria-hidden="true" />}
      <span aria-live="polite">{copied ? t.profile.linkCopied : t.profile.share}</span>
    </Button>
  );
};
