import "server-only";

import { ApplicationStatusEmail } from "@/emails/application-status-email";
import { getResend, getResendFromEmail } from "@/lib/resend";

type SendApplicationStatusEmailInput = {
  applicationId: string;
  updatedAt: string;
  recipientEmail: string;
  applicantName: string;
  companyName: string;
  jobTitle: string;
  status: "SHORTLISTED" | "REJECTED";
  applicationsUrl: string;
};

export async function sendApplicationStatusEmail({
  applicationId,
  updatedAt,
  recipientEmail,
  applicantName,
  companyName,
  jobTitle,
  status,
  applicationsUrl,
}: SendApplicationStatusEmailInput) {
  const statusLabel = status === "SHORTLISTED" ? "shortlisted" : "not selected";
  const { data, error } = await getResend().emails.send(
    {
      from: getResendFromEmail(),
      to: [recipientEmail],
      subject: `Application ${statusLabel}: ${jobTitle}`,
      react: (
        <ApplicationStatusEmail
          applicantName={applicantName}
          applicationsUrl={applicationsUrl}
          companyName={companyName}
          jobTitle={jobTitle}
          status={status}
        />
      ),
    },
    {
      idempotencyKey: `application-status/${applicationId}/${status}/${updatedAt}`,
    },
  );

  if (error) {
    throw new Error(`Unable to send application status email: ${error.message}`);
  }

  return data;
}
