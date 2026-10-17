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
  const progress = Math.round((completed / steps.length) * 10);

  return (
    <Card className="animate-rise animate-rise-1 overflow-hidden border-primary/20">
      <CardHeader className="border-b bg-primary/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{t.dashboard.setupTitle}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {fmt(t.dashboard.setupProgress, { done: completed, total: steps.length })}
            </p>
          </div>
          <span className="font-mono text-sm font-semibold text-primary">
            {Math.round((completed / steps.length) * 100)}%
          </span>
        </div>
        <div
          className="grid grid-cols-10 gap-1"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={completed}
          aria-label={fmt(t.dashboard.setupProgress, { done: completed, total: steps.length })}
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <span
              key={index}
              className={cn('h-2 rounded-full', index < progress ? 'bg-primary' : 'bg-primary/10')}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ol>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.id} className={cn(index !== steps.length - 1 && 'border-b')}>
                <Link
                  href={step.complete ? '#' : step.href}
                  className={cn(
                    'flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50',
                    step.complete && 'cursor-default'
                  )}
                  onClick={(event) => {
                    if (step.complete) event.preventDefault();
                  }}
                >
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full',
                      step.complete
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step.complete ? <Check className="size-4" /> : <Icon className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{step.title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {step.description}
                    </span>
                  </span>
                  {!step.complete && <ArrowRight className="size-4 text-muted-foreground" />}
                </Link>
              </li>
            );
          })}
        </ol>
        {firstOpenStep && (
          <div className="border-t bg-muted/30 px-6 py-4">
            <Button asChild size="sm">
              <Link href={firstOpenStep.href}>{t.dashboard.continueSetup}</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
