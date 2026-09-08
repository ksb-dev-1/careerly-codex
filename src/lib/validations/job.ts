import { z } from "zod";

export const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
] as const;

export const WORKPLACE_TYPES = ["ONSITE", "REMOTE", "HYBRID"] as const;

export const EXPERIENCE_LEVELS = ["ENTRY", "MID", "SENIOR", "LEAD"] as const;

export const CURRENCIES = ["INR", "USD", "EUR"] as const;

export const jobInputSchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().min(50).max(10_000),
    location: z.string().trim().max(120).optional(),
    employmentType: z.enum(EMPLOYMENT_TYPES),
    workplaceType: z.enum(WORKPLACE_TYPES),
    experienceLevel: z.enum(EXPERIENCE_LEVELS),
    minimumSalary: z.number().int().nonnegative().nullable(),
    maximumSalary: z.number().int().nonnegative().nullable(),
    currency: z.enum(CURRENCIES),
    openings: z.number().int().min(1).max(1_000),
    skills: z
      .array(z.string().trim().min(1).max(50))
      .min(1)
      .max(30)
      .transform((skills) => [...new Set(skills)]),
    expiresAt: z.date().nullable(),
  })
  .superRefine((input, context) => {
    if (input.workplaceType !== "REMOTE" && !input.location) {
      context.addIssue({
        code: "custom",
        message: "Location is required for onsite and hybrid jobs.",
        path: ["location"],
      });
    }

    if (
      input.minimumSalary !== null &&
      input.maximumSalary !== null &&
      input.minimumSalary > input.maximumSalary
    ) {
      context.addIssue({
        code: "custom",
        message: "Maximum salary must be greater than minimum salary.",
        path: ["maximumSalary"],
      });
    }

    if (input.expiresAt && input.expiresAt <= new Date()) {
      context.addIssue({
        code: "custom",
        message: "Expiration date must be in the future.",
        path: ["expiresAt"],
      });
    }
  });

export type JobInput = z.input<typeof jobInputSchema>;
export type ValidatedJobInput = z.output<typeof jobInputSchema>;
