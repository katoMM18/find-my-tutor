import { LESSON_AREAS, LESSON_FORMATS, type LessonArea, type LessonFormat } from '@/shared/const/lesson.const';

export function isLessonFormat(value: string): value is LessonFormat {
  return (LESSON_FORMATS as readonly string[]).includes(value);
}

export function isLessonArea(value: string): value is LessonArea {
  return (LESSON_AREAS as readonly string[]).includes(value);
}
