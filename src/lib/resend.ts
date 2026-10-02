import { Resend } from "resend";
import "server-only";

let resendClient: Resend | undefined;

function requireEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function getResend() {
  resendClient ??= new Resend(requireEnvironmentVariable("RESEND_API_KEY"));

  return resendClient;
}

export function getResendFromEmail() {
  return requireEnvironmentVariable("RESEND_FROM_EMAIL");
}
