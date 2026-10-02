import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type NewApplicationEmailProps = {
  employerName: string;
  applicantName: string;
  jobTitle: string;
  jobApplicationsUrl: string;
};

export function NewApplicationEmail({
  employerName,
  applicantName,
  jobTitle,
  jobApplicationsUrl,
}: NewApplicationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        {applicantName} applied for {jobTitle}.
      </Preview>

      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>CAREERLY</Text>

          <Heading style={heading}>New job application</Heading>

          <Text style={paragraph}>Hi {employerName},</Text>

          <Text style={paragraph}>
            <strong>{applicantName}</strong> has applied for{" "}
            <strong>{jobTitle}</strong>.
          </Text>

          <Text style={paragraph}>
            Review the candidate’s profile, resume, and cover letter from your
            job management page.
          </Text>

          <Section style={buttonSection}>
            <Button href={jobApplicationsUrl} style={button}>
              Review application
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            This is an automated notification from Careerly.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f4f4f5",
  color: "#18181b",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  margin: "0",
  padding: "32px 12px",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e4e4e7",
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "32px",
};

const brand = {
  color: "#047857",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "2px",
  margin: "0 0 24px",
};

const heading = {
  color: "#18181b",
  fontSize: "26px",
  lineHeight: "1.3",
  margin: "0 0 24px",
};

const paragraph = {
  color: "#3f3f46",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 16px",
};

const buttonSection = {
  margin: "28px 0",
};

const button = {
  backgroundColor: "#047857",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 20px",
  textDecoration: "none",
};

const divider = {
  borderColor: "#e4e4e7",
  margin: "28px 0 20px",
};

const footer = {
  color: "#71717a",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0",
};
