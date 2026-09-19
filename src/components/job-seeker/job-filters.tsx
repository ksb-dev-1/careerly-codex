"use client";

import { useState } from "react";
import type { SubmitEvent } from "react";

import { useRouter } from "next/navigation";

import { Search, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
};

export function JobFilters({ initialFilters }: JobFiltersProps) {
  const router = useRouter();
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
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-3 md:grid-cols-3">
        <Input
          defaultValue={initialFilters.q}
          name="q"
          placeholder="Job title, company, or keyword"
          type="search"
        />
        <Input
          defaultValue={initialFilters.location}
          name="location"
          placeholder="Location"
          type="search"
        />
        <Input
          defaultValue={initialFilters.skill}
          name="skill"
          placeholder="Skill, for example React"
          type="search"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select onValueChange={setWorkplaceType} value={workplaceType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Workplace" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any workplace</SelectItem>
            <SelectItem value="ONSITE">On-site</SelectItem>
            <SelectItem value="REMOTE">Remote</SelectItem>
            <SelectItem value="HYBRID">Hybrid</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setEmploymentType} value={employmentType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Employment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any employment type</SelectItem>
            <SelectItem value="FULL_TIME">Full-time</SelectItem>
            <SelectItem value="PART_TIME">Part-time</SelectItem>
            <SelectItem value="CONTRACT">Contract</SelectItem>
            <SelectItem value="INTERNSHIP">Internship</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setExperience} value={experience}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Your experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any experience level</SelectItem>
            <SelectItem value="0">0 years</SelectItem>
            <SelectItem value="1">1 year</SelectItem>
            <SelectItem value="3">3 years</SelectItem>
            <SelectItem value="5">5 years</SelectItem>
            <SelectItem value="8">8 years</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setMinimumSalary} value={minimumSalary}>
          <SelectTrigger className="w-full">
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

        <Select onValueChange={setSort} value={sort}>
          <SelectTrigger className="w-full">
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

      <div className="flex flex-wrap gap-2">
        <Button type="submit">
          <Search data-icon="inline-start" />
          Search jobs
        </Button>
        <Button onClick={handleReset} type="button" variant="outline">
          <RotateCcw data-icon="inline-start" />
          Reset
        </Button>
      </div>
    </form>
  );
}
