'use client';

import { ArrowLeftRight } from 'lucide-react';
import { useState } from 'react';

import { useChangeRole } from '@/features/auth/hooks/use-change-role';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useT } from '@/shared/hooks/use-t';

type RoleSwitchCardProps = {
  role: 'teacher' | 'student';
};

export const RoleSwitchCard = ({ role }: RoleSwitchCardProps) => {
  const { t } = useT();
  const { changeRole, switching, failed } = useChangeRole();
  const [confirming, setConfirming] = useState(false);
  const target = role === 'student' ? 'teacher' : 'student';
  const copy = t.roleSwitch;

  return (
    <Card id="switch-role" className="mt-8 scroll-mt-24">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{target === 'teacher' ? copy.toTeacherTitle : copy.toStudentTitle}</CardTitle>
        <CardDescription className="max-w-prose">{target === 'teacher' ? copy.toTeacherBody : copy.toStudentBody}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {confirming ? (
          <div className="space-y-3">
            <p className="font-semibold">{target === 'teacher' ? copy.confirmTeacher : copy.confirmStudent}</p>
            <p className="text-sm text-muted-foreground">{copy.confirmBody}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={switching} onClick={() => setConfirming(false)}>{copy.cancel}</Button>
              <Button disabled={switching} onClick={() => void changeRole(target)}>{switching ? copy.switching : copy.confirm}</Button>
            </div>
          </div>
        ) : (
          <Button variant={target === 'teacher' ? 'default' : 'outline'} onClick={() => setConfirming(true)}>
            <ArrowLeftRight className="size-4" aria-hidden="true" />
            {target === 'teacher' ? copy.toTeacherAction : copy.toStudentAction}
          </Button>
        )}
        {failed && <Alert variant="destructive">{copy.error}</Alert>}
      </CardContent>
    </Card>
  );
};
