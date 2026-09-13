import { sanitizeJobDescription } from "@/lib/server/job-description";

export function JobDescription({ content }: { content: string }) {
  return (
    <div
      className="whitespace-pre-wrap wrap-break-word [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6"
      dangerouslySetInnerHTML={{
        __html: sanitizeJobDescription(content),
      }}
    />
  );
}
