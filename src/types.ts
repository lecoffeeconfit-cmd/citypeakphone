export type Tab =
  | "feed"
  | "search"
  | "post"
  | "messages"
  | "profile"
  | "admin";
export type ReactionKey = "fire" | "heart" | "laugh" | "wow" | "dislike";
export type PostCategory =
  | "Educational"
  | "Entertainment"
  | "Technology"
  | "News"
  | "Social"
  | "Sales & Marketing"
  | "Random Thoughts"
  | "Places"
  | "Food";

export const postCategories: PostCategory[] = [
  "Educational",
  "Entertainment",
  "Technology",
  "News",
  "Social",
  "Sales & Marketing",
  "Random Thoughts",
  "Places",
  "Food",
];

export type MediaType = "image" | "video";
export type MediaKind = "post" | "tutorial";

export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type Poll = {
  question: string;
  options: PollOption[];
  votedBy?: Record<string, string>;
};

export type PollDraft = {
  question: string;
  options: string[];
};

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
  likedBy?: Record<string, boolean>;
  dislikedBy?: Record<string, boolean>;
  replies?: Comment[];
  createdAt: number | string | any;
};

export type Post = {
  id: string;
  uid?: string;
username?: string;
photoUrl?: string;
  author: string;
  anonymous: boolean;
  text: string;
  category?: PostCategory;
  location: string;
  imageUri?: string;
  mediaType?: MediaType;
  mediaKind?: MediaKind;
  mediaDurationMs?: number;
  mediaSizeBytes?: number;
  poll?: Poll;
  createdAt?: any;
  reactions: Record<ReactionKey, number>;
  reactedBy?: Record<string, ReactionKey>;
  comments: Comment[];
};

export const reactionButtons: { key: ReactionKey; emoji: string }[] = [
  { key: "fire", emoji: "🔥" },
  { key: "heart", emoji: "❤️" },
  { key: "laugh", emoji: "😂" },
  { key: "wow", emoji: "😮" },
  { key: "dislike", emoji: "👎" },
];
