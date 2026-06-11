import React, { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { PostCard } from "../components/PostCard";
import { styles } from "../styles";
import { postCategories } from "../types";
import type { Post, PostCategory, ReactionKey, Tab } from "../types";

type FeedMode = "latest" | "trending";
type CategoryFilter = "All" | PostCategory;

type FeedScreenProps = {
  posts: Post[];
  selectedArea: string;
  setTab: (tab: Tab) => void;
  onReact: (postId: string, reaction: ReactionKey) => void;
  onOpenPost: (post: Post) => void;
  currentUserId: string;
  onDeletePost: (postId: string) => void;
  onReportPost: (postId: string, reason: string) => void;
  onMessagePost: (post: Post) => void;
};

const categoryFilters: CategoryFilter[] = ["All", ...postCategories];

const categoryColors: Record<string, string> = {
  All: "#86B5CF",
  Educational: "#329BB8",
  Entertainment: "#003B57",
  Social: "#F8B400",
  "Sales & Marketing": "#F58A00",
  "Random Thoughts": "#86B5CF",
  Places: "#329BB8",
};

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
  if (category === "Educational") return "📘";
  if (category === "Entertainment") return "🎬";
  if (category === "Social") return "👥";
  if (category === "Sales & Marketing") return "📣";
  if (category === "Random Thoughts") return "💭";
  return "📍";
}

export function FeedScreen({
  posts,
  selectedArea,
  setTab,
  onReact,
  onOpenPost,
  currentUserId,
  onDeletePost,
  onReportPost,
  onMessagePost,
}: FeedScreenProps) {
  const [feedMode, setFeedMode] = useState<FeedMode>("latest");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [showAllCategories, setShowAllCategories] = useState(false);

  const filteredPosts = useMemo(() => {
    let areaPosts = posts.filter((post) => post.location === selectedArea);

    if (categoryFilter !== "All") {
      areaPosts = areaPosts.filter((post) => post.category === categoryFilter);
    }

    if (feedMode === "trending") {
      return [...areaPosts].sort((a, b) => getTrendingScore(b) - getTrendingScore(a));
    }

    return areaPosts;
  }, [posts, selectedArea, feedMode, categoryFilter]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedList}
        ListHeaderComponent={
          <>
            <Pressable style={styles.searchPill} onPress={() => setTab("search")}>
              <Text style={styles.searchPillText}>
                🔍 Search or change city · {selectedArea}
              </Text>
            </Pressable>

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
                            backgroundColor: color,
                            borderColor: active ? "#FFFFFF" : color,
                            borderWidth: active ? 3 : 1,
                            marginRight: 0,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 21 }}>{getCategoryEmoji(category)}</Text>

                        <Text
                          numberOfLines={2}
                          style={[
                            styles.feedCategoryText,
                            {
                              color:
                                color === "#F8B400" || color === "#86B5CF"
                                  ? "#003B57"
                                  : "#FFFFFF",
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
                            backgroundColor: color,
                            borderColor: active ? "#FFFFFF" : color,
                            borderWidth: active ? 3 : 1,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 21 }}>{getCategoryEmoji(category)}</Text>

                        <Text
                          numberOfLines={2}
                          style={[
                            styles.feedCategoryText,
                            {
                              color:
                                color === "#F8B400" || color === "#86B5CF"
                                  ? "#003B57"
                                  : "#FFFFFF",
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
              <View style={styles.heroCircleYellow} />
              <View style={styles.heroCircleOrange} />

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
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onReact={onReact}
            onOpen={() => onOpenPost(item)}
            currentUserId={currentUserId}
            onDeletePost={onDeletePost}
            onReportPost={onReportPost}
            onMessagePost={() => onMessagePost(item)}
          />
        )}
      />

      <Pressable style={styles.floatingButton} onPress={() => setTab("post")}>
        <Text style={styles.floatingButtonText}>+</Text>
      </Pressable>
    </View>
  );
}