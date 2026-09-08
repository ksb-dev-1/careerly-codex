import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role", { enum: ["JOB_SEEKER", "EMPLOYER"] }),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const employerProfile = pgTable("employer_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  companyName: text("company_name"),
  logoUrl: text("logo_url"),
  industry: text("industry"),
  location: text("location"),
  about: text("about"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const jobSeekerProfile = pgTable("job_seeker_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  headline: text("headline"),
  experience: text("experience"),
  skills: text("skills").array().default([]).notNull(),
  location: text("location"),
  about: text("about"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const jobStatus = pgEnum("job_status", ["DRAFT", "PUBLISHED", "CLOSED"]);

export const employmentType = pgEnum("employment_type", [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
]);

export const workplaceType = pgEnum("workplace_type", [
  "ONSITE",
  "REMOTE",
  "HYBRID",
]);

export const experienceLevel = pgEnum("experience_level", [
  "ENTRY",
  "MID",
  "SENIOR",
  "LEAD",
]);

export const job = pgTable(
  "job",
  {
    id: text("id").primaryKey(),
    employerId: text("employer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    location: text("location"),
    employmentType: employmentType("employment_type")
      .default("FULL_TIME")
      .notNull(),
    workplaceType: workplaceType("workplace_type").default("ONSITE").notNull(),
    experienceLevel: experienceLevel("experience_level")
      .default("ENTRY")
      .notNull(),
    minimumSalary: integer("minimum_salary"),
    maximumSalary: integer("maximum_salary"),
    currency: text("currency").default("INR").notNull(),
    openings: integer("openings").default(1).notNull(),
    skills: text("skills").array().default([]).notNull(),
    status: jobStatus("status").default("DRAFT").notNull(),
    publishedAt: timestamp("published_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("job_employer_id_idx").on(table.employerId),
    index("job_status_created_at_idx").on(table.status, table.createdAt),
  ],
);

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  jobs: many(job),
  employerProfile: one(employerProfile),
  jobSeekerProfile: one(jobSeekerProfile),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const employerProfileRelations = relations(
  employerProfile,
  ({ one }) => ({
    user: one(user, {
      fields: [employerProfile.userId],
      references: [user.id],
    }),
  }),
);

export const jobSeekerProfileRelations = relations(
  jobSeekerProfile,
  ({ one }) => ({
    user: one(user, {
      fields: [jobSeekerProfile.userId],
      references: [user.id],
    }),
  }),
);

export const jobRelations = relations(job, ({ one }) => ({
  employer: one(user, {
    fields: [job.employerId],
    references: [user.id],
  }),
}));
