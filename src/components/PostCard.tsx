import React from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { styles } from "../styles";
import { Post, ReactionKey, reactionButtons } from "../types";
import { timeAgo } from "../utils/timeAgo";

type PostCardProps = {
  post: Post;
  onReact: (postId: string, reaction: ReactionKey) => void;
  onOpen: () => void;
  currentUserId?: string;
  onDeletePost?: (postId: string) => void;
};

function PostVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
  });

  return (
    <VideoView
      player={player}
      style={styles.postImage}
      allowsFullscreen
      allowsPictureInPicture
      nativeControls
    />
  );
}

export function PostCard({
  post,
  onReact,
  onOpen,
  currentUserId,
  onDeletePost,
}: PostCardProps) {
  const previewComments = post.comments.slice(0, 3);
  const isOwner = !!currentUserId && post.uid === currentUserId;

  function confirmDelete() {
    Alert.alert(
      "Delete post?",
      "This will permanently delete your post.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDeletePost?.(post.id),
        },
      ]
    );
  }

  return (
    <Pressable style={styles.postCard} onPress={onOpen}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {post.anonymous ? "?" : post.author.replace("@", "")[0]?.toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.location}>
            {post.location} • {timeAgo(post.createdAt)}
          </Text>
        </View>

       {isOwner ? (
  <Pressable
    onPress={(event: any) => {
      event.stopPropagation?.();
      onDeletePost?.(post.id);
    }}
    style={{
      backgroundColor: "#7F1D1D",
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 999,
    }}
    hitSlop={20}
  >
    <Text style={{ color: "white", fontWeight: "900" }}>Delete</Text>
  </Pressable>
) : (
  <Text style={styles.more}>•••</Text>
)}
      </View>

      {!!post.text && <Text style={styles.postText}>{post.text}</Text>}

      {post.imageUri && post.mediaType === "video" && <PostVideo uri={post.imageUri} />}

      {post.imageUri && post.mediaType !== "video" && (
        <Image source={{ uri: post.imageUri }} style={styles.postImage} />
      )}

      <View style={styles.reactionRow}>
        {reactionButtons.map((reaction) => (
          <Pressable
            key={reaction.key}
            style={styles.reaction}
            onPress={() => onReact(post.id, reaction.key)}
          >
            <Text style={styles.reactionText}>
              {reaction.emoji} {post.reactions[reaction.key]}
            </Text>
          </Pressable>
        ))}

        <Pressable style={styles.commentButton} onPress={onOpen}>
          <Text style={styles.commentButtonText}>💬 Comments {post.comments.length}</Text>
        </Pressable>
      </View>

      {previewComments.length > 0 && (
        <View style={{ marginTop: 12 }}>
          {previewComments.map((comment) => (
            <View key={comment.id} style={styles.previewCommentCard}>
              <Text style={styles.commentAuthor}>{comment.author}</Text>
              <Text style={styles.commentText}>{comment.text}</Text>

              <Text style={styles.previewCommentMeta}>
                {timeAgo(comment.createdAt)} · ❤️ {comment.likes ?? 0} · 💬{" "}
                {comment.replies?.length ?? 0} replies
              </Text>
            </View>
          ))}

          {post.comments.length > 3 && (
            <Text style={styles.viewMoreComments}>
              View all {post.comments.length} comments
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}