export function getExpirationTimestamp(dateText?: string | null) {
  if (!dateText) return null;

  const timestamp = new Date(`${dateText}T23:59:59`).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

export function formatExpirationLabel(expiresAt?: string | null) {
  const timestamp = getExpirationTimestamp(expiresAt);

  if (!timestamp) return null;

  const now = Date.now();
  const days = Math.ceil((timestamp - now) / (24 * 60 * 60 * 1000));
  const dateLabel = new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  if (days < 0) return `Expired ${dateLabel}`;
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  return `Expires ${dateLabel}`;
}

export function shouldSuggestExpiration(category?: string, postType?: string) {
  return (
    postType === "sale" ||
    postType === "announcement" ||
    postType === "alert" ||
    postType === "event" ||
    postType === "job" ||
    postType === "volunteer" ||
    category === "Alerts" ||
    category === "Careers & Jobs" ||
    category === "Events"
  );
}
