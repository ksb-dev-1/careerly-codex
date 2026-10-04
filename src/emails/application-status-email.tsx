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

type ApplicationStatusEmailProps = {
  applicantName: string;
  companyName: string;
  jobTitle: string;
  status: "SHORTLISTED" | "REJECTED";
  applicationsUrl: string;
};

export function ApplicationStatusEmail({
  applicantName,
  companyName,
  jobTitle,
  status,
  applicationsUrl,
}: ApplicationStatusEmailProps) {
  const shortlisted = status === "SHORTLISTED";

  return (
    <Html lang="en">
      <Head />
      <Preview>
        Your application for {jobTitle} was {shortlisted ? "shortlisted" : "not selected"}.
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>CAREERLY</Text>
          <Heading style={heading}>
            Application {shortlisted ? "shortlisted" : "update"}
          </Heading>
          <Text style={paragraph}>Hi {applicantName},</Text>
          <Text style={paragraph}>
            {shortlisted ? (
              <>
                Good news! <strong>{companyName}</strong> shortlisted your
                application for <strong>{jobTitle}</strong>.
              </>
            ) : (
              <>
                <strong>{companyName}</strong> decided not to move forward with
                your application for <strong>{jobTitle}</strong>.
              </>
            )}
          </Text>
          <Text style={paragraph}>
            {shortlisted
              ? "The employer may contact you with the next steps."
              : "Keep exploring Careerly for other opportunities that match your experience."}
          </Text>
          <Section style={buttonSection}>
            <Button href={applicationsUrl} style={button}>
              View applications
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

const buttonSection = { margin: "28px 0" };

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

const divider = { borderColor: "#e4e4e7", margin: "28px 0 20px" };

const footer = {
  color: "#71717a",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0",
};
