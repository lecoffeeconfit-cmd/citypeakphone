import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { PostCard } from "../components/PostCard";
import { styles } from "../styles";
import type { Post, ReactionKey, Tab } from "../types";

type FeedScreenProps = {
  posts: Post[];
  selectedArea: string;
  setTab: (tab: Tab) => void;
  onReact: (postId: string, reaction: ReactionKey) => void;
  onOpenPost: (post: Post) => void;
};

export function FeedScreen({
  posts,
  selectedArea,
  setTab,
  onReact,
  onOpenPost,
}: FeedScreenProps) {
  const filteredPosts = posts.filter((post) => post.location === selectedArea);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedList}
        ListHeaderComponent={
          <View style={styles.heroCard}>
            <Text style={styles.heroKicker}>Now peaking in</Text>
            <Text style={styles.heroTitle}>{selectedArea}</Text>
            <Text style={styles.heroText}>
              See what people nearby are talking about. Post anonymously or with your username.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No posts here yet</Text>
            <Text style={styles.muted}>Create the first post for this area.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard post={item} onReact={onReact} onOpen={() => onOpenPost(item)} />
        )}
      />

      <Pressable style={styles.floatingButton} onPress={() => setTab("post")}>
        <Text style={styles.floatingButtonText}>+</Text>
      </Pressable>
    </View>
  );
}