import React, { useState } from "react";
import { Image, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { styles } from "../styles";
import type { MediaType } from "../types";

type CreatePostScreenProps = {
  addPost: (
    text: string,
    anonymous: boolean,
    mediaUri?: string,
    mediaType?: MediaType
  ) => void;
  selectedArea: string;
};

export function CreatePostScreen({ addPost, selectedArea }: CreatePostScreenProps) {
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [mediaUri, setMediaUri] = useState<string | undefined>(undefined);
  const [mediaType, setMediaType] = useState<MediaType | undefined>(undefined);

  async function pickMedia() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission to access photos and videos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      setMediaUri(asset.uri);
      setMediaType(asset.type === "video" ? "video" : "image");
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 130 }}>
      <Text style={styles.screenTitle}>Create Post</Text>
      <Text style={styles.screenSubtext}>Posting to {selectedArea}</Text>

      <TextInput
        style={styles.textArea}
        placeholder="What's happening locally?"
        placeholderTextColor="#64748B"
        multiline
        value={text}
        onChangeText={setText}
      />

      <Pressable style={styles.secondaryButton} onPress={pickMedia}>
        <Text style={styles.secondaryButtonText}>
          {mediaUri ? "Change Photo / Video" : "Add Photo / Video"}
        </Text>
      </Pressable>

      {mediaUri && mediaType === "image" && (
        <Image source={{ uri: mediaUri }} style={styles.previewImage} />
      )}

      {mediaUri && mediaType === "video" && (
        <View style={styles.previewImage}>
          <Text style={{ color: "white", fontWeight: "900", textAlign: "center", marginTop: 95 }}>
            🎥 Video selected
          </Text>
        </View>
      )}

      <View style={styles.switchRow}>
        <View>
          <Text style={styles.switchLabel}>Post anonymously</Text>
          <Text style={styles.switchHelp}>Hide your username on this post.</Text>
        </View>
        <Switch value={anonymous} onValueChange={setAnonymous} />
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => {
          if (text.trim() || mediaUri) {
            addPost(text.trim(), anonymous, mediaUri, mediaType);
            setText("");
            setMediaUri(undefined);
            setMediaType(undefined);
            setAnonymous(true);
          }
        }}
      >
        <Text style={styles.primaryButtonText}>Publish</Text>
      </Pressable>
    </ScrollView>
  );
}