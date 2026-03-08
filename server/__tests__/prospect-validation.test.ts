import { validateProspect, getDeadlineStatus } from "../prospect-helpers";

describe("prospect creation validation", () => {
  test("rejects a blank company name", () => {
    const result = validateProspect({
      companyName: "",
      roleTitle: "Software Engineer",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Company name is required");
  });

  test("rejects a blank role title", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Role title is required");
  });
});

describe("salary field validation", () => {
  test("accepts a valid salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: 120000,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts when salary is omitted", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts when salary is null", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: null,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("rejects a negative salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: -50000,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a positive number");
  });

  test("rejects zero as salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: 0,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a positive number");
  });

  test("rejects a non-integer salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: 120000.50,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a whole number");
  });

  test("rejects a string salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: "120000" as unknown,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a whole number");
  });
});

describe("application deadline validation", () => {
  test("accepts a valid deadline date", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      applicationDeadline: "2025-12-31",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts when deadline is omitted", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts when deadline is null", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      applicationDeadline: null,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("rejects an invalid date string", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      applicationDeadline: "not-a-date",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Application deadline must be a valid date");
  });

  test("rejects a non-string deadline", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      applicationDeadline: 12345 as unknown,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Application deadline must be a date string");
  });
});

describe("getDeadlineStatus", () => {
  const referenceDate = new Date(2025, 5, 15);

  test("returns 'reached' for a past deadline", () => {
    expect(getDeadlineStatus("2025-06-10", referenceDate)).toBe("reached");
  });

  test("returns 'reached' for today's date", () => {
    expect(getDeadlineStatus("2025-06-15", referenceDate)).toBe("reached");
  });

  test("returns 'due-soon' for deadline within 7 days", () => {
    expect(getDeadlineStatus("2025-06-20", referenceDate)).toBe("due-soon");
  });

  test("returns 'due-soon' for deadline exactly 7 days away", () => {
    expect(getDeadlineStatus("2025-06-22", referenceDate)).toBe("due-soon");
  });

  test("returns 'upcoming' for deadline more than 7 days away", () => {
    expect(getDeadlineStatus("2025-06-23", referenceDate)).toBe("upcoming");
  });

  test("returns 'upcoming' for a far future deadline", () => {
    expect(getDeadlineStatus("2025-12-31", referenceDate)).toBe("upcoming");
  });

  test("returns null for empty string", () => {
    expect(getDeadlineStatus("", referenceDate)).toBeNull();
  });

  test("returns null for invalid date", () => {
    expect(getDeadlineStatus("invalid", referenceDate)).toBeNull();
  });
});
