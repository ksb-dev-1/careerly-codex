import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const questions = [
  {
    value: "getting-started",
    question: "How do I get started?",
    answer:
      "Sign in with Google or GitHub, choose whether you're a job seeker or employer, and complete your profile.",
  },
  {
    value: "manage-jobs",
    question: "Can employers manage their job posts?",
    answer: "Yes. Employers can create, edit, publish, and close their job listings.",
  },
  {
    value: "application-limits",
    question: "How many jobs can I apply to each day?",
    answer:
      "Free members can apply to one job per day, while Premium members can apply to five. The daily limit resets at midnight IST.",
  },
  {
    value: "premium",
    question: "Is Premium available now?",
    answer:
      "The Premium application limit is ready, but public upgrades are not available yet. We'll enable them when Stripe checkout is integrated.",
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-muted/30 py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="max-w-md">
          <p className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-800 uppercase dark:text-brand-300">
            <span className="size-2 rounded-full bg-brand-500" />
            Frequently asked questions
          </p>
          <h2
            id="faq-title"
            className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Good questions deserve clear answers.
          </h2>
          <p className="mt-5 leading-7 text-muted-foreground">
            Here are the essentials about getting started and Careerly
            memberships.
          </p>
        </div>

        <Accordion
          className="bg-card text-base text-card-foreground"
          collapsible
          type="single"
        >
          {questions.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger className="p-5 text-base font-semibold hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-5 text-base leading-7 text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
