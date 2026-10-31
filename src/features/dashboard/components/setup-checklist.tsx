'use client';

import { ArrowRight, Check, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';

export type SetupStep = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  complete: boolean;
};

type SetupChecklistProps = {
  steps: SetupStep[];
};

export const SetupChecklist = ({ steps }: SetupChecklistProps) => {
  const { t, fmt } = useT();
  const completed = steps.filter((step) => step.complete).length;
  const firstOpenStep = steps.find((step) => !step.complete);

  return (
    <Card className="gap-0 overflow-hidden border-rule py-0">
      <CardHeader className="gap-3 border-b border-rule py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold">{t.dashboard.setupTitle}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {fmt(t.dashboard.setupProgress, { done: completed, total: steps.length })}
            </p>
          </div>
        </div>
        <div
          className="flex"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={completed}
          aria-label={fmt(t.dashboard.setupProgress, { done: completed, total: steps.length })}
        >
          {steps.map((step) => (
            <span key={step.id} className={cn('h-2 flex-1 border-r-2 border-card last:border-r-0', step.complete ? 'bg-ink' : 'bg-rule')} />
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ol className="divide-y divide-rule">
          {steps.map((step) => {
            const Icon = step.icon;
            const body = (
              <>
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                    step.complete ? 'text-ink' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step.complete ? <Check className="size-5" aria-hidden="true" /> : <Icon className="size-4" aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block text-sm font-semibold', step.complete && 'text-muted-foreground line-through')}>{step.title}</span>
                  {!step.complete && <span className="mt-1 block text-sm text-muted-foreground">{step.description}</span>}
                </span>
              </>
            );
            return (
              <li key={step.id}>
                {step.complete ? (
                  <div className="flex items-center gap-4 px-6 py-3">{body}</div>
                ) : (
                  <Link href={step.href} className="flex items-center gap-4 px-6 py-4 transition-colors outline-none hover:bg-muted focus-visible:bg-muted">
                    {body}
                    <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
        {firstOpenStep && (
          <div className="border-t border-rule px-6 py-4">
            <Button asChild size="sm">
              <Link href={firstOpenStep.href}>{t.dashboard.continueSetup}</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
