import { LogOut } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

type SignOutButtonProps = {
  label: string;
  onClick: () => void;
};

// Sign out inside the phone menu drawers, where the header has no room for it.
export const SignOutButton = ({ label, onClick }: SignOutButtonProps) => (
  <Button variant="ghost" size="sm" onClick={onClick} className="ml-auto gap-2 text-muted-foreground sm:hidden">
    <LogOut className="size-4" aria-hidden="true" />
    {label}
  </Button>
);
