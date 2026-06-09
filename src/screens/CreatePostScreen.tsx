import React, { useState } from "react";
import { Image, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import { styles } from "../styles";
import type { MediaType, PostCategory } from "../types";
import { postCategories } from "../types";

type CreatePostScreenProps = {
  addPost: (
    text: string,
    anonymous: boolean,
    mediaUri?: string,
    mediaType?: MediaType,
    category?: PostCategory
  ) => Promise<void>;
  selectedArea: string;
};

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.previewImage}
      nativeControls
      allowsFullscreen
    />
  );
}

export function CreatePostScreen({ addPost, selectedArea }: CreatePostScreenProps) {
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [mediaUri, setMediaUri] = useState<string | undefined>();
  const [mediaType, setMediaType] = useState<MediaType | undefined>();
  const [category, setCategory] = useState<PostCategory | undefined>();
  const [uploading, setUploading] = useState(false);

  async function pickMedia() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission to access photos and videos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      setMediaUri(asset.uri);
      setMediaType(asset.type === "video" ? "video" : "image");
    }
  }

  async function handlePublish() {
    if (uploading) return;

    if (!category) {
      alert("Please choose a category.");
      return;
    }

    if (!text.trim() && !mediaUri) {
      alert("Add text, a photo, or a video first.");
      return;
    }

    try {
      setUploading(true);

      const postText = text.trim();
      const postMediaUri = mediaUri;
      const postMediaType = mediaType;
      const postAnonymous = anonymous;
      const postCategory = category;

      setText("");
      setMediaUri(undefined);
      setMediaType(undefined);
      setAnonymous(true);
      setCategory(undefined);

      await addPost(postText, postAnonymous, postMediaUri, postMediaType, postCategory);
    } catch (error: any) {
      alert(error.message || "Something went wrong while posting.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 130 }}>
      <Text style={styles.screenTitle}>Create Post</Text>
      <Text style={styles.screenSubtext}>Posting to {selectedArea}</Text>

      <Text style={styles.smallTitle}>Choose Category</Text>

      <View style={styles.chipWrap}>
        {postCategories.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.chip,
              category === item && {
                backgroundColor: "#2563EB",
                borderColor: "#60A5FA",
              },
            ]}
            onPress={() => setCategory(item)}
            disabled={uploading}
          >
            <Text
              style={[
                styles.chipText,
                category === item && { color: "white" },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={[styles.textArea, { marginTop: 18 }]}
        placeholder="What's happening locally?"
        placeholderTextColor="#64748B"
        multiline
        value={text}
        onChangeText={setText}
        editable={!uploading}
      />

      <Pressable
        style={styles.secondaryButton}
        onPress={pickMedia}
        disabled={uploading}
      >
        <Text style={styles.secondaryButtonText}>
          {mediaUri ? "Change Photo / Video" : "Add Photo / Video"}
        </Text>
      </Pressable>

      {mediaUri && mediaType === "image" && (
        <Image source={{ uri: mediaUri }} style={styles.previewImage} />
      )}

      {mediaUri && mediaType === "video" && <VideoPreview uri={mediaUri} />}

      {uploading && (
        <View style={styles.uploadingCard}>
          <Text style={styles.uploadingText}>
            {mediaType === "video" ? "Uploading video..." : "Uploading post..."}
          </Text>
          <Text style={styles.uploadingSubtext}>
            Keep the app open while this finishes.
          </Text>
        </View>
      )}

      <View style={styles.switchRow}>
        <View>
          <Text style={styles.switchLabel}>Post anonymously</Text>
          <Text style={styles.switchHelp}>Hide your username on this post.</Text>
        </View>

        <Switch value={anonymous} onValueChange={setAnonymous} disabled={uploading} />
      </View>

      <Pressable
        style={[styles.primaryButton, uploading && { opacity: 0.6 }]}
        onPress={handlePublish}
        disabled={uploading}
      >
        <Text style={styles.primaryButtonText}>
          {uploading ? "Uploading..." : "Publish"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}