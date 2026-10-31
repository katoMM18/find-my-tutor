export const LEARNER_LEVELS = ['beginner', 'school', 'exam', 'university'] as const;

export type LearnerLevel = (typeof LEARNER_LEVELS)[number];
