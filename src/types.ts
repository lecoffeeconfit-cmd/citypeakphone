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
photoUrl?: string;
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
  { key: "dislike", emoji: "👎" },
];