import "server-only";

import { NewApplicationEmail } from "@/emails/new-application-email";
import { getResend, getResendFromEmail } from "@/lib/resend";

type SendNewApplicationEmailInput = {
  applicationId: string;
  submittedAt: string;
  recipientEmail: string;
  employerName: string;
  applicantName: string;
  jobTitle: string;
  jobApplicationsUrl: string;
};

export async function sendNewApplicationEmail({
  applicationId,
  submittedAt,
  recipientEmail,
  employerName,
  applicantName,
  jobTitle,
  jobApplicationsUrl,
}: SendNewApplicationEmailInput) {
  const { data, error } = await getResend().emails.send(
    {
      from: getResendFromEmail(),
      to: [recipientEmail],
      subject: `New application for ${jobTitle}`,
      react: (
        <NewApplicationEmail
          applicantName={applicantName}
          employerName={employerName}
          jobApplicationsUrl={jobApplicationsUrl}
          jobTitle={jobTitle}
        />
      ),
    },
    {
      idempotencyKey: `new-application/${applicationId}/${submittedAt}`,
    },
  );

  if (error) {
    throw new Error(
      `Unable to send employer application notification: ${error.message}`,
    );
  }

  return data;
}
