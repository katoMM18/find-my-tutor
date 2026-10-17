import { type EN_DICTIONARY } from '@/shared/const/dictionary-en.const';

export type Dictionary = typeof EN_DICTIONARY;

export type PluralForms = { one: string; other: string };

export type TemplateValues = Record<string, string | number>;
