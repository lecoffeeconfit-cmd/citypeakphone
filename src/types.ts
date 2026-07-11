export type Tab =
  | "feed"
  | "search"
  | "post"
  | "messages"
  | "profile"
  | "admin";
export type ReactionKey = "fire" | "heart" | "laugh" | "wow" | "dislike";
export type PostCategory =
  | "Alerts"
  | "Educational"
  | "Entertainment"
  | "Technology"
  | "News"
  | "Social"
  | "Sales & Marketing"
  | "Random Thoughts"
  | "Places"
  | "Food"
  | "Health & Wellness"
  | "Personal Finance"
  | "Relationships"
  | "Careers & Jobs"
  | "Sports"
  | "Events"
  | "Pets & Animals";

export const postCategories: PostCategory[] = [
  "Alerts",
  "Educational",
  "Entertainment",
  "Technology",
  "News",
  "Social",
  "Sales & Marketing",
  "Random Thoughts",
  "Places",
  "Food",
  "Health & Wellness",
  "Personal Finance",
  "Relationships",
  "Careers & Jobs",
  "Sports",
  "Events",
  "Pets & Animals",
];

export type MediaType = "image" | "video";
export type MediaKind = "post" | "tutorial";
export type PostType =
  | "standard"
  | "sale"
  | "poll"
  | "announcement"
  | "question"
  | "recommendation"
  | "hiddenGem"
  | "foodReview"
  | "alert"
  | "event"
  | "job"
  | "volunteer";

export type PostFields = Record<string, string>;

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type EngagementStats = {
  views: number;
  saves: number;
  shares: number;
};

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
  postType?: PostType;
  saleTitle?: string;
  salePrice?: string;
  saleCondition?: string;
  postFields?: PostFields;
  text: string;
  tags?: string[];
  category?: PostCategory;
  location: string;
  postCoordinates?: Coordinates | null;
  expiresAt?: string | null;
  imageUrl?: string;
  imageUri?: string;
  imageUris?: string[];
  thumbnailUrl?: string;
  thumbnailUrls?: string[];
  imageThumbnailUri?: string;
  mediaType?: MediaType;
  mediaKind?: MediaKind;
  mediaDurationMs?: number;
  mediaSizeBytes?: number;
  poll?: Poll;
  createdAt?: any;
  reactions: Record<ReactionKey, number>;
  reactedBy?: Record<string, ReactionKey>;
  engagement?: EngagementStats;
  viewedBy?: Record<string, boolean>;
  savedBy?: Record<string, boolean>;
  comments: Comment[];
};

export const reactionButtons: { key: ReactionKey; emoji: string }[] = [
  { key: "fire", emoji: "🔥" },
  { key: "heart", emoji: "❤️" },
  { key: "laugh", emoji: "😂" },
  { key: "wow", emoji: "😮" },
  { key: "dislike", emoji: "👎" },
];
