import React, { useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { styles } from "../styles";

type ProfileScreenProps = {
  username: string;
  setUsername: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  photoUrl: string;
  onSaveProfile: (username: string, bio: string, imageUri?: string) => void;
  onLogout: () => void;
};

export function ProfileScreen({
  username,
  setUsername,
  bio,
  setBio,
    photoUrl,
  onSaveProfile,
  onLogout,
}: ProfileScreenProps) {
  const [localImageUri, setLocalImageUri] = useState<string | undefined>();

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
    }
  }

  const displayPhoto = localImageUri || photoUrl;

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

        <Text style={styles.muted}>Tap your photo to change it.</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>248</Text>
            <Text style={styles.statLabel}>Reactions</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Areas</Text>
          </View>
        </View>
      </View>

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

      <Pressable
        style={styles.primaryButton}
        onPress={() => onSaveProfile(username, bio, localImageUri)}
      >
        <Text style={styles.primaryButtonText}>Save Profile</Text>
      </Pressable>
            <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </Pressable>
      
    </ScrollView>
  );
}