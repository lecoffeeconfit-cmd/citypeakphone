export function timeAgo(timestamp: any) {
  if (!timestamp) return "now";

  let date: Date;

  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp?.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === "number") {
    date = new Date(timestamp);
  } else {
    return "now";
  }

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 10) return "now";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;

  return `${Math.floor(seconds / 604800)}w`;
}