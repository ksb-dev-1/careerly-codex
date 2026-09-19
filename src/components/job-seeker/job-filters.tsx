"use client";

import { useState } from "react";
import type { ReactNode, SubmitEvent } from "react";

import { useRouter } from "next/navigation";

import {
  ChevronDown,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type JobFiltersProps = {
  initialFilters: {
    q: string;
    location: string;
    skill: string;
    workplaceType: string;
    employmentType: string;
    experience: string;
    minimumSalary: string;
    sort: string;
  };
  children: ReactNode;
};

export function JobFilters({ children, initialFilters }: JobFiltersProps) {
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [workplaceType, setWorkplaceType] = useState(
    initialFilters.workplaceType || "ALL",
  );
  const [employmentType, setEmploymentType] = useState(
    initialFilters.employmentType || "ALL",
  );
  const [experience, setExperience] = useState(
    initialFilters.experience || "ALL",
  );
  const [minimumSalary, setMinimumSalary] = useState(
    initialFilters.minimumSalary || "ALL",
  );
  const [sort, setSort] = useState(initialFilters.sort || "NEWEST");
  const activeFilterCount = [
    initialFilters.q,
    initialFilters.location,
    initialFilters.skill,
    initialFilters.workplaceType,
    initialFilters.employmentType,
    initialFilters.experience,
    initialFilters.minimumSalary,
    initialFilters.sort !== "NEWEST" ? initialFilters.sort : "",
  ].filter(Boolean).length;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const q = String(formData.get("q") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const skill = String(formData.get("skill") ?? "").trim();

    if (q) params.set("q", q);
    if (location) params.set("location", location);
    if (skill) params.set("skill", skill);
    if (workplaceType !== "ALL") params.set("workplaceType", workplaceType);
    if (employmentType !== "ALL") params.set("employmentType", employmentType);
    if (experience !== "ALL") params.set("experience", experience);
    if (minimumSalary !== "ALL") {
      params.set("minimumSalary", minimumSalary);
    }
    if (sort !== "NEWEST") params.set("sort", sort);

    const query = params.toString();
    router.push(query ? `/job-seeker/jobs?${query}` : "/job-seeker/jobs");
  }

  function handleReset() {
    setWorkplaceType("ALL");
    setEmploymentType("ALL");
    setExperience("ALL");
    setMinimumSalary("ALL");
    setSort("NEWEST");
    router.push("/job-seeker/jobs");
  }

  return (
    <form className="mt-7" onSubmit={handleSubmit}>
      <Card className="gap-0 py-0 shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.55fr)_auto]">
            <div className="relative">
              <Label className="sr-only" htmlFor="job-search">
                Search by keyword
              </Label>
              <Search
                aria-hidden="true"
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="h-11 pl-9"
                defaultValue={initialFilters.q}
                id="job-search"
                name="q"
                placeholder="Job title, company, or keyword"
                type="search"
              />
            </div>

            <div className="relative">
              <Label className="sr-only" htmlFor="job-location">
                Search by location
              </Label>
              <MapPin
                aria-hidden="true"
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="h-11 pl-9"
                defaultValue={initialFilters.location}
                id="job-location"
                name="location"
                placeholder="City, state, or country"
                type="search"
              />
            </div>

            <Button className="h-11 px-6" type="submit">
              Search jobs
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20">
          <Card className="gap-0 py-0">
            <CardHeader className="py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                  <CardTitle>All filters</CardTitle>
                </div>
                {activeFilterCount > 0 ? (
                  <Badge variant="secondary">{activeFilterCount}</Badge>
                ) : null}
                <Button
                  aria-expanded={mobileFiltersOpen}
                  aria-label={
                    mobileFiltersOpen ? "Hide job filters" : "Show job filters"
                  }
                  className="ml-auto lg:hidden"
                  onClick={() => setMobileFiltersOpen((isOpen) => !isOpen)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <ChevronDown
                    aria-hidden="true"
                    className={mobileFiltersOpen ? "rotate-180" : undefined}
                  />
                </Button>
              </div>
              <CardDescription>Refine your results</CardDescription>
            </CardHeader>

            <CardContent
              className={`${mobileFiltersOpen ? "block" : "hidden"} space-y-5 border-t py-5 lg:block`}
            >
              <div className="space-y-2">
                <Label htmlFor="job-skill">Skill</Label>
                <Input
                  className="h-9"
                  defaultValue={initialFilters.skill}
                  id="job-skill"
                  name="skill"
                  placeholder="For example, React"
                  type="search"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workplace-filter">Workplace</Label>
                <Select onValueChange={setWorkplaceType} value={workplaceType}>
                  <SelectTrigger className="h-9 w-full" id="workplace-filter">
                    <SelectValue placeholder="Workplace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Any workplace</SelectItem>
                    <SelectItem value="ONSITE">On-site</SelectItem>
                    <SelectItem value="REMOTE">Remote</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employment-filter">Employment type</Label>
                <Select onValueChange={setEmploymentType} value={employmentType}>
                  <SelectTrigger className="h-9 w-full" id="employment-filter">
                    <SelectValue placeholder="Employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Any type</SelectItem>
                    <SelectItem value="FULL_TIME">Full-time</SelectItem>
                    <SelectItem value="PART_TIME">Part-time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience-filter">Experience</Label>
                <Select onValueChange={setExperience} value={experience}>
                  <SelectTrigger className="h-9 w-full" id="experience-filter">
                    <SelectValue placeholder="Your experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Any experience</SelectItem>
                    <SelectItem value="0">0 years</SelectItem>
                    <SelectItem value="1">1 year</SelectItem>
                    <SelectItem value="3">3 years</SelectItem>
                    <SelectItem value="5">5 years</SelectItem>
                    <SelectItem value="8">8 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary-filter">Minimum salary</Label>
                <Select onValueChange={setMinimumSalary} value={minimumSalary}>
                  <SelectTrigger className="h-9 w-full" id="salary-filter">
                    <SelectValue placeholder="Minimum salary" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Any salary</SelectItem>
                    <SelectItem value="300000">₹3 lakh+</SelectItem>
                    <SelectItem value="600000">₹6 lakh+</SelectItem>
                    <SelectItem value="1000000">₹10 lakh+</SelectItem>
                    <SelectItem value="1500000">₹15 lakh+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort-filter">Sort by</Label>
                <Select onValueChange={setSort} value={sort}>
                  <SelectTrigger className="h-9 w-full" id="sort-filter">
                    <SelectValue placeholder="Sort jobs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEWEST">Newest first</SelectItem>
                    <SelectItem value="OLDEST">Oldest first</SelectItem>
                    <SelectItem value="SALARY_HIGH">Salary: high to low</SelectItem>
                    <SelectItem value="SALARY_LOW">Salary: low to high</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 border-t pt-5">
                <Button className="h-9 w-full" type="submit">
                  Apply filters
                </Button>
                {activeFilterCount > 0 ? (
                  <Button
                    className="h-9 w-full"
                    onClick={handleReset}
                    type="button"
                    variant="destructive"
                  >
                    <RotateCcw data-icon="inline-start" />
                    Clear filters
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </form>
  );
}
