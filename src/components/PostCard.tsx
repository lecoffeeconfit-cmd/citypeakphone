import React from "react";
import { Alert, Image, Platform, Pressable, Text, View } from "react-native";
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
  onReportPost?: (postId: string, reason: string) => void;
  onMessagePost?: () => void;
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
  onReportPost,
  onMessagePost,
}: PostCardProps) {
  const previewComments = post.comments.slice(0, 2);
  const isOwner = !!currentUserId && post.uid === currentUserId;

  function confirmDelete() {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this post? This cannot be undone."
      );

      if (confirmed) {
        onDeletePost?.(post.id);
      }

      return;
    }

    Alert.alert(
      "Delete post?",
      "Are you sure you want to delete this post? This cannot be undone.",
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

  function openReportOptions() {
    if (Platform.OS === "web") {
      const reason = window.prompt(
        "Why are you reporting this post?\n\nType one reason:\nSpam\nHarassment\nFake post\nInappropriate content"
      );

      if (reason && reason.trim()) {
        onReportPost?.(post.id, reason.trim());
      }

      return;
    }

    Alert.alert("Report post", "Why are you reporting this post?", [
      { text: "Cancel", style: "cancel" },
      { text: "Spam", onPress: () => onReportPost?.(post.id, "Spam") },
      {
        text: "Harassment",
        onPress: () => onReportPost?.(post.id, "Harassment"),
      },
      {
        text: "Fake post",
        onPress: () => onReportPost?.(post.id, "Fake post"),
      },
      {
        text: "Inappropriate",
        style: "destructive",
        onPress: () => onReportPost?.(post.id, "Inappropriate content"),
      },
    ]);
  }

  return (
    <View style={styles.postCard}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {post.anonymous
              ? "?"
              : post.author.replace("@", "")[0]?.toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.location}>
            {post.location} • {timeAgo(post.createdAt)}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: post.anonymous ? "#F8B400" : "#329BB8",
            borderRadius: 999,
            paddingVertical: 7,
            paddingHorizontal: 11,
          }}
        >
          <Text
            style={{
              color: post.anonymous ? "#003B57" : "#FFFFFF",
              fontWeight: "900",
              fontSize: 11,
            }}
          >
            {post.anonymous ? "ANON" : "LOCAL"}
          </Text>
        </View>
      </View>

      {!!post.category && (
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: "#EAF6FA",
            borderWidth: 1,
            borderColor: "#86B5CF",
            paddingVertical: 7,
            paddingHorizontal: 11,
            borderRadius: 999,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#003B57", fontWeight: "900", fontSize: 12 }}>
            #{post.category}
          </Text>
        </View>
      )}

      {!!post.text && <Text style={styles.postText}>{post.text}</Text>}

      {post.imageUri && post.mediaType === "video" && (
        <View
          style={{
            borderRadius: 24,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#D8EAF2",
            marginBottom: 15,
          }}
        >
          <PostVideo uri={post.imageUri} />
        </View>
      )}

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
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: "#D8EAF2",
          marginVertical: 14,
        }}
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Pressable style={styles.commentButton} onPress={onOpen}>
          <Text style={styles.commentButtonText}>
            💬 Comments {post.comments.length}
          </Text>
        </Pressable>

        {!post.anonymous && !isOwner && (
          <Pressable style={styles.commentButton} onPress={onMessagePost}>
            <Text style={styles.commentButtonText}>✉️ Message</Text>
          </Pressable>
        )}

        {isOwner ? (
          <Pressable
            onPress={confirmDelete}
            style={{
              backgroundColor: "#DC2626",
              paddingVertical: 10,
              paddingHorizontal: 15,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>Delete</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={openReportOptions}
            style={{
              backgroundColor: "#F4F6F8",
              paddingVertical: 10,
              paddingHorizontal: 15,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#D8EAF2",
            }}
          >
            <Text style={{ color: "#003B57", fontWeight: "900" }}>Report</Text>
          </Pressable>
        )}
      </View>

      {previewComments.length > 0 && (
        <View style={{ marginTop: 14 }}>
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

          {post.comments.length > 2 && (
            <Pressable onPress={onOpen}>
              <Text style={styles.viewMoreComments}>
                View all {post.comments.length} comments →
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}