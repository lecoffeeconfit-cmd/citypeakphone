import React, { memo, useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native"; import { useVideoPlayer, VideoView } from "expo-video";
import { FeedMedia } from "./FeedMedia";
import { PollCard } from "./PollCard";
import { styles } from "../styles";
import { Post, ReactionKey, reactionButtons, type Coordinates } from "../types";
import { formatDistanceAway } from "../utils/distance";
import { formatExpirationLabel, getExpirationTimestamp } from "../utils/expiration";
import { devLog, getStableImageSource, normalizeMediaUri } from "../utils/media";
import { getPostFieldRows, getPostTypeOption } from "../utils/postTypes";
import { timeAgo } from "../utils/timeAgo";
import { countUsage } from "../utils/usageAudit";

type PostCardProps = {
  post: Post;
  onReact: (postId: string, reaction: ReactionKey) => void;
  onOpen: () => void;
  currentUserId?: string;
  onDeletePost?: (postId: string) => void;
  onReportPost?: (postId: string, reason: string) => void;
  onMessagePost?: () => void;
  onVotePoll?: (postId: string, optionId: string) => void;
  onSavePost?: (postId: string) => void;
  onSharePost?: (post: Post) => void;
  userCoordinates?: Coordinates | null;
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
      countUsage("video-load:post-modal");
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

function PostCardComponent({
  post,
  onReact,
  onOpen,
  currentUserId,
  onDeletePost,
  onReportPost,
  onMessagePost,
  onVotePoll,
  onSavePost,
  onSharePost,
  userCoordinates,
  onOpenUserProfile,
}: PostCardProps) {
  const previewComments = post.comments.slice(0, 2);
  const isOwner = !!currentUserId && post.uid === currentUserId;
  const [mediaOpen, setMediaOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const profilePhotoSource = useMemo(
    () => getStableImageSource(post.photoUrl, `post ${post.id} author photo`),
    [post.photoUrl, post.id]
  );
  const fullImageUrls = useMemo(() => {
    if (post.mediaType === "video") return [];

    const urls =
      post.imageUris?.length
        ? post.imageUris
        : [post.imageUrl || post.imageUri].filter(Boolean);

    return urls.filter((uri): uri is string => !!normalizeMediaUri(uri));
  }, [post.imageUrl, post.imageUri, post.imageUris, post.mediaType]);
  const feedThumbnailUrls = useMemo(() => {
    if (post.mediaType === "video") return [];

    const urls =
      post.thumbnailUrls?.length
        ? post.thumbnailUrls
        : [
            post.thumbnailUrl ||
              post.imageUrl ||
              post.imageUri ||
              post.imageThumbnailUri,
          ].filter(Boolean);

    return urls.filter((uri): uri is string => !!normalizeMediaUri(uri));
  }, [
    post.imageThumbnailUri,
    post.imageUri,
    post.imageUrl,
    post.mediaType,
    post.thumbnailUrl,
    post.thumbnailUrls,
  ]);
  const fullImageSource = useMemo(() => {
    if (!mediaOpen || post.mediaType === "video") return undefined;

    return getStableImageSource(
      fullImageUrls[selectedImageIndex] || post.imageUrl || post.imageUri,
      `post ${post.id} full image`
    );
  }, [
    fullImageUrls,
    mediaOpen,
    post.imageUrl,
    post.imageUri,
    post.mediaType,
    post.id,
    selectedImageIndex,
  ]);
  const videoUri = useMemo(
    () =>
      normalizeMediaUri(
        mediaOpen && post.mediaType === "video" ? post.imageUri : undefined
      ),
    [mediaOpen, post.imageUri, post.mediaType]
  );
  const selectedReaction = currentUserId ? post.reactedBy?.[currentUserId] : undefined;
  const isVideoPost = post.mediaType === "video" && !!post.imageUri;
  const webLazyImageProps = Platform.OS === "web" ? ({ loading: "lazy" } as any) : {};
  const videoPosterUrl = post.thumbnailUrl || post.imageThumbnailUri;
  const canOpenAuthorProfile = !!post.uid;
  const distanceLabel = formatDistanceAway(userCoordinates, post.postCoordinates);
  const expirationLabel = formatExpirationLabel(post.expiresAt);
  const isExpired = !!post.expiresAt && (getExpirationTimestamp(post.expiresAt) ?? 0) < Date.now();
  const isSaved = !!currentUserId && !!post.savedBy?.[currentUserId];
  const postTypeOption = getPostTypeOption(post.postType);
  const postFieldRows = getPostFieldRows(post.postFields);

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
    if (!comment.uid) return;

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
            backgroundColor: "rgba(15, 23, 42, 0.30)",
            borderWidth: 1,
            borderColor: "rgba(148, 163, 184, 0.28)",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {profilePhotoSource ? (
            <Image
              {...webLazyImageProps}
              source={profilePhotoSource}
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
              }}
              onLoad={() => devLog("[media] loaded post author photo", post.photoUrl)}
              onError={() => devLog("[media] failed post author photo", post.photoUrl)}
            />
          ) : (
            <Text style={{ color: "#CBD5E1", fontSize: 24, fontWeight: "900" }}>
              {post.author.replace("@", "")[0]?.toUpperCase() || "U"}
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
          {canOpenAuthorProfile && (
            <Text style={styles.postAuthorProfileHint}>Tap author to view profile</Text>
          )}
          <View style={styles.postApiMeta}>
            <Text style={styles.postApiMetaText}>
              📍 GPS location: {post.postCoordinates ? "Device GPS" : "Not saved"}
            </Text>
            <Text style={styles.postApiMetaText}>
              📏 Distance:{" "}
              {distanceLabel ||
                (userCoordinates ? "Post distance unavailable" : "Enable location")}
            </Text>
            <Text style={styles.postApiMetaText}>
              👁 Views: {post.engagement?.views ?? 0}
            </Text>
          </View>
        </Pressable>

        <View
          style={{
            backgroundColor: post.postType === "sale" ? "#F8B400" : "#329BB8",
            borderRadius: 999,
            paddingVertical: 7,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: post.postType === "sale" ? "#F8B400" : "#329BB8",
          }}
        >
          <Text
            style={{
              color: post.postType === "sale" ? "#003B57" : "#FFFFFF",
              fontWeight: "900",
              fontSize: 11,
            }}
          >
            {postTypeOption.emoji} {postTypeOption.label}
          </Text>
        </View>
      </View>

      {!!post.category && (
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: "rgba(15, 23, 42, 0.30)",
            borderWidth: 1,
            borderColor: "rgba(148, 163, 184, 0.24)",
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

      {!!expirationLabel && (
        <View style={[styles.expirationBadge, isExpired && styles.expirationBadgeExpired]}>
          <Text style={[styles.expirationBadgeText, isExpired && styles.expirationBadgeTextExpired]}>
            ⏳ {expirationLabel}
          </Text>
        </View>
      )}

      {!!post.tags?.length && (
        <View style={styles.postTagRow}>
          {post.tags.slice(0, 5).map((tag) => (
            <Text key={tag} style={styles.postTag}>
              #{tag}
            </Text>
          ))}
        </View>
      )}

      {!!post.text && <Text style={styles.postText}>{post.text}</Text>}

      {post.postType === "sale" && (
        <View style={styles.saleCard}>
          <Text style={styles.saleKicker}>For sale</Text>
          <Text style={styles.saleTitle}>{post.saleTitle}</Text>
          <Text style={styles.salePrice}>{post.salePrice}</Text>
          {!!post.saleCondition && (
            <Text style={styles.saleMeta}>{post.saleCondition}</Text>
          )}
        </View>
      )}

      {postFieldRows.length > 0 && (
        <View style={styles.postFieldsCard}>
          {postFieldRows.slice(0, 8).map((field) => (
            <View key={field.key} style={styles.postFieldRow}>
              <Text style={styles.postFieldLabel}>{field.label}</Text>
              <Text style={styles.postFieldValue}>{field.value}</Text>
            </View>
          ))}
        </View>
      )}

      {post.poll && (
        <PollCard
          poll={post.poll}
          currentUserId={currentUserId}
          onVote={(optionId) => onVotePoll?.(post.id, optionId)}
        />
      )}

      <FeedMedia
        mediaType={isVideoPost ? "video" : post.mediaType}
        thumbnailUrls={feedThumbnailUrls}
        posterUrl={videoPosterUrl}
        mediaKind={post.mediaKind}
        onOpenVideo={() => setMediaOpen(true)}
        onOpenImage={(index) => {
          setSelectedImageIndex(index);
          setMediaOpen(true);
        }}
      />

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

        <View style={styles.statChip}>
          <Text style={styles.statChipText}>👁 {post.engagement?.views ?? 0} views</Text>
        </View>

        {!isOwner && (
          <Pressable style={styles.commentButton} onPress={onMessagePost}>
            <Text style={styles.commentButtonText}>✉️ Message</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.commentButton, isSaved && styles.savedButton]}
          onPress={() => onSavePost?.(post.id)}
        >
          <Text style={[styles.commentButtonText, isSaved && styles.savedButtonText]}>
            {isSaved ? "✓ Saved" : `☆ Save ${post.engagement?.saves ?? 0}`}
          </Text>
        </Pressable>

        <Pressable style={styles.commentButton} onPress={() => onSharePost?.(post)}>
          <Text style={styles.commentButtonText}>↗ Share {post.engagement?.shares ?? 0}</Text>
        </Pressable>

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
                disabled={!comment.uid}
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
              backgroundColor: "rgba(30, 41, 59, 0.42)",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(148, 163, 184, 0.28)",
            }}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>Close</Text>
          </Pressable>

          {mediaOpen && videoUri && post.mediaType === "video" && (
            <View
              style={{
                width: "100%",
                height: "80%",
                justifyContent: "center",
              }}
            >
              <PostVideo uri={videoUri} shouldPlay />
            </View>
          )}

          {mediaOpen &&
            post.mediaType !== "video" &&
            fullImageSource && (
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
                <Image
                  source={fullImageSource}
                  style={{
                    width: 360,
                    height: 650,
                  }}
                  resizeMode="contain"
                  onLoad={() => devLog("[media] loaded post full image", post.imageUri)}
                  onError={() => devLog("[media] failed post full image", post.imageUri)}
                />
              </ScrollView>
            )}
        </View>
      </Modal>
    </View>
  );
}

export const PostCard = memo(
  PostCardComponent,
  (previousProps, nextProps) =>
    previousProps.post === nextProps.post &&
    previousProps.currentUserId === nextProps.currentUserId &&
    previousProps.userCoordinates?.latitude === nextProps.userCoordinates?.latitude &&
    previousProps.userCoordinates?.longitude === nextProps.userCoordinates?.longitude
);
