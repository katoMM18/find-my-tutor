import { type ReactNode } from 'react';

type FormSectionProps = {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export const FormSection = ({ id, title, description, children }: FormSectionProps) => (
  <section id={id} className="scroll-mt-24 grid gap-4 border-b border-border py-8 first:pt-0 md:grid-cols-3 md:gap-8">
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
    <div className="space-y-4 md:col-span-2">{children}</div>
  </section>
);
