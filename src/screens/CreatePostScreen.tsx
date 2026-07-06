import React, { useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import { styles } from "../styles";
import type { MediaKind, MediaType, PollDraft, PostCategory, PostFields, PostType } from "../types";
import { postCategories } from "../types";
import { getExpirationTimestamp, shouldSuggestExpiration } from "../utils/expiration";
import { postTypeOptions } from "../utils/postTypes";

const REGULAR_VIDEO_MAX_SECONDS = 60;
const TUTORIAL_VIDEO_MAX_SECONDS = 10 * 60;
const REGULAR_VIDEO_MAX_BYTES = 80 * 1024 * 1024;
const TUTORIAL_VIDEO_MAX_BYTES = 250 * 1024 * 1024;

type CreatePostScreenProps = {
  addPost: (
    text: string,
    mediaUri?: string,
    mediaType?: MediaType,
    category?: PostCategory,
    poll?: PollDraft,
    mediaKind?: MediaKind,
    mediaDurationMs?: number,
    mediaSizeBytes?: number,
    postType?: PostType,
    saleTitle?: string,
    salePrice?: string,
    saleCondition?: string,
    expiresAt?: string,
    tags?: string[],
    postFields?: PostFields
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
  const [postType, setPostType] = useState<PostType>("standard");
  const [mediaUri, setMediaUri] = useState<string | undefined>();
  const [mediaType, setMediaType] = useState<MediaType | undefined>();
  const [mediaKind, setMediaKind] = useState<MediaKind>("post");
  const [mediaDurationMs, setMediaDurationMs] = useState<number | undefined>();
  const [mediaSizeBytes, setMediaSizeBytes] = useState<number | undefined>();
  const [category, setCategory] = useState<PostCategory | undefined>();
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [saleTitle, setSaleTitle] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleCondition, setSaleCondition] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [postFields, setPostFields] = useState<PostFields>({});
  const [uploading, setUploading] = useState(false);

  const fieldConfigs: Partial<Record<PostType, { key: string; label: string; placeholder?: string }[]>> = {
    announcement: [
      { key: "title", label: "Title" },
      { key: "description", label: "Description" },
      { key: "priority", label: "Priority", placeholder: "Low, Medium, High" },
      { key: "attachments", label: "Attachments", placeholder: "Link or note" },
    ],
    question: [
      { key: "question", label: "Question" },
      { key: "details", label: "Details" },
      { key: "solvedStatus", label: "Solved status", placeholder: "Open" },
      { key: "bestAnswer", label: "Best answer", placeholder: "Add later if solved" },
    ],
    recommendation: [
      { key: "name", label: "Name" },
      { key: "recommendationCategory", label: "Category" },
      { key: "rating", label: "Rating (1-5)" },
      { key: "whyRecommend", label: "Why recommend" },
      { key: "priceRange", label: "Price range", placeholder: "$, $$, $$$" },
    ],
    hiddenGem: [
      { key: "name", label: "Name" },
      { key: "gemLocation", label: "Location" },
      { key: "description", label: "Description" },
      { key: "whySpecial", label: "Why it's special" },
      { key: "map", label: "Map", placeholder: "Map link or directions" },
    ],
    foodReview: [
      { key: "restaurantName", label: "Restaurant name" },
      { key: "cuisine", label: "Cuisine" },
      { key: "rating", label: "Rating" },
      { key: "priceRange", label: "Price range" },
      { key: "favoriteItem", label: "Favorite item" },
      { key: "review", label: "Review" },
    ],
    alert: [
      { key: "alertType", label: "Alert type" },
      { key: "severity", label: "Severity", placeholder: "Low, Medium, High" },
      { key: "description", label: "Description" },
      { key: "alertLocation", label: "Location" },
      { key: "status", label: "Status", placeholder: "Active or Resolved" },
    ],
    event: [
      { key: "eventName", label: "Event name" },
      { key: "description", label: "Description" },
      { key: "date", label: "Date" },
      { key: "time", label: "Time" },
      { key: "eventLocation", label: "Location" },
      { key: "cost", label: "Cost" },
      { key: "website", label: "Website" },
      { key: "rsvpCount", label: "RSVP count" },
    ],
    job: [
      { key: "company", label: "Company" },
      { key: "position", label: "Position" },
      { key: "pay", label: "Pay" },
      { key: "employmentType", label: "Employment type" },
      { key: "jobLocation", label: "Location" },
      { key: "requirements", label: "Requirements" },
      { key: "applyLink", label: "Apply link" },
    ],
    volunteer: [
      { key: "organization", label: "Organization" },
      { key: "opportunity", label: "Opportunity" },
      { key: "date", label: "Date" },
      { key: "time", label: "Time" },
      { key: "volunteerLocation", label: "Location" },
      { key: "skillsNeeded", label: "Skills needed" },
      { key: "spotsAvailable", label: "Spots available" },
    ],
  };

  function updatePostField(key: string, value: string) {
    setPostFields((currentFields) => ({
      ...currentFields,
      [key]: value,
    }));
  }

  function getDefaultCategoryForPostType(nextPostType: PostType): PostCategory | undefined {
    if (nextPostType === "announcement" || nextPostType === "alert") return "Alerts";
    if (nextPostType === "recommendation") return "Places";
    if (nextPostType === "hiddenGem") return "Places";
    if (nextPostType === "foodReview") return "Food";
    if (nextPostType === "event") return "Events";
    if (nextPostType === "job") return "Careers & Jobs";
    if (nextPostType === "volunteer") return "Social";
    return undefined;
  }

  function getCleanPostFields() {
    return Object.fromEntries(
      Object.entries(postFields)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => value)
    ) as PostFields;
  }

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
    const isPollPost = postType === "poll";
    const isSalePost = postType === "sale";
    const pollDraft =
      isPollPost && pollQuestion.trim() && cleanedPollOptions.length >= 2
        ? {
            question: pollQuestion.trim(),
            options: cleanedPollOptions,
          }
        : undefined;

    if (isPollPost && !pollDraft) {
      alert("Add a poll question and at least two options.");
      return;
    }

    if (isSalePost && (!saleTitle.trim() || !salePrice.trim())) {
      alert("Add an item name and price for your sale post.");
      return;
    }

    if (expiresAt.trim() && !getExpirationTimestamp(expiresAt.trim())) {
      alert("Use an expiration date like 2026-07-31.");
      return;
    }

    if (!text.trim() && !mediaUri && !pollDraft && !isSalePost) {
      alert("Add text, a photo, a video, or a poll first.");
      return;
    }

    try {
      setUploading(true);

      const postText = text.trim();
      const postMediaUri = mediaUri;
      const postMediaType = mediaType;
      const postCategory = category;
      const postPoll = pollDraft;
      const postMediaKind = mediaType === "video" ? mediaKind : "post";
      const postMediaDurationMs = mediaType === "video" ? mediaDurationMs : undefined;
      const postMediaSizeBytes = mediaSizeBytes;
      const nextPostType = postType;
      const postSaleTitle = saleTitle.trim();
      const postSalePrice = salePrice.trim();
      const postSaleCondition = saleCondition.trim();
      const postExpiresAt = expiresAt.trim();
      const postTags = tagsText
        .split(",")
        .map((tag) => tag.trim().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 5);
      const cleanPostFields = getCleanPostFields();

      setText("");
      setPostType("standard");
      setMediaUri(undefined);
      setMediaType(undefined);
      setMediaKind("post");
      setMediaDurationMs(undefined);
      setMediaSizeBytes(undefined);
      setCategory(undefined);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setSaleTitle("");
      setSalePrice("");
      setSaleCondition("");
      setExpiresAt("");
      setTagsText("");
      setPostFields({});

      await addPost(
        postText,
        postMediaUri,
        postMediaType,
        postCategory,
        postPoll,
        postMediaKind,
        postMediaDurationMs,
        postMediaSizeBytes,
        nextPostType,
        postSaleTitle,
        postSalePrice,
        postSaleCondition,
        postExpiresAt,
        postTags,
        cleanPostFields
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

      <Text style={styles.smallTitle}>Post Type</Text>

      <View style={styles.postTypeGrid}>
        {postTypeOptions.map((item) => {
          const active = postType === item.key;

          return (
            <Pressable
              key={item.key}
              onPress={() => {
                setPostType(item.key);
                setPostFields({});
                const nextCategory = getDefaultCategoryForPostType(item.key);

                if (nextCategory) {
                  setCategory(nextCategory);
                }
              }}
              disabled={uploading}
              style={[
                styles.postTypeButton,
                active && styles.postTypeButtonActive,
              ]}
            >
              <Text style={styles.postTypeEmoji}>{item.emoji}</Text>
              <Text
                style={[
                  styles.postTypeText,
                  active && styles.postTypeTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!!fieldConfigs[postType]?.length && (
        <View style={styles.pollComposerCard}>
          <Text style={styles.pollComposerTitle}>
            {postTypeOptions.find((option) => option.key === postType)?.emoji}{" "}
            {postTypeOptions.find((option) => option.key === postType)?.label} details
          </Text>
          <Text style={styles.switchHelp}>Fill in the details people expect for this post type.</Text>

          <View style={{ marginTop: 14, gap: 10 }}>
            {fieldConfigs[postType]?.map((field) => (
              <TextInput
                key={field.key}
                style={styles.pollInput}
                placeholder={field.placeholder || field.label}
                placeholderTextColor="#64748B"
                value={postFields[field.key] || ""}
                onChangeText={(value) => updatePostField(field.key, value)}
                editable={!uploading}
                multiline={["description", "details", "whyRecommend", "whySpecial", "review", "requirements"].includes(field.key)}
              />
            ))}
          </View>
        </View>
      )}

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

      <View style={styles.expirationCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pollComposerTitle}>Expiration date</Text>
          <Text style={styles.switchHelp}>
            {shouldSuggestExpiration(category, postType)
              ? "Best for alerts, jobs, sales, and events."
              : "Optional for time-sensitive local posts."}
          </Text>
        </View>

        <TextInput
          style={styles.expirationInput}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#64748B"
          value={expiresAt}
          onChangeText={setExpiresAt}
          editable={!uploading}
          keyboardType="numbers-and-punctuation"
        />
      </View>

      <View style={styles.tagComposerCard}>
        <Text style={styles.pollComposerTitle}>Tags</Text>
        <Text style={styles.switchHelp}>Add up to five tags separated by commas.</Text>
        <TextInput
          style={[styles.pollInput, { marginTop: 12 }]}
          placeholder="housing, weekend, urgent"
          placeholderTextColor="#64748B"
          value={tagsText}
          onChangeText={setTagsText}
          editable={!uploading}
          autoCapitalize="none"
        />
      </View>

      {postType === "sale" && (
        <View style={styles.pollComposerCard}>
          <Text style={styles.pollComposerTitle}>Sale details</Text>
          <Text style={styles.switchHelp}>Add item details for a local marketplace-style post.</Text>

          <View style={{ marginTop: 14, gap: 10 }}>
            <TextInput
              style={styles.pollInput}
              placeholder="Item name"
              placeholderTextColor="#64748B"
              value={saleTitle}
              onChangeText={setSaleTitle}
              editable={!uploading}
            />
            <TextInput
              style={styles.pollInput}
              placeholder="Price"
              placeholderTextColor="#64748B"
              value={salePrice}
              onChangeText={setSalePrice}
              editable={!uploading}
              keyboardType="default"
            />
            <TextInput
              style={styles.pollInput}
              placeholder="Condition, pickup notes, or extras"
              placeholderTextColor="#64748B"
              value={saleCondition}
              onChangeText={setSaleCondition}
              editable={!uploading}
            />
          </View>
        </View>
      )}

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

      {postType === "poll" && (
      <View style={styles.pollComposerCard}>
        <View style={styles.pollComposerHeader}>
          <View>
            <Text style={styles.pollComposerTitle}>Create a poll</Text>
            <Text style={styles.switchHelp}>Ask neighbors to pick one option.</Text>
          </View>
        </View>

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
      </View>
      )}

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
