'use client';

import { TearTab } from '@/features/discovery/components/tear-tab';
import { NOTICE_BOARD_FLYERS } from '@/shared/const/notice-board.const';
import { useT } from '@/shared/hooks/use-t';
import { cn } from '@/shared/lib/utils';
import { paperForSubject } from '@/shared/utils/subjects';

const TAB_COUNT = [0, 1, 2, 3];

const flyerClassName = 'paper tape w-full min-w-0 self-start rounded-lg pt-6 transition duration-300 hover:z-10 hover:rotate-0 hover:-translate-y-1';

// The hero wall: two subject flyers and a "teach?" flyer, pinned up crookedly. Every tab is a real link.
export const NoticeBoard = () => {
  const { t, subject } = useT();

  return (
    <div className="pin-drop sway grid grid-cols-2 gap-x-5 gap-y-10">
      {NOTICE_BOARD_FLYERS.map((flyer) => {
        const href = `/teachers?subject=${encodeURIComponent(flyer.subject)}`;
        return (
          <section
            key={flyer.subject}
            aria-label={subject(flyer.subject)}
            className={cn(flyerClassName, paperForSubject(flyer.subject), flyer.tilt)}
          >
            <div className="px-5 pb-4">
              <p className="break-words font-heading text-2xl font-extrabold leading-none tracking-tight sm:text-3xl">{subject(flyer.subject)}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t.home.flyerLine}</p>
            </div>
            <div className="perforation grid grid-cols-4">
              {TAB_COUNT.map((tab) => (
                <TearTab key={tab} href={href} className="min-h-24 border-r border-dashed border-foreground/15 px-0 py-3 last:border-r-0">
                  <span className="vertical-label whitespace-nowrap text-xs">{t.home.flyerTab}</span>
                </TearTab>
              ))}
            </div>
          </section>
        );
      })}

      <section aria-labelledby="teach-heading" className={cn(flyerClassName, 'col-span-2 mx-auto max-w-xs bg-paper-white -rotate-1')}>
        <div className="px-5 pb-4">
          <h2 id="teach-heading" className="font-heading text-3xl font-extrabold leading-none tracking-tight text-mark">{t.home.teachTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed">{t.home.teachLead}</p>
        </div>
        <div className="perforation grid grid-cols-4">
          {TAB_COUNT.map((tab) => (
            <TearTab key={tab} href="/sign-up?role=teacher" className="min-h-24 border-r border-dashed border-foreground/15 px-0 py-3 last:border-r-0">
              <span className="vertical-label whitespace-nowrap text-xs">{t.home.teachTab}</span>
            </TearTab>
          ))}
        </div>
      </section>
    </div>
  );
};
