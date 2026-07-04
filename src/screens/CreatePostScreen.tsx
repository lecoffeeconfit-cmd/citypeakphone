import React, { useState } from "react";
import { Image, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import { styles } from "../styles";
import type { MediaKind, MediaType, PollDraft, PostCategory } from "../types";
import { postCategories } from "../types";

const REGULAR_VIDEO_MAX_SECONDS = 60;
const TUTORIAL_VIDEO_MAX_SECONDS = 10 * 60;
const REGULAR_VIDEO_MAX_BYTES = 80 * 1024 * 1024;
const TUTORIAL_VIDEO_MAX_BYTES = 250 * 1024 * 1024;

type CreatePostScreenProps = {
  addPost: (
    text: string,
    anonymous: boolean,
    mediaUri?: string,
    mediaType?: MediaType,
    category?: PostCategory,
    poll?: PollDraft,
    mediaKind?: MediaKind,
    mediaDurationMs?: number,
    mediaSizeBytes?: number
  ) => Promise<void>;
  selectedArea: string;
};

function formatDuration(ms?: number | null) {
  if (!ms) return "unknown length";

  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) return `${seconds}s`;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatBytes(bytes?: number) {
  if (!bytes) return "unknown size";

  const megabytes = bytes / (1024 * 1024);

  return `${megabytes.toFixed(megabytes >= 100 ? 0 : 1)} MB`;
}

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
  const [mediaKind, setMediaKind] = useState<MediaKind>("post");
  const [mediaDurationMs, setMediaDurationMs] = useState<number | undefined>();
  const [mediaSizeBytes, setMediaSizeBytes] = useState<number | undefined>();
  const [category, setCategory] = useState<PostCategory | undefined>();
  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [uploading, setUploading] = useState(false);

  async function pickMedia() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission to access photos and videos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.72,
      videoMaxDuration:
        mediaKind === "tutorial"
          ? TUTORIAL_VIDEO_MAX_SECONDS
          : REGULAR_VIDEO_MAX_SECONDS,
      videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const selectedMediaType = asset.type === "video" ? "video" : "image";
      const videoDurationSeconds = (asset.duration ?? 0) / 1000;
      const maxDurationSeconds =
        mediaKind === "tutorial"
          ? TUTORIAL_VIDEO_MAX_SECONDS
          : REGULAR_VIDEO_MAX_SECONDS;
      const maxBytes =
        mediaKind === "tutorial"
          ? TUTORIAL_VIDEO_MAX_BYTES
          : REGULAR_VIDEO_MAX_BYTES;

      if (selectedMediaType === "video") {
        if (asset.duration && videoDurationSeconds > maxDurationSeconds) {
          alert(
            mediaKind === "tutorial"
              ? "Tutorial videos can be up to 10 minutes."
              : "Regular post videos can be up to 60 seconds. Switch to Tutorial for longer videos."
          );
          return;
        }

        if (asset.fileSize && asset.fileSize > maxBytes) {
          alert(
            `This video is ${formatBytes(asset.fileSize)}. ${
              mediaKind === "tutorial" ? "Tutorial" : "Regular"
            } videos must be ${formatBytes(maxBytes)} or less to keep CityPeak fast.`
          );
          return;
        }
      }

      setMediaUri(asset.uri);
      setMediaType(selectedMediaType);
      setMediaDurationMs(asset.duration ?? undefined);
      setMediaSizeBytes(asset.fileSize ?? undefined);
    }
  }

  function resetMedia() {
    setMediaUri(undefined);
    setMediaType(undefined);
    setMediaDurationMs(undefined);
    setMediaSizeBytes(undefined);
  }

  async function handlePublish() {
    if (uploading) return;

    if (!category) {
      alert("Please choose a category.");
      return;
    }

    const cleanedPollOptions = pollOptions
      .map((option) => option.trim())
      .filter(Boolean);
    const pollDraft =
      pollEnabled && pollQuestion.trim() && cleanedPollOptions.length >= 2
        ? {
            question: pollQuestion.trim(),
            options: cleanedPollOptions,
          }
        : undefined;

    if (pollEnabled && !pollDraft) {
      alert("Add a poll question and at least two options.");
      return;
    }

    if (!text.trim() && !mediaUri && !pollDraft) {
      alert("Add text, a photo, a video, or a poll first.");
      return;
    }

    try {
      setUploading(true);

      const postText = text.trim();
      const postMediaUri = mediaUri;
      const postMediaType = mediaType;
      const postAnonymous = anonymous;
      const postCategory = category;
      const postPoll = pollDraft;
      const postMediaKind = mediaType === "video" ? mediaKind : "post";
      const postMediaDurationMs = mediaType === "video" ? mediaDurationMs : undefined;
      const postMediaSizeBytes = mediaSizeBytes;

      setText("");
      setMediaUri(undefined);
      setMediaType(undefined);
      setMediaKind("post");
      setMediaDurationMs(undefined);
      setMediaSizeBytes(undefined);
      setAnonymous(true);
      setCategory(undefined);
      setPollEnabled(false);
      setPollQuestion("");
      setPollOptions(["", ""]);

      await addPost(
        postText,
        postAnonymous,
        postMediaUri,
        postMediaType,
        postCategory,
        postPoll,
        postMediaKind,
        postMediaDurationMs,
        postMediaSizeBytes
      );
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
        autoCorrect={true}
        spellCheck={true}
        autoCapitalize="sentences"
        keyboardType="default"
      />

      <View style={styles.mediaModeCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pollComposerTitle}>Video length</Text>
          <Text style={styles.switchHelp}>
            Tutorials allow longer videos but still upload with size limits.
          </Text>
        </View>

        <View style={styles.mediaModeSegment}>
          {(["post", "tutorial"] as MediaKind[]).map((kind) => {
            const active = mediaKind === kind;

            return (
              <Pressable
                key={kind}
                onPress={() => setMediaKind(kind)}
                disabled={uploading || !!mediaUri}
                style={[
                  styles.mediaModeButton,
                  active && styles.mediaModeButtonActive,
                  mediaUri && !active && { opacity: 0.45 },
                ]}
              >
                <Text
                  style={[
                    styles.mediaModeText,
                    active && styles.mediaModeTextActive,
                  ]}
                >
                  {kind === "tutorial" ? "Tutorial" : "Post"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        style={styles.secondaryButton}
        onPress={pickMedia}
        disabled={uploading}
      >
        <Text style={styles.secondaryButtonText}>
          {mediaUri
            ? "Change Photo / Video"
            : mediaKind === "tutorial"
              ? "Add Tutorial Video / Photo"
              : "Add Photo / Video"}
        </Text>
      </Pressable>

      <View style={styles.pollComposerCard}>
        <View style={styles.pollComposerHeader}>
          <View>
            <Text style={styles.pollComposerTitle}>Create a poll</Text>
            <Text style={styles.switchHelp}>Ask neighbors to pick one option.</Text>
          </View>
          <Switch
            value={pollEnabled}
            onValueChange={setPollEnabled}
            disabled={uploading}
          />
        </View>

        {pollEnabled && (
          <View style={{ marginTop: 14, gap: 10 }}>
            <TextInput
              style={styles.pollInput}
              placeholder="Poll question"
              placeholderTextColor="#64748B"
              value={pollQuestion}
              onChangeText={setPollQuestion}
              editable={!uploading}
            />

            {pollOptions.map((option, index) => (
              <TextInput
                key={index}
                style={styles.pollInput}
                placeholder={`Option ${index + 1}`}
                placeholderTextColor="#64748B"
                value={option}
                onChangeText={(value) => {
                  setPollOptions((currentOptions) =>
                    currentOptions.map((currentOption, optionIndex) =>
                      optionIndex === index ? value : currentOption
                    )
                  );
                }}
                editable={!uploading}
              />
            ))}

            <View style={{ flexDirection: "row", gap: 10 }}>
              {pollOptions.length < 4 && (
                <Pressable
                  style={[styles.secondaryButton, { flex: 1, marginTop: 0 }]}
                  onPress={() => setPollOptions((options) => [...options, ""])}
                  disabled={uploading}
                >
                  <Text style={styles.secondaryButtonText}>Add option</Text>
                </Pressable>
              )}

              {pollOptions.length > 2 && (
                <Pressable
                  style={[styles.secondaryButton, { flex: 1, marginTop: 0 }]}
                  onPress={() =>
                    setPollOptions((options) => options.slice(0, options.length - 1))
                  }
                  disabled={uploading}
                >
                  <Text style={styles.secondaryButtonText}>Remove</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </View>

      {mediaUri && mediaType === "image" && (
        <Image source={{ uri: mediaUri }} style={styles.previewImage} />
      )}

      {mediaUri && mediaType === "video" && <VideoPreview uri={mediaUri} />}

      {mediaUri && mediaType === "video" && (
        <View style={styles.mediaInfoCard}>
          <Text style={styles.mediaInfoTitle}>
            {mediaKind === "tutorial" ? "Tutorial video" : "Post video"}
          </Text>
          <Text style={styles.mediaInfoText}>
            {formatDuration(mediaDurationMs)} · {formatBytes(mediaSizeBytes)} · loads only after tap in feed
          </Text>
        </View>
      )}

      {mediaUri && (
        <Pressable
          style={[styles.secondaryButton, { marginTop: 10 }]}
          onPress={() => {
            resetMedia();
          }}
          disabled={uploading}
        >
          <Text style={styles.secondaryButtonText}>
            Remove Photo / Video
          </Text>
        </Pressable>
      )}

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
