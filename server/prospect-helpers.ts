import { STATUSES, INTEREST_LEVELS } from "@shared/schema";

export function getNextStatus(currentStatus: string): string {
  const terminalStatuses = ["Offer", "Rejected", "Withdrawn"];
  if (terminalStatuses.includes(currentStatus)) {
    return currentStatus;
  }
  const index = STATUSES.indexOf(currentStatus as (typeof STATUSES)[number]);
  if (index === -1 || index >= STATUSES.length - 1) {
    return currentStatus;
  }
  const next = STATUSES[index + 1];
  if (next === "Rejected" || next === "Withdrawn") {
    return currentStatus;
  }
  return next;
}

export function validateProspect(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.companyName || typeof data.companyName !== "string" || data.companyName.trim() === "") {
    errors.push("Company name is required");
  }

  if (!data.roleTitle || typeof data.roleTitle !== "string" || data.roleTitle.trim() === "") {
    errors.push("Role title is required");
  }

  if (data.status !== undefined) {
    if (!STATUSES.includes(data.status as (typeof STATUSES)[number])) {
      errors.push(`Status must be one of: ${STATUSES.join(", ")}`);
    }
  }

  if (data.interestLevel !== undefined) {
    if (!INTEREST_LEVELS.includes(data.interestLevel as (typeof INTEREST_LEVELS)[number])) {
      errors.push(`Interest level must be one of: ${INTEREST_LEVELS.join(", ")}`);
    }
  }

  if (data.salary !== undefined && data.salary !== null) {
    if (typeof data.salary !== "number" || !Number.isInteger(data.salary)) {
      errors.push("Salary must be a whole number");
    } else if (data.salary <= 0) {
      errors.push("Salary must be a positive number");
    }
  }

  if (data.applicationDeadline !== undefined && data.applicationDeadline !== null) {
    if (typeof data.applicationDeadline !== "string") {
      errors.push("Application deadline must be a date string");
    } else if (isNaN(Date.parse(data.applicationDeadline))) {
      errors.push("Application deadline must be a valid date");
    }
  }

  return { valid: errors.length === 0, errors };
}

export function getDeadlineStatus(deadline: string, now?: Date): "reached" | "due-soon" | "upcoming" | null {
  if (!deadline) return null;
  const today = now ?? new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const deadlineDate = new Date(deadline + "T00:00:00");
  if (isNaN(deadlineDate.getTime())) return null;

  const diffMs = deadlineDate.getTime() - todayStart.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "reached";
  if (diffDays <= 7) return "due-soon";
  return "upcoming";
}

export function isTerminalStatus(status: string): boolean {
  return status === "Rejected" || status === "Withdrawn" || status === "Offer";
}
