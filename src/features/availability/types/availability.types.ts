export type PublicAvailability = {
  timezone: string;
  weekly: {
    day: number;
    intervals: { start: string; end: string }[];
  }[];
  exceptions: {
    date: string;
    isAvailable: boolean;
    intervals: { start: string; end: string }[];
  }[];
};
