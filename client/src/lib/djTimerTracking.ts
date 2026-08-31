export const DJ_TIMER_FILTERS = [
  "all",
  "overdue",
  "due_soon",
  "awaiting_contact",
  "contacted",
  "completed",
] as const;

export type DJTimerFilter = (typeof DJ_TIMER_FILTERS)[number];
export type DJTimerFollowUpStatus = "pending" | "contacted" | "removed";
export type DJTimerUrgency = "overdue" | "due_soon" | "scheduled";

export type TrackableDJTimer = {
  completed: boolean;
  removalDate: string;
  followUpStatus?: DJTimerFollowUpStatus;
};

function dateAtStart(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getDaysUntilRemoval(
  removalDate: string,
  referenceDate = new Date()
): number | null {
  const removal = parseLocalDate(removalDate);
  if (!removal) return null;
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((removal.getTime() - dateAtStart(referenceDate).getTime()) / millisecondsPerDay);
}

export function getTimerUrgency(
  timer: TrackableDJTimer,
  referenceDate = new Date()
): DJTimerUrgency {
  const days = getDaysUntilRemoval(timer.removalDate, referenceDate);
  if (days !== null && days < 0) return "overdue";
  if (days !== null && days <= 3) return "due_soon";
  return "scheduled";
}

export function getFollowUpStatus(
  timer: TrackableDJTimer
): DJTimerFollowUpStatus {
  if (timer.completed) return "removed";
  return timer.followUpStatus === "contacted" ? "contacted" : "pending";
}

export function filterDJTimers<T extends TrackableDJTimer>(
  timers: readonly T[],
  filter: DJTimerFilter,
  referenceDate = new Date()
): T[] {
  return timers.filter((timer) => {
    const followUpStatus = getFollowUpStatus(timer);
    const urgency = getTimerUrgency(timer, referenceDate);

    switch (filter) {
      case "all":
        return !timer.completed;
      case "overdue":
        return !timer.completed && urgency === "overdue";
      case "due_soon":
        return !timer.completed && urgency === "due_soon";
      case "awaiting_contact":
        return !timer.completed && followUpStatus === "pending";
      case "contacted":
        return !timer.completed && followUpStatus === "contacted";
      case "completed":
        return timer.completed;
    }
  });
}
