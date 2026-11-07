// What a student is preparing for when they post a request.
export const REQUEST_GOALS = ['national_exams', 'school', 'language_exam', 'university', 'other'] as const;

export type RequestGoal = (typeof REQUEST_GOALS)[number];

// How many open requests a student can have at once, so the board stays fresh.
export const MAX_OPEN_REQUESTS = 3;
