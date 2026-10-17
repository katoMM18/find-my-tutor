import { type ReactNode } from 'react';

type PageHeadingProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export const PageHeading = ({ title, description, actions }: PageHeadingProps) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      {description && <p className="mt-1 text-muted-foreground">{description}</p>}
    </div>
    {actions}
  </div>
);
