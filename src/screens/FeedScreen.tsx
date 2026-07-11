import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native"; import { PostCard } from "../components/PostCard";
import { styles } from "../styles";
import { postCategories } from "../types";
import type { Coordinates, Post, PostCategory, ReactionKey, Tab } from "../types";

type FeedMode = "latest" | "trending";
type CategoryFilter = "All" | PostCategory;

type FeedScreenProps = {
  posts: Post[];
  hasMorePosts: boolean;
  onLoadMorePosts: () => void;
  onRefreshPosts: () => void;
  refreshing: boolean;
  selectedArea: string;
  setTab: (tab: Tab) => void;
  onReact: (postId: string, reaction: ReactionKey) => void;
  onOpenPost: (post: Post) => void;
  currentUserId: string;
  onDeletePost: (postId: string) => void;
  onReportPost: (postId: string, reason: string) => void;
  onMessagePost: (post: Post) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onSavePost: (postId: string) => void;
  onSharePost: (post: Post) => void;
  userCoordinates?: Coordinates | null;
  onOpenUserProfile: (target: {
    uid?: string;
    username?: string;
    author?: string;
    photoUrl?: string;
  }) => void;
};

const categoryFilters: CategoryFilter[] = ["All", ...postCategories];

const categoryColors: Record<string, string> = {
  All: "#86B5CF",
  Alerts: "#F58A00",
  Educational: "#329BB8",
  Entertainment: "#003B57",
  Technology: "#F8B400",
  News: "#F58A00",
  Social: "#86B5CF",
  "Sales & Marketing": "#329BB8",
  "Random Thoughts": "#003B57",
  Places: "#F8B400",
  Food: "#F58A00",
  "Health & Wellness": "#86B5CF",
  "Personal Finance": "#329BB8",
  Relationships: "#003B57",
  "Careers & Jobs": "#F8B400",
  Sports: "#F58A00",
  Events: "#86B5CF",
  "Pets & Animals": "#8B5CF6",
};

function hexToRgba(hex: string, alpha: number) {
  const normalizedHex = hex.replace("#", "");
  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getCategoryTextColor(color: string, active: boolean) {
  if (active && (color === "#F8B400" || color === "#86B5CF")) {
    return "#062033";
  }

  return "#FFFFFF";
}

function getTrendingScore(post: Post) {
  const reactionScore =
    post.reactions.fire +
    post.reactions.heart +
    post.reactions.laugh +
    post.reactions.wow;

  const commentScore = post.comments.length * 3;

  const replyScore = post.comments.reduce((total, comment) => {
    return total + (comment.replies?.length ?? 0) * 2;
  }, 0);

  return reactionScore + commentScore + replyScore;
}

function getCategoryEmoji(category: CategoryFilter) {
  if (category === "All") return "🌎";
  if (category === "Alerts") return "🚨";
  if (category === "Educational") return "📘";
  if (category === "Entertainment") return "🎬";
  if (category === "Technology") return "💻";
  if (category === "News") return "📰";
  if (category === "Social") return "👥";
  if (category === "Sales & Marketing") return "📣";
  if (category === "Random Thoughts") return "💭";
  if (category === "Food") return "🍔";
  if (category === "Health & Wellness") return "🧘";
  if (category === "Personal Finance") return "💵";
  if (category === "Relationships") return "💬";
  if (category === "Careers & Jobs") return "💼";
  if (category === "Sports") return "🏀";
  if (category === "Events") return "📈";
  if (category === "Pets & Animals") return "🐾";
  return "📍";
}

function isSupabaseMediaUrl(uri?: string | null) {
  return typeof uri === "string" && uri.includes(".supabase.co/storage/v1/");
}

function getFeedThumbnailUrls(post: Post) {
  if (post.mediaType === "video") {
    return [post.thumbnailUrl || post.imageThumbnailUri].filter(Boolean) as string[];
  }

  if (post.thumbnailUrls?.length) return post.thumbnailUrls;

  return [post.thumbnailUrl].filter(Boolean) as string[];
}

function hasDedicatedThumbnail(post: Post) {
  return post.mediaType === "video"
    ? !!(post.thumbnailUrl || post.imageThumbnailUri)
    : !!(post.thumbnailUrl || post.thumbnailUrls?.length);
}

function getRenderedFullSizeFallbackUrls(post: Post) {
  if (hasDedicatedThumbnail(post)) return [];
  if (post.mediaType === "video") return [];

  return [post.imageUrl || post.imageUri || post.imageThumbnailUri].filter(Boolean) as string[];
}

export function FeedScreen({
  posts,
  hasMorePosts,
  onLoadMorePosts,
  onRefreshPosts,
  refreshing,
  selectedArea,
  setTab,
  onReact,
  onOpenPost,
  currentUserId,
  onDeletePost,
  onReportPost,
  onMessagePost,
  onVotePoll,
  onSavePost,
  onSharePost,
  userCoordinates,
  onOpenUserProfile,
}: FeedScreenProps) {
  const [feedMode, setFeedMode] = useState<FeedMode>("latest");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [postSearch, setPostSearch] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);

  const filteredPosts = useMemo(() => {
    let areaPosts = posts.filter((post) => post.location === selectedArea);

    if (categoryFilter !== "All") {
      areaPosts = areaPosts.filter((post) => post.category === categoryFilter);
    }

    const cleanedSearch = postSearch.trim().toLowerCase();

    if (cleanedSearch) {
      areaPosts = areaPosts.filter((post) => {
        const text = post.text?.toLowerCase() || "";
        const author = post.author?.toLowerCase() || "";
        const category = post.category?.toLowerCase() || "";
        const tags = post.tags?.join(" ").toLowerCase() || "";

        return (
          text.includes(cleanedSearch) ||
          author.includes(cleanedSearch) ||
          category.includes(cleanedSearch) ||
          tags.includes(cleanedSearch)
        );
      });
    }

    if (feedMode === "trending") {
      return [...areaPosts].sort((a, b) => getTrendingScore(b) - getTrendingScore(a));
    }

    return areaPosts;
  }, [posts, selectedArea, feedMode, categoryFilter, postSearch]);

  useEffect(() => {
    if (!__DEV__) return;

    const initiallyRenderedPosts = filteredPosts.slice(0, 4);
    const thumbnailUrlCount = initiallyRenderedPosts
      .flatMap(getFeedThumbnailUrls)
      .filter(isSupabaseMediaUrl).length;
    const fullSizeFallbackUrlCount = initiallyRenderedPosts
      .flatMap(getRenderedFullSizeFallbackUrls)
      .filter(isSupabaseMediaUrl).length;
    const totalSupabaseMediaUrlCount = thumbnailUrlCount + fullSizeFallbackUrlCount;

    console.log(
      `[media-audit] initial feed render: posts=${initiallyRenderedPosts.length}, thumbnails=${thumbnailUrlCount}, fullSizeFallbacks=${fullSizeFallbackUrlCount}`
    );

    if (fullSizeFallbackUrlCount > 0) {
      console.warn(
        `[media-audit] feed rendered ${fullSizeFallbackUrlCount} full-size fallback Supabase URL(s). Add thumbnailUrl/thumbnailUrls for those posts to reduce egress.`
      );
    }

    if (totalSupabaseMediaUrlCount > 20) {
      console.warn(
        `[media-audit] initial feed rendered ${totalSupabaseMediaUrlCount} Supabase media URL(s), expected <= 20.`
      );
    }
  }, [filteredPosts, selectedArea]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedList}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={60}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefreshPosts} />
        }
        onEndReached={() => {
          if (hasMorePosts) {
            onLoadMorePosts();
          }
        }}
        onEndReachedThreshold={0.6}
        ListHeaderComponent={
          <>
            <Pressable style={styles.searchPill} onPress={() => setTab("search")}>
              <Text style={styles.searchPillText}>
                🔍 Search or change city · {selectedArea}
              </Text>
            </Pressable>

            <TextInput
              value={postSearch}
              onChangeText={setPostSearch}
              placeholder="Search posts in this city..."
              placeholderTextColor="#64748B"
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.30)",
                color: "white",
                borderWidth: 1,
                borderColor: "rgba(186, 230, 253, 0.25)",
                borderRadius: 16,
                padding: 12,
                marginBottom: 16,
                fontWeight: "700",
              }}
            />

            <View style={{ marginBottom: 16 }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderTitle}>Popular feeds</Text>

                <Pressable onPress={() => setShowAllCategories(!showAllCategories)}>
                  <Text style={styles.sectionHeaderLink}>
                    {showAllCategories ? "Collapse" : "Expand"}
                  </Text>
                </Pressable>
              </View>

              {showAllCategories ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                  {categoryFilters.map((category) => {
                    const active = categoryFilter === category;
                    const color = categoryColors[category];

                    return (
                      <Pressable
                        key={category}
                        onPress={() => setCategoryFilter(category)}
                        style={[
                          styles.feedCategoryCard,
                          {
                            backgroundColor: hexToRgba(color, active ? 0.74 : 0.34),
                            borderColor: active
                              ? "rgba(255, 255, 255, 0.86)"
                              : hexToRgba(color, 0.54),
                            borderWidth: active ? 2 : 1,
                            marginRight: 0,
                            shadowColor: color,
                            shadowOpacity: active ? 0.26 : 0.12,
                            shadowRadius: active ? 16 : 10,
                            shadowOffset: { width: 0, height: active ? 8 : 5 },
                            elevation: active ? 5 : 2,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 21 }}>{getCategoryEmoji(category)}</Text>

                        <Text
                          numberOfLines={2}
                          style={[
                            styles.feedCategoryText,
                            {
                              color: getCategoryTextColor(color, active),
                            },
                          ]}
                        >
                          {category}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{
                    paddingRight: 24,
                  }}
                >
                  {categoryFilters.map((category) => {
                    const active = categoryFilter === category;
                    const color = categoryColors[category];

                    return (
                      <Pressable
                        key={category}
                        onPress={() => setCategoryFilter(category)}
                        style={[
                          styles.feedCategoryCard,
                          {
                            backgroundColor: hexToRgba(color, active ? 0.74 : 0.34),
                            borderColor: active
                              ? "rgba(255, 255, 255, 0.86)"
                              : hexToRgba(color, 0.54),
                            borderWidth: active ? 2 : 1,
                            shadowColor: color,
                            shadowOpacity: active ? 0.26 : 0.12,
                            shadowRadius: active ? 16 : 10,
                            shadowOffset: { width: 0, height: active ? 8 : 5 },
                            elevation: active ? 5 : 2,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 21 }}>{getCategoryEmoji(category)}</Text>

                        <Text
                          numberOfLines={2}
                          style={[
                            styles.feedCategoryText,
                            {
                              color: getCategoryTextColor(color, active),
                            },
                          ]}
                        >
                          {category}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            <View style={styles.feedHeroBanner}>
              <View style={styles.heroMoonGlow} />
              <View style={styles.heroMoon}>
                <View style={styles.heroMoonCraterLarge} />
                <View style={styles.heroMoonCraterSmall} />
                <View style={styles.heroMoonCraterTiny} />
              </View>
              <View style={styles.heroMoonShadow} />
              <View style={styles.heroSkyStarOne} />
              <View style={styles.heroSkyStarTwo} />
              <View style={styles.heroSkyStarThree} />

              <Text style={styles.feedHeroKicker}>CITYPEAK LOCAL</Text>

              <Text style={styles.feedHeroTitle}>
                What’s happening in {selectedArea}?
              </Text>

              <Text style={styles.feedHeroText}>
                Share local thoughts, events, questions, videos, and updates with people nearby.
              </Text>
            </View>

            <View style={styles.feedToggleRow}>
              <Pressable
                style={[
                  styles.feedToggleButton,
                  feedMode === "latest" && styles.feedToggleButtonActive,
                ]}
                onPress={() => setFeedMode("latest")}
              >
                <Text
                  style={[
                    styles.feedToggleText,
                    feedMode === "latest" && styles.feedToggleTextActive,
                  ]}
                >
                  Latest
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.feedToggleButton,
                  feedMode === "trending" && styles.feedToggleButtonActive,
                ]}
                onPress={() => setFeedMode("trending")}
              >
                <Text
                  style={[
                    styles.feedToggleText,
                    feedMode === "trending" && styles.feedToggleTextActive,
                  ]}
                >
                  🔥 Trending
                </Text>
              </Pressable>
            </View>

            <Text style={styles.localPostsTitle}>Local posts</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No posts here yet</Text>
            <Text style={styles.muted}>
              {categoryFilter === "All"
                ? "Create the first post for this area."
                : `No ${categoryFilter} posts yet. Create the first one.`}
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMorePosts ? (
            <Pressable style={styles.secondaryButton} onPress={onLoadMorePosts}>
              <Text style={styles.secondaryButtonText}>Load more posts</Text>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onReact={onReact}
            onOpen={() => onOpenPost(item)}
            currentUserId={currentUserId}
            onDeletePost={onDeletePost}
            onReportPost={onReportPost}
            onMessagePost={() => onMessagePost(item)}
            onVotePoll={onVotePoll}
            onSavePost={onSavePost}
            onSharePost={onSharePost}
            userCoordinates={userCoordinates}
            onOpenUserProfile={onOpenUserProfile}
          />
        )}
      />

      <Pressable
        style={styles.floatingButton}
        onPress={() => setTab("post")}
        accessibilityRole="button"
        accessibilityLabel="Create a post"
        hitSlop={8}
      >
        <View style={styles.floatingButtonIcon}>
          <Text style={styles.floatingButtonIconText}>+</Text>
        </View>
      </Pressable>
    </View>
  );
}
