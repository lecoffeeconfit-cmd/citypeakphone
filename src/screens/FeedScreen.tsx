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
};

const categoryFilters: CategoryFilter[] = ["All", ...postCategories];

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

export function FeedScreen({
  posts,
  selectedArea,
  setTab,
  onReact,
  onOpenPost,
  currentUserId,
  onDeletePost,
  onReportPost,
}: FeedScreenProps) {
  const [feedMode, setFeedMode] = useState<FeedMode>("latest");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");

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
            <View style={styles.heroCard}>
              <Text style={styles.heroKicker}>Now peaking in</Text>
              <Text style={styles.heroTitle}>{selectedArea}</Text>
              <Text style={styles.heroText}>
                See what people nearby are talking about. Post anonymously or with your username.
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryFilterRow}
            >
              {categoryFilters.map((category) => (
                <Pressable
                  key={category}
                  style={[
                    styles.categoryFilterChip,
                    categoryFilter === category && styles.categoryFilterChipActive,
                  ]}
                  onPress={() => setCategoryFilter(category)}
                >
                  <Text
                    style={[
                      styles.categoryFilterText,
                      categoryFilter === category && styles.categoryFilterTextActive,
                    ]}
                  >
                    {category === "All" ? "🌎 All" : category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
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
/>
        )}
      />

      <Pressable style={styles.floatingButton} onPress={() => setTab("post")}>
        <Text style={styles.floatingButtonText}>+</Text>
      </Pressable>
    </View>
  );
}