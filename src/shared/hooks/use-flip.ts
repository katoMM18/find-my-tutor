'use client';

import { useLayoutEffect, useRef } from 'react';

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

type Point = { left: number; top: number };

// FLIP for a list or grid: children marked data-flip-key glide from their old spot to the new one when the order
// changes, and new children fade in. Runs after every render whose `order` changed.
export const useFlip = <T extends HTMLElement>(order: string) => {
  const containerRef = useRef<T>(null);
  const previous = useRef(new Map<string, Point>());

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const origin = container.getBoundingClientRect();
    const next = new Map<string, Point>();

    container.querySelectorAll<HTMLElement>(':scope > [data-flip-key]').forEach((element) => {
      const key = element.dataset.flipKey ?? '';
      const rect = element.getBoundingClientRect();
      const point = { left: rect.left - origin.left, top: rect.top - origin.top };
      next.set(key, point);
      const before = previous.current.get(key);
      if (reduce || previous.current.size === 0) return;
      if (!before) {
        element.animate([{ opacity: 0, transform: 'translateY(0.75rem)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: EASE_OUT });
      } else if (before.left !== point.left || before.top !== point.top) {
        element.animate(
          [{ transform: `translate(${before.left - point.left}px, ${before.top - point.top}px)` }, { transform: 'none' }],
          { duration: 520, easing: EASE_OUT }
        );
      }
    });

    previous.current = next;
  }, [order]);

  return containerRef;
};
