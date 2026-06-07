import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { PostCard } from "./PostCard";
import { styles } from "../styles";
import type { Post, ReactionKey } from "../types";

type PostDetailsModalProps = {
  post: Post | null;
  onClose: () => void;
  onReact: (postId: string, reaction: ReactionKey) => void;
  onAddComment: (postId: string, text: string, anonymous: boolean) => void;
};

export function PostDetailsModal({
  post,
  onClose,
  onReact,
  onAddComment,
}: PostDetailsModalProps) {
  const [commentText, setCommentText] = useState("");
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