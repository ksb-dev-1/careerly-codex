const ALLOWED_RESUME_TYPES = new Map([
  ["application/pdf", ".pdf"],
  ["application/msword", ".doc"],
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".docx",
  ],
]);

export const MAX_RESUME_SIZE = 5 * 1024 * 1024;

export function validateResumeFile(file: File) {
  if (file.size === 0) {
    return "Choose a non-empty resume file.";
  }

  if (file.size > MAX_RESUME_SIZE) {
    return "Resume must be 5 MB or smaller.";
  }

  const expectedExtension = ALLOWED_RESUME_TYPES.get(file.type);
  const fileName = file.name.toLowerCase();

  if (!expectedExtension || !fileName.endsWith(expectedExtension)) {
    return "Only PDF, DOC, and DOCX files are allowed.";
  }

  return null;
}
