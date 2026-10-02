import "server-only";

import { ApplicationConfirmationEmail } from "@/emails/application-confirmation-email";
import { getResend, getResendFromEmail } from "@/lib/resend";

type SendApplicationConfirmationEmailInput = {
  applicationId: string;
  submittedAt: string;
  recipientEmail: string;
  applicantName: string;
  companyName: string;
  jobTitle: string;
  applicationsUrl: string;
};

export async function sendApplicationConfirmationEmail({
  applicationId,
  submittedAt,
  recipientEmail,
  applicantName,
  companyName,
  jobTitle,
  applicationsUrl,
}: SendApplicationConfirmationEmailInput) {
  const { data, error } = await getResend().emails.send(
    {
      from: getResendFromEmail(),
      to: [recipientEmail],
      subject: `Application submitted: ${jobTitle}`,
      react: (
        <ApplicationConfirmationEmail
          applicantName={applicantName}
          applicationsUrl={applicationsUrl}
          companyName={companyName}
          jobTitle={jobTitle}
        />
      ),
    },
    {
      idempotencyKey: `application-confirmation/${applicationId}/${submittedAt}`,
    },
  );

  if (error) {
    throw new Error(
      `Unable to send application confirmation: ${error.message}`,
    );
  }

  return data;
}
