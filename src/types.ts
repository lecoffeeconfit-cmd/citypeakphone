export type Tab = "feed" | "search" | "post" | "profile";

export type ReactionKey = "fire" | "heart" | "laugh" | "wow";

export type Comment = {
  id: string;
  author: string;
  text: string;
};

export type Post = {
  id: string;
  author: string;
  anonymous: boolean;
  text: string;
  location: string;
  imageUri?: string;
  reactions: Record<ReactionKey, number>;
  comments: Comment[];
};

export const reactionButtons: { key: ReactionKey; emoji: string }[] = [
  { key: "fire", emoji: "🔥" },
  { key: "heart", emoji: "❤️" },
  { key: "laugh", emoji: "😂" },
  { key: "wow", emoji: "😮" },
];