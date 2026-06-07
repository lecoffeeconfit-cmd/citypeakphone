import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { styles } from "../styles";
import { Post, ReactionKey, reactionButtons } from "../types";

type PostCardProps = {
  post: Post;
  onReact: (postId: string, reaction: ReactionKey) => void;
  onOpen: () => void;
};

export function PostCard({ post, onReact, onOpen }: PostCardProps) {
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
          <Text style={styles.location}>{post.location}</Text>
        </View>

        <Text style={styles.more}>•••</Text>
      </View>

      {!!post.text && <Text style={styles.postText}>{post.text}</Text>}

      {post.imageUri && <Image source={{ uri: post.imageUri }} style={styles.postImage} />}

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
          <Text style={styles.commentButtonText}>
            💬 Comments {post.comments.length}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}