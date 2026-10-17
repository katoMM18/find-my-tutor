'use client';

import { CalendarClock, ImagePlus, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { type SetupStep } from '@/features/dashboard/components/setup-checklist';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';

type Profile = {
  _id?: string;
  bio?: string;
  subjects?: string[];
  experienceYears?: number;
  education?: string;
};

type Availability = {
  weekly?: { intervals: { start: string; end: string }[] }[];
};

type Media = { kind: 'profile_image' | 'qualification' };

export const useProfileSetup = (role: 'teacher' | 'student') => {
  const { t } = useT();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availability, setAvailability] = useState<Availability>({});
  const [media, setMedia] = useState<Media[]>([]);

  useEffect(() => {
    const load = async () => {
      const [profileResult, availabilityResult, mediaResult] = await Promise.all([
        http.get<Profile>('/profiles/me'),
        role === 'teacher' ? http.get<Availability>('/availability/me') : Promise.resolve({}),
        http.get<Media[]>('/media').catch(() => []),
      ]);
      setProfile(profileResult);
      setAvailability(availabilityResult);
      setMedia(mediaResult);
    };
    void load();
  }, [role]);

  const steps = useMemo<SetupStep[]>(() => {
    const hasPhoto = media.some((item) => item.kind === 'profile_image');
    const hasAvailability = availability.weekly?.some((day) => day.intervals.length > 0) ?? false;
    const photoStep: SetupStep = {
      id: 'photo',
      title: t.dashboard.setup.photoTitle,
      description: role === 'teacher' ? t.dashboard.setup.photoTeacher : t.dashboard.setup.photoStudent,
      href: '/profile#photo',
      icon: ImagePlus,
      complete: hasPhoto,
    };

    if (role === 'student') {
      return [
        {
          id: 'student-profile',
          title: t.dashboard.setup.studentProfileTitle,
          description: t.dashboard.setup.studentProfileText,
          href: '/profile',
          icon: UserRound,
          complete: Boolean(profile?.bio?.trim() && profile.subjects?.length),
        },
        photoStep,
      ];
    }

    return [
      {
        id: 'teacher-profile',
        title: t.dashboard.setup.teacherProfileTitle,
        description: t.dashboard.setup.teacherProfileText,
        href: '/profile',
        icon: UserRound,
        complete: Boolean(profile?.bio?.trim() && profile.subjects?.length && profile.education?.trim()),
      },
      photoStep,
      {
        id: 'teacher-availability',
        title: t.dashboard.setup.availabilityTitle,
        description: t.dashboard.setup.availabilityText,
        href: '/availability',
        icon: CalendarClock,
        complete: hasAvailability,
      },
    ];
  }, [availability, media, profile, role, t]);

  return { profile, steps, loaded: profile !== null };
};
