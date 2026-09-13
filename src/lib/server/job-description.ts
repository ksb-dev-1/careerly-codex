import sanitizeHtml from "sanitize-html";

export function sanitizeJobDescription(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "strong",
      "em",
      "u",
      "s",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "hr",
    ],
    allowedAttributes: {},
  });
}

export function getVisibleJobDescriptionLength(html: string) {
  const text = sanitizeHtml(sanitizeJobDescription(html), {
    allowedTags: [],
    allowedAttributes: {},
  });

  return text.replace(/&(?:#\d+|#x[\da-f]+|[a-z][a-z0-9]+);/gi, "x").trim()
    .length;
}
