import { describe, expect, it } from "vitest";
import {
  filterDJTimers,
  getDaysUntilRemoval,
  getFollowUpStatus,
  getTimerUrgency,
} from "@/lib/djTimerTracking";

const today = new Date(2026, 7, 30);

const timers = [
  { id: "overdue", completed: false, removalDate: "2026-08-28", followUpStatus: "pending" as const },
  { id: "near", completed: false, removalDate: "2026-09-01", followUpStatus: "contacted" as const },
  { id: "later", completed: false, removalDate: "2026-09-10", followUpStatus: "pending" as const },
  { id: "removed", completed: true, removalDate: "2026-08-29", followUpStatus: "pending" as const },
];

describe("djTimerTracking", () => {
  it("calcula o prazo em dias usando a data local", () => {
    expect(getDaysUntilRemoval("2026-09-01", today)).toBe(2);
    expect(getDaysUntilRemoval("2026-08-28", today)).toBe(-2);
    expect(getDaysUntilRemoval("data-inválida", today)).toBeNull();
  });

  it("classifica prazo vencido, próximo e programado", () => {
    expect(getTimerUrgency(timers[0], today)).toBe("overdue");
    expect(getTimerUrgency(timers[1], today)).toBe("due_soon");
    expect(getTimerUrgency(timers[2], today)).toBe("scheduled");
  });

  it("considera retirada confirmada como status final", () => {
    expect(getFollowUpStatus(timers[3])).toBe("removed");
  });

  it("filtra a fila por urgência e contato", () => {
    expect(filterDJTimers(timers, "overdue", today).map((timer) => timer.id)).toEqual(["overdue"]);
    expect(filterDJTimers(timers, "due_soon", today).map((timer) => timer.id)).toEqual(["near"]);
    expect(filterDJTimers(timers, "awaiting_contact", today).map((timer) => timer.id)).toEqual(["overdue", "later"]);
    expect(filterDJTimers(timers, "contacted", today).map((timer) => timer.id)).toEqual(["near"]);
  });

  it("mantém retirados fora das pendências ativas", () => {
    expect(filterDJTimers(timers, "all", today).map((timer) => timer.id)).toEqual(["overdue", "near", "later"]);
    expect(filterDJTimers(timers, "completed", today).map((timer) => timer.id)).toEqual(["removed"]);
  });
});
