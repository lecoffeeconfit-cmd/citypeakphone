import React, { useState } from "react";
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { styles } from "../styles";

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
  };
  onSaveProfile: (username: string, bio: string, imageUri?: string) => void;
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
 onSaveProfile,
onLogout,
onDeleteAccount,
}: ProfileScreenProps) {
  const [localImageUri, setLocalImageUri] = useState<string | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

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

  const displayPhoto = localImageUri || photoUrl;
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
          {displayPhoto ? (
            <Image source={{ uri: displayPhoto }} style={styles.profilePhoto} />
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
      </View>

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
    </ScrollView>
  );
}
