import { type ReactNode } from 'react';

type PageHeadingProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export const PageHeading = ({ title, description, actions }: PageHeadingProps) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="font-heading text-4xl font-extrabold leading-none sm:text-5xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
    </div>
    {actions}
  </div>
);
