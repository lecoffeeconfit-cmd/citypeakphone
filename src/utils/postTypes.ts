import type { PostFields, PostType } from "../types";

export const postTypeOptions: { key: PostType; label: string; emoji: string }[] = [
  { key: "standard", label: "Post", emoji: "📝" },
  { key: "sale", label: "Sale", emoji: "🏷️" },
  { key: "poll", label: "Poll", emoji: "📊" },
  { key: "announcement", label: "Announcement", emoji: "📢" },
  { key: "question", label: "Question", emoji: "❓" },
  { key: "recommendation", label: "Recommend", emoji: "⭐" },
  { key: "hiddenGem", label: "Hidden Gem", emoji: "📍" },
  { key: "foodReview", label: "Food Review", emoji: "🍽" },
  { key: "alert", label: "Alert", emoji: "🚨" },
  { key: "event", label: "Event", emoji: "🎉" },
  { key: "job", label: "Job", emoji: "💼" },
  { key: "volunteer", label: "Volunteer", emoji: "❤️" },
];

export function getPostTypeOption(postType?: PostType) {
  return postTypeOptions.find((option) => option.key === postType) || postTypeOptions[0];
}

export function getPostFieldRows(fields?: PostFields | null) {
  if (!fields) return [];

  return Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([key, value]) => ({
      key,
      label: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (letter) => letter.toUpperCase()),
      value: String(value),
    }));
}
