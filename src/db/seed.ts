import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import { job, user } from "./schema";

function getRequiredEnvironmentVariable(name: "DATABASE_URL" | "EMPLOYER_ID") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not defined.`);
  }

  return value;
}

const databaseUrl = getRequiredEnvironmentVariable("DATABASE_URL");
const employerId = getRequiredEnvironmentVariable("EMPLOYER_ID");

const db = drizzle(databaseUrl);

const seededJobs = [
  {
    id: "b85c9b53-f8ee-41c2-b43d-4f727b75b1a1",
    title: "Frontend Developer",
    description:
      "<h2>About the role</h2><p>Build responsive and accessible web applications using React and TypeScript.</p><h3>Responsibilities</h3><ul><li>Develop reusable UI components</li><li>Work closely with designers</li><li>Improve application performance</li></ul>",
    location: "Bengaluru, Karnataka",
    employmentType: "FULL_TIME" as const,
    workplaceType: "HYBRID" as const,
    experienceLevel: "MID" as const,
    minimumSalary: 900000,
    maximumSalary: 1400000,
    currency: "INR",
    openings: 2,
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
  },
  {
    id: "885d5a46-caea-4798-9066-7cacd78a20c2",
    title: "Backend Developer",
    description:
      "<h2>About the role</h2><p>Design and maintain reliable backend services for our growing platform.</p><h3>Responsibilities</h3><ul><li>Build REST APIs</li><li>Design database schemas</li><li>Monitor service performance</li></ul>",
    location: "Hyderabad, Telangana",
    employmentType: "FULL_TIME" as const,
    workplaceType: "REMOTE" as const,
    experienceLevel: "MID" as const,
    minimumSalary: 1000000,
    maximumSalary: 1600000,
    currency: "INR",
    openings: 2,
    skills: ["Node.js", "PostgreSQL", "TypeScript", "Docker"],
  },
  {
    id: "962fd5b8-eb9c-4ada-9506-0473b776d5c3",
    title: "UI/UX Designer",
    description:
      "<h2>About the role</h2><p>Create clear and thoughtful experiences for job seekers and employers.</p><h3>Responsibilities</h3><ul><li>Create wireframes and prototypes</li><li>Maintain the design system</li><li>Run usability reviews</li></ul>",
    location: "Pune, Maharashtra",
    employmentType: "FULL_TIME" as const,
    workplaceType: "HYBRID" as const,
    experienceLevel: "MID" as const,
    minimumSalary: 700000,
    maximumSalary: 1100000,
    currency: "INR",
    openings: 1,
    skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
  },
  {
    id: "26183017-58ae-4d24-b8eb-572f2317ef74",
    title: "React Developer Intern",
    description:
      "<h2>About the internship</h2><p>Learn modern frontend development while contributing to production features.</p><h3>What you will do</h3><ul><li>Build React components</li><li>Fix UI issues</li><li>Participate in code reviews</li></ul>",
    location: "Chennai, Tamil Nadu",
    employmentType: "INTERNSHIP" as const,
    workplaceType: "ONSITE" as const,
    experienceLevel: "ENTRY" as const,
    minimumSalary: 20000,
    maximumSalary: 30000,
    currency: "INR",
    openings: 3,
    skills: ["JavaScript", "React", "HTML", "CSS"],
  },
  {
    id: "d3596808-c183-4f21-8d92-ac0e6ac357d5",
    title: "Senior Full Stack Engineer",
    description:
      "<h2>About the role</h2><p>Lead the delivery of full-stack features across our hiring platform.</p><h3>Responsibilities</h3><ul><li>Own technical projects</li><li>Review system architecture</li><li>Mentor other engineers</li></ul>",
    location: "Remote, India",
    employmentType: "FULL_TIME" as const,
    workplaceType: "REMOTE" as const,
    experienceLevel: "SENIOR" as const,
    minimumSalary: 1800000,
    maximumSalary: 2600000,
    currency: "INR",
    openings: 1,
    skills: ["Next.js", "Node.js", "PostgreSQL", "AWS"],
  },
];

async function seed() {
  const [employer] = await db
    .select({
      id: user.id,
      role: user.role,
    })
    .from(user)
    .where(eq(user.id, employerId))
    .limit(1);

  if (!employer) {
    throw new Error(`No user exists with EMPLOYER_ID "${employerId}".`);
  }

  if (employer.role !== "EMPLOYER") {
    throw new Error("EMPLOYER_ID must belong to an employer account.");
  }

  const publishedAt = new Date();
  const expiresAt = new Date(publishedAt);
  expiresAt.setDate(expiresAt.getDate() + 30);

  for (const seededJob of seededJobs) {
    const values = {
      ...seededJob,
      employerId,
      status: "PUBLISHED" as const,
      publishedAt,
      expiresAt,
    };

    await db
      .insert(job)
      .values(values)
      .onConflictDoUpdate({
        target: job.id,
        set: {
          employerId: values.employerId,
          title: values.title,
          description: values.description,
          location: values.location,
          employmentType: values.employmentType,
          workplaceType: values.workplaceType,
          experienceLevel: values.experienceLevel,
          minimumSalary: values.minimumSalary,
          maximumSalary: values.maximumSalary,
          currency: values.currency,
          openings: values.openings,
          skills: values.skills,
          status: values.status,
          publishedAt: values.publishedAt,
          expiresAt: values.expiresAt,
        },
      });
  }

  console.log(`${seededJobs.length} seed jobs are available.`);
}

seed().catch((error: unknown) => {
  console.error("Failed to seed jobs:", error);
  process.exitCode = 1;
});
