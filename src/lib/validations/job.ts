import { z } from "zod";

export const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
] as const;

export const WORKPLACE_TYPES = ["ONSITE", "REMOTE", "HYBRID"] as const;

export const CURRENCIES = ["INR", "USD", "EUR"] as const;

export const jobInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Job title must contain at least 3 characters.")
      .max(120, "Job title cannot exceed 120 characters."),
    description: z
      .string()
      .trim()
      .min(50, "Description must contain at least 50 characters.")
      .max(10_000, "Description cannot exceed 10,000 characters."),
    location: z
      .string()
      .trim()
      .max(120, "Location cannot exceed 120 characters.")
      .optional(),
    employmentType: z.enum(EMPLOYMENT_TYPES),
    workplaceType: z.enum(WORKPLACE_TYPES),
    minimumExperience: z
      .number()
      .int("Minimum experience must be a whole number.")
      .min(0, "Minimum experience cannot be negative.")
      .max(50, "Minimum experience cannot exceed 50 years."),
    maximumExperience: z
      .number()
      .int("Maximum experience must be a whole number.")
      .min(0, "Maximum experience cannot be negative.")
      .max(50, "Maximum experience cannot exceed 50 years."),
    minimumSalary: z
      .number()
      .int("Minimum salary must be a whole number.")
      .nonnegative("Minimum salary cannot be negative.")
      .nullable(),
    maximumSalary: z
      .number()
      .int("Maximum salary must be a whole number.")
      .nonnegative("Maximum salary cannot be negative.")
      .nullable(),
    currency: z.enum(CURRENCIES),
    openings: z
      .number()
      .int("Openings must be a whole number.")
      .min(1, "Add at least one opening.")
      .max(1_000, "Openings cannot exceed 1,000."),
    skills: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Remove empty skills from the list.")
          .max(50, "Each skill must be 50 characters or fewer."),
      )
      .min(1, "Add at least one skill.")
      .max(30, "You can add up to 30 skills.")
      .transform((skills) => [...new Set(skills)]),
    expiresAt: z.date().nullable(),
  })
  .superRefine((input, context) => {
    if (input.minimumExperience >= input.maximumExperience) {
      context.addIssue({
        code: "custom",
        message: "Maximum experience must be greater than minimum experience.",
        path: ["maximumExperience"],
      });
    }

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
