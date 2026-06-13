export type Tab = "feed" | "search" | "post" | "messages" | "profile";

export type ReactionKey = "fire" | "heart" | "laugh" | "wow";

export type PostCategory =
  | "Educational"
  | "Entertainment"
  | "Social"
  | "Sales & Marketing"
  | "Random Thoughts"
  | "Places";

export const postCategories: PostCategory[] = [
  "Educational",
  "Entertainment",
  "Social",
  "Sales & Marketing",
  "Random Thoughts",
  "Places",
];

export type MediaType = "image" | "video";

export type CommentReply = {
  id: string;
  author: string;
  text: string;
  likes: number;
  createdAt?: any;
};

export type Comment = {
  id: string;
  uid?: string;
  username?: string;
  author: string;
  text: string;
  likes?: number;
  dislikes?: number;
  replies?: Comment[];
  createdAt: number | string | any;
};

export type Post = {
  id: string;
  uid?: string;
username?: string;
  author: string;
  anonymous: boolean;
  text: string;
  category?: PostCategory;
  location: string;
  imageUri?: string;
  mediaType?: MediaType;
  createdAt?: any;
  reactions: Record<ReactionKey, number>;
  comments: Comment[];
};

export const reactionButtons: { key: ReactionKey; emoji: string }[] = [
  { key: "fire", emoji: "🔥" },
  { key: "heart", emoji: "❤️" },
  { key: "laugh", emoji: "😂" },
  { key: "wow", emoji: "😮" },
];