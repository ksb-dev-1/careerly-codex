import { headers } from "next/headers";

import type { Metadata } from "next";

import { AudiencePathsSection } from "@/components/marketing/audience-paths-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { HomeHero } from "@/components/marketing/home-hero";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Careerly | Find your next opportunity",
  description:
    "Careerly connects job seekers with meaningful opportunities and employers with great talent.",
};

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const destination =
    session?.user.role === "EMPLOYER"
      ? { href: "/employer/jobs", label: "Your jobs" }
      : session?.user.role === "JOB_SEEKER"
        ? { href: "/job-seeker/profile/edit", label: "Your profile" }
        : session
          ? { href: "/select-user-role", label: "Choose role" }
          : { href: "/sign-in", label: "Sign in" };

  return (
    <>
      <main>
        <HomeHero
          destination={destination}
          isAuthenticated={Boolean(session)}
        />
        <AudiencePathsSection />
        <HowItWorksSection />
        <FaqSection />
      </main>
      <MarketingFooter href={destination.href} label={destination.label} />
    </>
  );
}
