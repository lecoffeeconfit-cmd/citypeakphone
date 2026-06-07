import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { PostCard } from "./PostCard";
import { styles } from "../styles";
import type { Post, ReactionKey } from "../types";
import { timeAgo } from "../utils/timeAgo";

type PostDetailsModalProps = {
  post: Post | null;
  onClose: () => void;
  onReact: (postId: string, reaction: ReactionKey) => void;
  onAddComment: (postId: string, text: string, anonymous: boolean) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  onAddReply: (
    postId: string,
    commentId: string,
    text: string,
    anonymous: boolean
  ) => void;
};

export function PostDetailsModal({
  post,
  onClose,
  onReact,
  onAddComment,
  onLikeComment,
  onAddReply,
}: PostDetailsModalProps) {
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(true);

  if (!post) return null;

  return (
    <Modal visible={!!post} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Post Details</Text>

            <Pressable onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
            <PostCard post={post} onReact={onReact} onOpen={() => {}} />

            <Text style={styles.smallTitle}>Comments</Text>

            {post.comments.length === 0 ? (
              <View style={styles.emptyCommentCard}>
                <Text style={styles.muted}>No comments yet. Start the conversation.</Text>
              </View>
            ) : (
              post.comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <Text style={styles.commentAuthor}>{comment.author}</Text>

                  <Text style={styles.commentText}>{comment.text}</Text>

                  <Text style={styles.previewCommentMeta}>
                    {timeAgo(comment.createdAt)}
                  </Text>

                  <View style={styles.commentActionRow}>
                    <Pressable onPress={() => onLikeComment(post.id, comment.id)}>
                      <Text style={styles.commentActionText}>
                        ❤️ Like {comment.likes ?? 0}
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

                  {(comment.replies ?? []).map((reply) => (
                    <View key={reply.id} style={styles.replyCard}>
                      <Text style={styles.commentAuthor}>{reply.author}</Text>

                      <Text style={styles.commentText}>{reply.text}</Text>

                      <Text style={styles.previewCommentMeta}>
                        {timeAgo(reply.createdAt)} · ❤️ {reply.likes}
                      </Text>
                    </View>
                  ))}

                  {replyingToCommentId === comment.id && (
                    <View style={styles.commentComposer}>
                      <TextInput
                        style={styles.commentInput}
                        placeholder="Reply to this comment..."
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
                              onAddReply(post.id, comment.id, replyText.trim(), anonymous);
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
                </View>
              ))
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
                      onAddComment(post.id, commentText.trim(), anonymous);
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
    </Modal>
  );
}