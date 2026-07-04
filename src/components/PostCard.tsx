import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native"; import { useVideoPlayer, VideoView } from "expo-video";
import { PollCard } from "./PollCard";
import { styles } from "../styles";
import { Post, ReactionKey, reactionButtons } from "../types";
import { getFeedImagePreviewUrl } from "../utils/media";
import { timeAgo } from "../utils/timeAgo";

type PostCardProps = {
  post: Post;
  onReact: (postId: string, reaction: ReactionKey) => void;
  onOpen: () => void;
  currentUserId?: string;
  onDeletePost?: (postId: string) => void;
  onReportPost?: (postId: string, reason: string) => void;
  onMessagePost?: () => void;
  onVotePoll?: (postId: string, optionId: string) => void;
  onOpenUserProfile?: (target: {
    uid?: string;
    username?: string;
    author?: string;
    photoUrl?: string;
  }) => void;
};

function PostVideo({
  uri,
  controls = true,
  shouldPlay = false,
}: {
  uri: string;
  controls?: boolean;
  shouldPlay?: boolean;
}) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = true;
  });

  useEffect(() => {
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [shouldPlay, player]);

  return (
    <VideoView
      player={player}
      style={styles.postImage}
      allowsFullscreen
      allowsPictureInPicture
      nativeControls={controls}
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
  onVotePoll,
  onOpenUserProfile,
}: PostCardProps) {
  const previewComments = post.comments.slice(0, 2);
  const isOwner = !!currentUserId && post.uid === currentUserId;
  const [mediaOpen, setMediaOpen] = useState(false);
  const feedImageUri = useMemo(
    () => getFeedImagePreviewUrl(post.imageUri),
    [post.imageUri]
  );
  const profilePhotoUri = useMemo(
    () => getFeedImagePreviewUrl(post.photoUrl),
    [post.photoUrl]
  );
  const profilePhotoSource = useMemo(
    () => (profilePhotoUri ? { uri: profilePhotoUri } : undefined),
    [profilePhotoUri]
  );
  const feedImageSource = useMemo(
    () => (feedImageUri ? { uri: feedImageUri } : undefined),
    [feedImageUri]
  );
  const fullImageSource = useMemo(
    () => (post.imageUri ? { uri: post.imageUri } : undefined),
    [post.imageUri]
  );
  const selectedReaction = currentUserId ? post.reactedBy?.[currentUserId] : undefined;
  const canOpenAuthorProfile = !post.anonymous && !!post.uid;

  function openPostAuthorProfile() {
    if (!canOpenAuthorProfile) return;

    onOpenUserProfile?.({
      uid: post.uid,
      username: post.username,
      author: post.author,
      photoUrl: post.photoUrl,
    });
  }

  function openCommentAuthorProfile(comment: Post["comments"][number]) {
    if (!comment.uid || comment.author === "Anonymous") return;

    onOpenUserProfile?.({
      uid: comment.uid,
      username: comment.username,
      author: comment.author,
    });
  }

  function confirmDelete() {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this post? This cannot be undone."
      );

      if (confirmed) onDeletePost?.(post.id);
      return;
    }

    Alert.alert("Delete post?", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDeletePost?.(post.id),
      },
    ]);
  }

  function submitReport(reason: string) {
    const cleanedReason = reason.trim();

    if (!cleanedReason) return;

    onReportPost?.(post.id, cleanedReason);
  }

  function openReportOptions() {
    if (Platform.OS === "web") {
      const reason = window.prompt("Why are you reporting this post?");

      if (reason && reason.trim()) {
        submitReport(reason);
      }

      return;
    }

    Alert.alert("Report post", "Why are you reporting this post?", [
      { text: "Cancel", style: "cancel" },
      { text: "Spam", onPress: () => submitReport("Spam") },
      { text: "Harassment", onPress: () => submitReport("Harassment") },
      { text: "Fake post", onPress: () => submitReport("Fake post") },
      {
        text: "Inappropriate",
        style: "destructive",
        onPress: () => submitReport("Inappropriate content"),
      },
    ]);
  }

  return (
    <View style={styles.postCard}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <Pressable
          onPress={openPostAuthorProfile}
          disabled={!canOpenAuthorProfile}
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: "#0F172A",
            borderWidth: 1,
            borderColor: "#334155",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {!post.anonymous && profilePhotoSource ? (
            <Image
              source={profilePhotoSource}
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
              }}
            />
          ) : (
            <Text style={{ color: "#CBD5E1", fontSize: 24, fontWeight: "900" }}>
              {post.anonymous ? "👤" : post.author.replace("@", "")[0]?.toUpperCase()}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={openPostAuthorProfile}
          disabled={!canOpenAuthorProfile}
          style={{ flex: 1, marginLeft: 12 }}
        >
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.location}>
            {post.location} • {timeAgo(post.createdAt)}
          </Text>
        </Pressable>

        <View
          style={{
            backgroundColor: post.anonymous ? "#0F172A" : "#329BB8",
            borderRadius: 999,
            paddingVertical: 7,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: post.anonymous ? "#334155" : "#329BB8",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "900", fontSize: 11 }}>
            {post.anonymous ? "Anonymous" : "Local"}
          </Text>
        </View>
      </View>

      {!!post.category && (
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: "#0F172A",
            borderWidth: 1,
            borderColor: "#334155",
            paddingVertical: 7,
            paddingHorizontal: 11,
            borderRadius: 999,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#CBD5E1", fontWeight: "900", fontSize: 12 }}>
            #{post.category}
          </Text>
        </View>
      )}

      {!!post.text && <Text style={styles.postText}>{post.text}</Text>}

      {post.poll && (
        <PollCard
          poll={post.poll}
          currentUserId={currentUserId}
          onVote={(optionId) => onVotePoll?.(post.id, optionId)}
        />
      )}

      {post.imageUri && post.mediaType === "video" && (
        <Pressable onPress={() => setMediaOpen(true)}>
          <View
            style={{
              height: 220,
              borderRadius: 24,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#334155",
              marginBottom: 15,
              position: "relative",
              backgroundColor: "#0F172A",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 42, fontWeight: "900" }}>
              ▶
            </Text>
            <Text
              style={{
                color: "#CBD5E1",
                fontWeight: "900",
                marginTop: 8,
              }}
            >
              Tap to load video
            </Text>
            {post.mediaKind === "tutorial" && (
              <Text
                style={{
                  color: "#86B5CF",
                  fontWeight: "900",
                  marginTop: 5,
                  fontSize: 12,
                }}
              >
                Tutorial · opens on demand
              </Text>
            )}

            <View
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                backgroundColor: "rgba(0,0,0,0.75)",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "900",
                  fontSize: 12,
                }}
              >
                {post.mediaKind === "tutorial" ? "▶ TUTORIAL" : "▶ VIDEO"}
              </Text>
            </View>
          </View>
        </Pressable>
      )}

      {post.imageUri &&
        post.mediaType !== "video" &&
        !post.imageUri.startsWith("blob:") && (
          <Pressable onPress={() => setMediaOpen(true)}>
            {feedImageSource && (
              <Image
                source={feedImageSource}
                style={styles.postImage}
                resizeMode="contain"
              />
            )}
          </Pressable>
        )}

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          marginTop: 6,
        }}
      >
        {reactionButtons.map((reaction) => (
          <Pressable
            key={reaction.key}
            style={[
              styles.reaction,
              selectedReaction === reaction.key && styles.reactionSelected,
            ]}
            onPress={() => onReact(post.id, reaction.key)}
          >
            <Text
              style={[
                styles.reactionText,
                selectedReaction === reaction.key && styles.reactionTextSelected,
              ]}
            >
              {reaction.emoji} {post.reactions[reaction.key]}
            </Text>
          </Pressable>
        ))}

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
              paddingHorizontal: 17,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>Delete</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={openReportOptions}
            style={{
              backgroundColor: "#6B1F1F",
              paddingVertical: 10,
              paddingHorizontal: 15,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#8B2B2B",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontWeight: "900",
                textShadowColor: "rgba(0,0,0,0.25)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 1,
              }}
            >
              Report
            </Text>
          </Pressable>
        )}
      </View>

      {previewComments.length > 0 && (
        <View style={{ marginTop: 14 }}>
          {previewComments.map((comment) => (
            <View key={comment.id} style={styles.previewCommentCard}>
              <Pressable
                onPress={() => openCommentAuthorProfile(comment)}
                disabled={!comment.uid || comment.author === "Anonymous"}
              >
                <Text style={styles.commentAuthor}>{comment.author}</Text>
              </Pressable>
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

      <Modal visible={mediaOpen} animationType="fade" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.96)",
            justifyContent: "center",
            alignItems: "center",
            padding: 12,
          }}
        >
          <Pressable
            onPress={() => setMediaOpen(false)}
            style={{
              position: "absolute",
              top: 50,
              right: 22,
              zIndex: 10,
              backgroundColor: "#1E293B",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#334155",
            }}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>Close</Text>
          </Pressable>

          {mediaOpen && post.imageUri && post.mediaType === "video" && (
            <View
              style={{
                width: "100%",
                height: "80%",
                justifyContent: "center",
              }}
            >
              <PostVideo uri={post.imageUri} shouldPlay />
            </View>
          )}

          {mediaOpen &&
            post.imageUri &&
            post.mediaType !== "video" &&
            !post.imageUri.startsWith("blob:") && (
              <ScrollView
                style={{ width: "100%", height: "85%" }}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                maximumZoomScale={4}
                minimumZoomScale={1}
                centerContent
              >
                {fullImageSource && (
                  <Image
                    source={fullImageSource}
                    style={{
                      width: 360,
                      height: 650,
                    }}
                    resizeMode="contain"
                  />
                )}
              </ScrollView>
            )}
        </View>
      </Modal>
    </View>
  );
}
