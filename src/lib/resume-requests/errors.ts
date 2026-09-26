export type ResumeRequestFailureKind =
  | "rate_limited"
  | "invalid"
  | "duplicate"
  | "unavailable";

export function classifyResumeRequestFailure(
  message: string,
  code?: string,
): ResumeRequestFailureKind {
  if (message.includes("duplicate_request")) {
    return "duplicate";
  }

  if (message.includes("rate_limited")) {
    return "rate_limited";
  }

  if (message.includes("invalid_input") || code === "22023") {
    return "invalid";
  }

  return "unavailable";
}
