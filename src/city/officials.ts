import type { GovernmentOfficial, OfficialChangeReview } from "./types";

export function detectOfficialChanges(current: GovernmentOfficial, candidate: GovernmentOfficial, detectedAt = new Date().toISOString()): OfficialChangeReview[] {
  const fields: { key: OfficialChangeReview["detectedChangeType"]; current: unknown; candidate: unknown }[] = [
    { key: "name", current: current.name, candidate: candidate.name },
    { key: "title", current: current.displayedTitle, candidate: candidate.displayedTitle },
    { key: "profile_url", current: current.officialProfileUrl, candidate: candidate.officialProfileUrl },
    { key: "term", current: `${current.termStart || ""}:${current.termEnd || ""}`, candidate: `${candidate.termStart || ""}:${candidate.termEnd || ""}` },
  ];
  return fields.filter((field) => field.current !== field.candidate).map((field) => ({ id: `${current.id}:${field.key}:${detectedAt}`, cityId: current.cityId, officialRecordId: current.id, detectedChangeType: field.key, previousValue: field.current, proposedValue: field.candidate, sourceUrl: candidate.sourceUrl, detectedAt, status: "pending" }));
}

export function reviewOfficialChange(review: OfficialChangeReview, reviewerId: string | undefined, decision: "approved" | "rejected"): OfficialChangeReview {
  if (!reviewerId) throw new Error("admin_authorization_required");
  if (review.status !== "pending") throw new Error("review_already_decided");
  return { ...review, status: decision, reviewedAt: new Date().toISOString(), reviewedBy: reviewerId };
}
