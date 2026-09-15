const steps = [
  {
    title: "Create your starting point",
    description:
      "Build your job-seeker profile or introduce your company to future teammates.",
  },
  {
    title: "Find the right opportunity",
    description:
      "Employers share open roles. Job seekers explore the ones that match where they want to go.",
  },
  {
    title: "Move forward together",
    description:
      "Apply with confidence, review interested candidates, and take the next step toward a great fit.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="border-b border-border bg-background py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="max-w-md">
          <p className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-800 uppercase dark:text-brand-300">
            <span className="size-2 rounded-full bg-brand-500" />
            How Careerly works
          </p>
          <h2
            id="how-it-works-title"
            className="mt-4 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl"
          >
            Simple steps. Better connections.
          </h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            From your first introduction to the next opportunity, the path
            forward should feel clear.
          </p>
        </div>

        <ol className="border-t border-border">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-6 border-b border-border py-7 last:border-b-0"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-brand-700/20 bg-brand-50 text-sm font-semibold text-brand-800 dark:border-brand-400/30 dark:bg-brand-400/10 dark:text-brand-300">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 leading-7 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
