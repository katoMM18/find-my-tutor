// A tutor's flyer goes on the public wall only once it is worth reading:
// a real introduction, a photo, a price, at least one teaching day and a believable experience figure.
export const LISTING_MIN_BIO_LENGTH = 80;
export const LISTING_MAX_EXPERIENCE_YEARS = 60;

// The "typical price" hint needs a few tutors behind it before it means anything.
export const PRICE_GUIDE_MIN_SAMPLES = 3;

// "Match me": how many listed tutors are scored, how many are shown, and how far over budget still counts.
export const MATCH_CANDIDATE_LIMIT = 24;
export const MATCH_RESULT_COUNT = 3;
export const MATCH_BUDGET_STRETCH = 1.2;
// A tutor who usually replies within this many minutes counts as quick to reply.
export const MATCH_FAST_REPLY_MINUTES = 180;

// Below this many results, the wall shows a "teach this subject?" flyer to recruit tutors.
export const RECRUIT_BELOW_RESULTS = 6;
