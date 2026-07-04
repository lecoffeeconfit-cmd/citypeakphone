import React, { useEffect, useState } from "react";
import { Image, Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { PollCard } from "./PollCard";
import { styles } from "../styles";
import type { Post, ReactionKey } from "../types";
import { timeAgo } from "../utils/timeAgo";

type PostDetailsModalProps = {
  post: Post | null;
  onClose: () => void;
  onReact: (postId: string, reaction: ReactionKey) => void;
  onAddComment: (postId: string, text: string, anonymous: boolean) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  onDislikeComment: (postId: string, commentId: string) => void;
  onAddReply: (postId: string, commentId: string, text: string, anonymous: boolean) => void;
  currentUserId?: string;
  onDeletePost?: (postId: string) => void;
  onReportPost?: (postId: string, reason: string) => void;
  onReportComment?: (postId: string, commentId: string, reason: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onVotePoll?: (postId: string, optionId: string) => void;
  onOpenUserProfile?: (target: {
    uid?: string;
    username?: string;
    author?: string;
    photoUrl?: string;
  }) => void;
};

export function PostDetailsModal({
  post,
  onClose,
  onAddComment,
  onLikeComment,
  onDislikeComment,
  onAddReply,
  currentUserId,
  onVotePoll,
  onOpenUserProfile,
}: PostDetailsModalProps) {
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(true);
  const [localPost, setLocalPost] = useState<Post | null>(post);
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null);

  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  if (!localPost) return null;

  const activePost = localPost;

  function openPostAuthorProfile() {
    if (!activePost.uid || activePost.anonymous) return;

    onOpenUserProfile?.({
      uid: activePost.uid,
      username: activePost.username,
      author: activePost.author,
      photoUrl: activePost.photoUrl,
    });
  }

  function openCommentAuthorProfile(comment: any) {
    if (!comment.uid || comment.author === "Anonymous") return;

    onOpenUserProfile?.({
      uid: comment.uid,
      username: comment.username,
      author: comment.author,
    });
  }

  function updateCommentCount(
    comments: any[],
    commentId: string,
    field: "likes" | "dislikes"
  ): any[] {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        if (!currentUserId) return comment;

        const likedBy = { ...(comment.likedBy ?? {}) };
        const dislikedBy = { ...(comment.dislikedBy ?? {}) };
        const hasLiked = likedBy[currentUserId] === true;
        const hasDisliked = dislikedBy[currentUserId] === true;
        const nextComment = {
          ...comment,
          likes: comment.likes ?? 0,
          dislikes: comment.dislikes ?? 0,
          likedBy,
          dislikedBy,
        };

        if (field === "likes") {
          if (hasLiked) return nextComment;

          nextComment.likes += 1;
          likedBy[currentUserId] = true;

          if (hasDisliked) {
            nextComment.dislikes = Math.max(0, nextComment.dislikes - 1);
            delete dislikedBy[currentUserId];
          }

          return nextComment;
        }

        if (hasDisliked) return nextComment;

        nextComment.dislikes += 1;
        dislikedBy[currentUserId] = true;

        if (hasLiked) {
          nextComment.likes = Math.max(0, nextComment.likes - 1);
          delete likedBy[currentUserId];
        }

        return {
          ...nextComment,
          likedBy,
          dislikedBy,
        };
      }

      return {
        ...comment,
        replies: updateCommentCount(comment.replies ?? [], commentId, field),
      };
    });
  }

  function renderComment(comment: any, depth = 0) {
    const isReply = depth > 0;
    const isDeepReply = depth > 1;

    return (
      <View
        key={comment.id}
        style={[
          styles.commentCard,
          isReply && styles.threadedCommentCard,
          isDeepReply && styles.threadedCommentCardDeep,
        ]}
      >
        <Pressable
          onPress={() => openCommentAuthorProfile(comment)}
          disabled={!comment.uid || comment.author === "Anonymous"}
        >
          <Text style={styles.commentAuthor}>{comment.author}</Text>
        </Pressable>
        <Text style={styles.commentText}>{comment.text}</Text>

        <Text style={styles.previewCommentMeta}>
          {timeAgo(comment.createdAt)}
        </Text>

        <View style={styles.commentActionRow}>
          <Pressable
            disabled={currentUserId ? comment.likedBy?.[currentUserId] === true : false}
            onPress={() => {
              setLocalPost((prev) => {
                if (!prev) return prev;

                return {
                  ...prev,
                  comments: updateCommentCount(
                    prev.comments ?? [],
                    comment.id,
                    "likes"
                  ),
                };
              });

              onLikeComment(activePost.id, comment.id);
            }}
          >
            <Text
              style={[
                styles.commentActionText,
                currentUserId &&
                  comment.likedBy?.[currentUserId] === true &&
                  styles.commentActionTextSelected,
              ]}
            >
              ❤️ Like {comment.likes ?? 0}
            </Text>
          </Pressable>

          <Pressable
            disabled={currentUserId ? comment.dislikedBy?.[currentUserId] === true : false}
            onPress={() => {
              setLocalPost((prev) => {
                if (!prev) return prev;

                return {
                  ...prev,
                  comments: updateCommentCount(
                    prev.comments ?? [],
                    comment.id,
                    "dislikes"
                  ),
                };
              });

              onDislikeComment(activePost.id, comment.id);
            }}
          >
            <Text
              style={[
                styles.commentActionText,
                currentUserId &&
                  comment.dislikedBy?.[currentUserId] === true &&
                  styles.commentActionTextSelected,
              ]}
            >
              👎 Dislike {comment.dislikes ?? 0}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setReplyingToCommentId(comment.id);
              setReplyText("");
            }}
          >
            <Text style={styles.commentActionText}>
              💬 Reply {comment.replies?.length ?? 0}
            </Text>
          </Pressable>
        </View>

        {replyingToCommentId === comment.id && (
          <View style={styles.commentComposer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Reply..."
              placeholderTextColor="#64748B"
              value={replyText}
              onChangeText={setReplyText}
            />

            <View style={styles.commentControls}>
              <Pressable
                onPress={() => {
                  setReplyingToCommentId(null);
                  setReplyText("");
                }}
              >
                <Text style={styles.commentActionText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.sendButton}
                onPress={() => {
                  if (replyText.trim()) {
                    const newReply = {
                      id: Date.now().toString(),
                      text: replyText.trim(),
                      author: anonymous ? "Anonymous" : "You",
                      createdAt: Date.now(),
                      likes: 0,
                      dislikes: 0,
                      likedBy: {},
                      dislikedBy: {},
                      replies: [],
                    };

                    function addReplyLocally(comments: any[]): any[] {
                      return comments.map((c) => {
                        if (c.id === comment.id) {
                          return {
                            ...c,
                            replies: [...(c.replies ?? []), newReply],
                          };
                        }

                        return {
                          ...c,
                          replies: addReplyLocally(c.replies ?? []),
                        };
                      });
                    }

                    setLocalPost({
                      ...activePost,
                      comments: addReplyLocally(activePost.comments ?? []),
                    });

                    onAddReply(activePost.id, comment.id, replyText.trim(), anonymous);

                    setReplyText("");
                    setReplyingToCommentId(null);
                  }
                }}
              >
                <Text style={styles.sendButtonText}>Reply</Text>
              </Pressable>
            </View>
          </View>
        )}

        {(comment.replies ?? []).length > 0 && (
          <View style={styles.commentReplies}>
            {(comment.replies ?? []).map((reply: any) =>
              renderComment(reply, depth + 1)
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <Modal visible={!!localPost} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Post Details</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
            <View style={styles.postCard}>
              <Pressable
                onPress={openPostAuthorProfile}
                disabled={!localPost.uid || localPost.anonymous}
              >
                <Text style={styles.author}>{localPost.author}</Text>
              </Pressable>
              <Text style={styles.location}>
                {localPost.location} • {timeAgo(localPost.createdAt)}
              </Text>

              {!!localPost.text && <Text style={styles.postText}>{localPost.text}</Text>}
              {!!localPost.poll && (
                <PollCard
                  poll={localPost.poll}
                  currentUserId={currentUserId}
                  onVote={(optionId) => onVotePoll?.(localPost.id, optionId)}
                />
              )}
              {!!localPost.imageUri && localPost.mediaType !== "video" && !localPost.imageUri.startsWith("blob:") && (
                <Pressable
                  onPress={() => {
                    if (localPost.imageUri) {
                      setImagePreviewUri(localPost.imageUri);
                    }
                  }}
                >
                  <Image
                    source={{ uri: localPost.imageUri }}
                    style={{
                      width: "100%",
                      height: 300,
                      borderRadius: 16,
                      marginTop: 12,
                      backgroundColor: "#0F172A",
                    }}
                    resizeMode="cover"
                  />
                </Pressable>
              )}
            </View>

            <Text style={styles.smallTitle}>Comments</Text>

            {localPost.comments.length === 0 ? (
              <View style={styles.emptyCommentCard}>
                <Text style={styles.muted}>No comments yet. Start the conversation.</Text>
              </View>
            ) : (
              localPost.comments.map((comment) => renderComment(comment))
            )}

            <View style={styles.commentComposer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#64748B"
                value={commentText}
                onChangeText={setCommentText}
              />

              <View style={styles.commentControls}>
                <Text style={styles.switchHelp}>Anon</Text>
                <Switch value={anonymous} onValueChange={setAnonymous} />

                <Pressable
                  style={styles.sendButton}
                  onPress={() => {
                    if (commentText.trim()) {
                      onAddComment(localPost.id, commentText.trim(), anonymous);
                      setCommentText("");
                    }
                  }}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
      <Modal visible={!!imagePreviewUri} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "black",
          }}
        >
          <Pressable
            onPress={() => setImagePreviewUri(null)}
            style={{
              position: "absolute",
              top: 50,
              right: 24,
              zIndex: 10,
              backgroundColor: "#111827",
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
          >
            <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>
              ✕
            </Text>
          </Pressable>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            maximumZoomScale={4}
            minimumZoomScale={1}
            centerContent
          >
            {imagePreviewUri && !imagePreviewUri.startsWith("blob:") && (
              <Image
                source={{ uri: imagePreviewUri }}
                style={{
                  width: "100%",
                  height: 700,
                }}
                resizeMode="contain"
              />
            )}
          </ScrollView>
        </View>
      </Modal>
    </Modal>
  );
}
