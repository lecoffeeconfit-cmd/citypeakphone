import React, { useState } from "react";
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { styles } from "../styles";
import type { Post } from "../types";
import { formatExpirationLabel, getExpirationTimestamp } from "../utils/expiration";
import { devLog, getStableImageSource } from "../utils/media";

type ProfileView = "overview" | "posts" | "saved";

type ProfileScreenProps = {
  username: string;
  setUsername: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  photoUrl: string;
  email?: string | null;
  stats: {
    posts: number;
    reactions: number;
    comments: number;
    polls: number;
    pollVotes: number;
    areas: number;
    views: number;
    saves: number;
    shares: number;
  };
  posts: Post[];
  savedPosts: Post[];
  onSaveProfile: (username: string, bio: string, imageUri?: string) => void;
  onUpdatePost: (
    postId: string,
    updates: {
      text: string;
      tags: string[];
      expiresAt?: string | null;
      saleTitle?: string;
      salePrice?: string;
      saleCondition?: string;
    }
  ) => Promise<void>;
  onOpenPost: (post: Post) => void;
  onLogout: () => void;
onDeleteAccount: () => void;
};

export function ProfileScreen({
  username,
  setUsername,
  bio,
  setBio,
  photoUrl,
  email,
  stats,
  posts,
  savedPosts,
 onSaveProfile,
onUpdatePost,
onOpenPost,
onLogout,
onDeleteAccount,
}: ProfileScreenProps) {
  const [localImageUri, setLocalImageUri] = useState<string | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [profileView, setProfileView] = useState<ProfileView>("overview");
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editText, setEditText] = useState("");
  const [editTagsText, setEditTagsText] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [editSaleTitle, setEditSaleTitle] = useState("");
  const [editSalePrice, setEditSalePrice] = useState("");
  const [editSaleCondition, setEditSaleCondition] = useState("");

  async function pickProfilePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission to access photos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
      setIsEditing(true);
    }
  }

  function handleSave() {
    onSaveProfile(username, bio, localImageUri);
    setIsEditing(false);
  }

  function startEditingPost(post: Post) {
    setEditingPost(post);
    setEditText(post.text || "");
    setEditTagsText((post.tags || []).join(", "));
    setEditExpiresAt(post.expiresAt || "");
    setEditSaleTitle(post.saleTitle || "");
    setEditSalePrice(post.salePrice || "");
    setEditSaleCondition(post.saleCondition || "");
  }

  async function saveEditedPost() {
    if (!editingPost) return;

    if (editExpiresAt.trim() && !getExpirationTimestamp(editExpiresAt.trim())) {
      alert("Use an expiration date like 2026-07-31.");
      return;
    }

    await onUpdatePost(editingPost.id, {
      text: editText.trim(),
      tags: editTagsText
        .split(",")
        .map((tag) => tag.trim().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 5),
      expiresAt: editExpiresAt.trim() || null,
      saleTitle: editSaleTitle.trim(),
      salePrice: editSalePrice.trim(),
      saleCondition: editSaleCondition.trim(),
    });

    setEditingPost(null);
  }

  function renderProfilePost(post: Post, mode: "owned" | "saved") {
    const expirationLabel = formatExpirationLabel(post.expiresAt);
    const previewText =
      post.saleTitle || post.poll?.question || post.text || "Media post";

    return (
      <View key={post.id} style={styles.profilePostCard}>
        <View style={styles.profilePostHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.profilePostKicker}>
              {mode === "owned" ? post.location : post.author}
            </Text>
            <Text numberOfLines={2} style={styles.profilePostTitle}>
              {previewText}
            </Text>
          </View>

          {mode === "owned" ? (
            <Pressable style={styles.profilePostActionButton} onPress={() => startEditingPost(post)}>
              <Text style={styles.profilePostActionText}>Edit</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.profilePostActionButton} onPress={() => onOpenPost(post)}>
              <Text style={styles.profilePostActionText}>Open</Text>
            </Pressable>
          )}
        </View>

        {!!expirationLabel && (
          <Text style={styles.profilePostMeta}>⏳ {expirationLabel}</Text>
        )}

        {!!post.tags?.length && (
          <View style={styles.profilePostTags}>
            {post.tags.slice(0, 5).map((tag) => (
              <Text key={tag} style={styles.profilePostTag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.profilePostMeta}>
          👁 {post.engagement?.views ?? 0}   ☆ {post.engagement?.saves ?? 0}   ↗ {post.engagement?.shares ?? 0}
        </Text>
      </View>
    );
  }

  const displayPhoto = localImageUri || photoUrl;
  const displayPhotoSource = getStableImageSource(displayPhoto, "profile photo");
  const legalTitle =
    legalModal === "terms" ? "Terms of Service" : "Privacy Policy";
  const legalBody =
    legalModal === "terms"
      ? [
          "CityPeak is a local social app for sharing posts, media, comments, polls, messages, and community reports.",
          "Use CityPeak respectfully. Do not post harassment, spam, illegal content, threats, impersonation, or content that violates another person's rights.",
          "You are responsible for what you post. We may remove content, restrict features, or delete accounts when needed to protect the community.",
          "CityPeak is provided as-is, and local posts are user-generated. Always use your own judgment before relying on information shared by other users.",
        ]
      : [
          "CityPeak stores the account information, profile details, posts, comments, messages, polls, reactions, reports, and media you choose to provide.",
          "Photos and videos may be stored with Supabase Storage. App data may be stored with Firebase services so CityPeak can sync your feed, profile, comments, reports, and messages.",
          "We use this data to run the app, personalize local feeds, support messaging, enforce safety, investigate reports, and improve reliability.",
          "You can delete your account from this screen. Deleting an account may remove account data, but some safety, moderation, or backup records may remain where required for app integrity.",
        ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 130 }}>
      <Text style={styles.screenTitle}>Profile</Text>

      <View style={styles.profileCard}>
        <Pressable onPress={pickProfilePhoto}>
          {displayPhotoSource ? (
            <Image
              source={displayPhotoSource}
              style={styles.profilePhoto}
              onLoad={() => devLog("[media] loaded profile photo", displayPhoto)}
              onError={() => devLog("[media] failed profile photo", displayPhoto)}
            />
          ) : (
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {username[0]?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </Pressable>

        <Text style={styles.profileName}>@{username || "username"}</Text>

        <Text style={styles.muted}>
          {isEditing ? "Tap your photo to change it." : "Your CityPeak profile"}
        </Text>

        {!!bio && !isEditing && (
  <View
    style={{
      marginTop: 16,
      backgroundColor: "#0F172A",
      borderWidth: 1,
      borderColor: "#334155",
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 12,
    }}
  >
    <Text
      style={{
        color: "#CBD5E1",
        textAlign: "center",
        fontSize: 15,
        lineHeight: 24,
      }}
    >
      {bio}
    </Text>
  </View>
)}

        {!bio && !isEditing && (
          <Text style={{ color: "#94A3B8", marginTop: 14, textAlign: "center" }}>
            No bio added yet.
          </Text>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.reactions}</Text>
            <Text style={styles.statLabel}>Reactions</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.areas}</Text>
            <Text style={styles.statLabel}>Areas</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.comments}</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.polls}</Text>
            <Text style={styles.statLabel}>Polls</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.pollVotes}</Text>
            <Text style={styles.statLabel}>Poll Votes</Text>
          </View>
        </View>

        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsKicker}>Engagement</Text>
          <Text style={styles.analyticsTitle}>Your post analytics</Text>

          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsMetric}>
              <Text style={styles.analyticsIcon}>👁</Text>
              <Text style={styles.analyticsValue}>{stats.views}</Text>
              <Text style={styles.analyticsLabel}>Views</Text>
            </View>

            <View style={styles.analyticsMetric}>
              <Text style={styles.analyticsIcon}>☆</Text>
              <Text style={styles.analyticsValue}>{stats.saves}</Text>
              <Text style={styles.analyticsLabel}>Saves</Text>
            </View>

            <View style={styles.analyticsMetric}>
              <Text style={styles.analyticsIcon}>↗</Text>
              <Text style={styles.analyticsValue}>{stats.shares}</Text>
              <Text style={styles.analyticsLabel}>Shares</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.profileViewTabs}>
        {([
          { key: "overview", label: "Overview" },
          { key: "posts", label: "Your Posts" },
          { key: "saved", label: "Saved" },
        ] as { key: ProfileView; label: string }[]).map((item) => {
          const active = profileView === item.key;

          return (
            <Pressable
              key={item.key}
              style={[styles.profileViewTab, active && styles.profileViewTabActive]}
              onPress={() => setProfileView(item.key)}
            >
              <Text style={[styles.profileViewTabText, active && styles.profileViewTabTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {profileView === "posts" && (
        <View style={styles.profileContentPanel}>
          <Text style={styles.profileContentTitle}>Your posts</Text>
          {posts.length === 0 ? (
            <Text style={styles.profileContentEmpty}>Posts you create will show here.</Text>
          ) : (
            posts.map((post) => renderProfilePost(post, "owned"))
          )}
        </View>
      )}

      {profileView === "saved" && (
        <View style={styles.profileContentPanel}>
          <Text style={styles.profileContentTitle}>Saved posts</Text>
          {savedPosts.length === 0 ? (
            <Text style={styles.profileContentEmpty}>Saved posts will show here.</Text>
          ) : (
            savedPosts.map((post) => renderProfilePost(post, "saved"))
          )}
        </View>
      )}

      {isEditing ? (
        <>
          <Text style={styles.smallTitle}>Username</Text>

          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
          />

          <Text style={styles.smallTitle}>Bio</Text>

          <TextInput
            style={styles.profileBioInput}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people about yourself..."
            placeholderTextColor="#94A3B8"
            multiline
          />

          <Pressable style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryButtonText}>Save Profile</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => setIsEditing(false)}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
        </>
      ) : (
        <Pressable style={styles.primaryButton} onPress={() => setIsEditing(true)}>
          <Text style={styles.primaryButtonText}>Edit Profile</Text>
        </Pressable>
      )}

      <View style={styles.accountActionCard}>
        <View style={styles.accountIconBox}>
          <Text style={styles.accountIconText}>
            {username[0]?.toUpperCase() || "?"}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.accountKicker}>Account</Text>
          <Text style={styles.accountTitle}>@{username || "username"}</Text>
          <Text numberOfLines={2} style={styles.accountSubtitle}>
            {email || "Signed in to CityPeak"}
          </Text>
        </View>

        <Pressable style={styles.accountLogoutButton} onPress={onLogout}>
          <Text style={styles.accountLogoutText}>Log out</Text>
        </Pressable>
      </View>

      <View style={styles.dangerActionCard}>
        <View style={styles.dangerIconBox}>
          <Text style={styles.dangerIconText}>⌫</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.dangerKicker}>Account control</Text>
          <Text style={styles.dangerTitle}>Delete account</Text>
          <Text style={styles.dangerSubtitle}>
            Permanently remove your CityPeak account. This action cannot be undone.
          </Text>
        </View>

        <Pressable style={styles.dangerDeleteButton} onPress={onDeleteAccount}>
          <Text style={styles.dangerDeleteText}>Delete</Text>
        </Pressable>
      </View>

      <View style={styles.legalActionCard}>
        <View style={styles.legalIconBox}>
          <Text style={styles.legalIconText}>✓</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.legalTitle}>Terms & Privacy</Text>
          <Text style={styles.legalSubtitle}>
            Read how CityPeak works and how your data is handled.
          </Text>
        </View>

        <View style={styles.legalButtonColumn}>
          <Pressable
            style={styles.legalPillButton}
            onPress={() => setLegalModal("terms")}
          >
            <Text style={styles.legalPillText}>Terms ›</Text>
          </Pressable>

          <Pressable
            style={styles.legalPillButton}
            onPress={() => setLegalModal("privacy")}
          >
            <Text style={styles.legalPillText}>Privacy ›</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.legalFootnote}>
        CityPeak is built for local community sharing. Please report unsafe posts
        and use privacy settings thoughtfully.
      </Text>

      <Modal visible={!!legalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{legalTitle}</Text>
              <Pressable onPress={() => setLegalModal(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
              {legalBody.map((paragraph) => (
                <Text key={paragraph} style={styles.legalModalText}>
                  {paragraph}
                </Text>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={!!editingPost} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Post</Text>
              <Pressable onPress={() => setEditingPost(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
              <Text style={styles.smallTitle}>Post text</Text>
              <TextInput
                style={styles.profileBioInput}
                value={editText}
                onChangeText={setEditText}
                placeholder="Update your post..."
                placeholderTextColor="#94A3B8"
                multiline
              />

              {editingPost?.postType === "sale" && (
                <>
                  <Text style={styles.smallTitle}>Sale details</Text>
                  <TextInput
                    style={styles.input}
                    value={editSaleTitle}
                    onChangeText={setEditSaleTitle}
                    placeholder="Item name"
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    style={styles.input}
                    value={editSalePrice}
                    onChangeText={setEditSalePrice}
                    placeholder="Price"
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    style={styles.input}
                    value={editSaleCondition}
                    onChangeText={setEditSaleCondition}
                    placeholder="Condition or pickup notes"
                    placeholderTextColor="#94A3B8"
                  />
                </>
              )}

              <Text style={styles.smallTitle}>Tags</Text>
              <TextInput
                style={styles.input}
                value={editTagsText}
                onChangeText={setEditTagsText}
                placeholder="housing, weekend, urgent"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />

              <Text style={styles.smallTitle}>Expiration</Text>
              <TextInput
                style={styles.input}
                value={editExpiresAt}
                onChangeText={setEditExpiresAt}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
                keyboardType="numbers-and-punctuation"
              />

              <Pressable style={styles.primaryButton} onPress={saveEditedPost}>
                <Text style={styles.primaryButtonText}>Save Post</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
