import { type ReactNode } from 'react';

type FormSectionProps = {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export const FormSection = ({ id, title, description, children }: FormSectionProps) => (
  <section id={id} className="scroll-mt-24 grid grid-cols-1 gap-4 border-b border-border py-8 first:pt-0 last-of-type:border-b-0 md:grid-cols-3 md:gap-8">
    <div className="min-w-0">
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
    <div className="min-w-0 space-y-4 md:col-span-2">{children}</div>
  </section>
);
