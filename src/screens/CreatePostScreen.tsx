import React, { useState } from "react";
import {
  Image,
  KeyboardTypeOptions,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import { styles } from "../styles";
import type { MediaKind, MediaType, PollDraft, PostCategory, PostFields, PostType } from "../types";
import { postCategories } from "../types";
import { getExpirationTimestamp, shouldSuggestExpiration } from "../utils/expiration";
import { postTypeOptions } from "../utils/postTypes";

const REGULAR_VIDEO_MAX_SECONDS = 30;
const TUTORIAL_VIDEO_MAX_SECONDS = 10 * 60;
const REGULAR_VIDEO_MAX_BYTES = 40 * 1024 * 1024;
const TUTORIAL_VIDEO_MAX_BYTES = 120 * 1024 * 1024;
const IMAGE_SOURCE_MAX_BYTES = 25 * 1024 * 1024;
const IMAGE_SOURCE_TOTAL_MAX_BYTES = 60 * 1024 * 1024;
const MAX_POST_IMAGES = 5;
const LONG_TEXT_FIELD_KEYS = [
  "description",
  "details",
  "whyRecommend",
  "whySpecial",
  "review",
  "requirements",
] as const;

type PostFieldConfig = {
  key: string;
  label: string;
  placeholder: string;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
};

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
    postFields?: PostFields,
    imageUris?: string[]
  ) => Promise<boolean>;
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
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<MediaType | undefined>();
  const [mediaKind, setMediaKind] = useState<MediaKind>("post");
  const [mediaDurationMs, setMediaDurationMs] = useState<number | undefined>();
  const [mediaSizeBytes, setMediaSizeBytes] = useState<number | undefined>();
  const [category, setCategory] = useState<PostCategory | undefined>();
  const [includePoll, setIncludePoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [saleTitle, setSaleTitle] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleCondition, setSaleCondition] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [postFields, setPostFields] = useState<PostFields>({});
  const [uploading, setUploading] = useState(false);
  const wantsPoll = postType === "poll" || includePoll;

  const fieldConfigs: Partial<Record<PostType, PostFieldConfig[]>> = {
    announcement: [
      { key: "title", label: "Title", placeholder: "Road closure near Main St", maxLength: 80 },
      { key: "description", label: "Description", placeholder: "What changed, who it affects, and when it ends", maxLength: 360, multiline: true },
      { key: "priority", label: "Priority", placeholder: "Low, Medium, or High", maxLength: 20 },
      { key: "attachments", label: "Attachments", placeholder: "Link, phone number, or short note", maxLength: 120 },
    ],
    question: [
      { key: "question", label: "Question", placeholder: "Where can I find overnight parking downtown?", maxLength: 140 },
      { key: "details", label: "Details", placeholder: "Add neighborhood, timing, or what you already tried", maxLength: 360, multiline: true },
      { key: "solvedStatus", label: "Solved status", placeholder: "Open, answered, or still looking", maxLength: 28 },
      { key: "bestAnswer", label: "Best answer", placeholder: "Add later if solved", maxLength: 220 },
    ],
    recommendation: [
      { key: "name", label: "Name", placeholder: "Business, service, trail, or place", maxLength: 80 },
      { key: "recommendationCategory", label: "Category", placeholder: "Coffee, mechanic, park, barber...", maxLength: 40 },
      { key: "rating", label: "Rating (1-5)", placeholder: "4.5", maxLength: 3, keyboardType: "decimal-pad" },
      { key: "whyRecommend", label: "Why recommend", placeholder: "What makes it worth trying?", maxLength: 360, multiline: true },
      { key: "priceRange", label: "Price range", placeholder: "$, $$, $$$, or Free", maxLength: 12 },
    ],
    hiddenGem: [
      { key: "name", label: "Name", placeholder: "Quiet overlook, tiny shop, shortcut...", maxLength: 80 },
      { key: "gemLocation", label: "Location", placeholder: "Neighborhood, cross street, or landmark", maxLength: 100 },
      { key: "description", label: "Description", placeholder: "What people should expect", maxLength: 320, multiline: true },
      { key: "whySpecial", label: "Why it's special", placeholder: "The detail locals would care about", maxLength: 280, multiline: true },
      { key: "map", label: "Map", placeholder: "Map link or simple directions", maxLength: 160, keyboardType: "url" },
    ],
    foodReview: [
      { key: "restaurantName", label: "Restaurant name", placeholder: "Restaurant or food truck name", maxLength: 80 },
      { key: "cuisine", label: "Cuisine", placeholder: "Tacos, Thai, bakery, burgers...", maxLength: 40 },
      { key: "rating", label: "Rating", placeholder: "4.5", maxLength: 3, keyboardType: "decimal-pad" },
      { key: "priceRange", label: "Price range", placeholder: "$, $$, $$$", maxLength: 12 },
      { key: "favoriteItem", label: "Favorite item", placeholder: "The thing to order", maxLength: 80 },
      { key: "review", label: "Review", placeholder: "Taste, service, wait, parking, vibe", maxLength: 420, multiline: true },
    ],
    alert: [
      { key: "alertType", label: "Alert type", placeholder: "Traffic, safety, weather, lost item...", maxLength: 48 },
      { key: "severity", label: "Severity", placeholder: "Low, Medium, or High", maxLength: 20 },
      { key: "description", label: "Description", placeholder: "What is happening and what to avoid", maxLength: 360, multiline: true },
      { key: "alertLocation", label: "Location", placeholder: "Street, block, or nearby landmark", maxLength: 100 },
      { key: "status", label: "Status", placeholder: "Active, resolved, or update needed", maxLength: 32 },
    ],
    event: [
      { key: "eventName", label: "Event name", placeholder: "Night market, cleanup, meetup...", maxLength: 90 },
      { key: "description", label: "Description", placeholder: "What is happening and who should come", maxLength: 420, multiline: true },
      { key: "date", label: "Date", placeholder: "YYYY-MM-DD", maxLength: 10, keyboardType: "numbers-and-punctuation" },
      { key: "time", label: "Time", placeholder: "6:30 PM", maxLength: 18 },
      { key: "eventLocation", label: "Location", placeholder: "Venue, park, cross street, or online", maxLength: 100 },
      { key: "cost", label: "Cost", placeholder: "Free, $10, donation...", maxLength: 32 },
      { key: "website", label: "Website", placeholder: "https://...", maxLength: 160, keyboardType: "url" },
      { key: "rsvpCount", label: "RSVP count", placeholder: "20", maxLength: 6, keyboardType: "number-pad" },
    ],
    job: [
      { key: "company", label: "Company", placeholder: "Business or organization", maxLength: 80 },
      { key: "position", label: "Position", placeholder: "Barista, driver, designer...", maxLength: 80 },
      { key: "pay", label: "Pay", placeholder: "$22/hr, salary range, or DOE", maxLength: 40 },
      { key: "employmentType", label: "Employment type", placeholder: "Full-time, part-time, contract", maxLength: 40 },
      { key: "jobLocation", label: "Location", placeholder: "On-site, hybrid, remote, neighborhood", maxLength: 80 },
      { key: "requirements", label: "Requirements", placeholder: "Experience, schedule, license, or skills", maxLength: 420, multiline: true },
      { key: "applyLink", label: "Apply link", placeholder: "https://...", maxLength: 160, keyboardType: "url" },
    ],
    volunteer: [
      { key: "organization", label: "Organization", placeholder: "Group or organizer", maxLength: 80 },
      { key: "opportunity", label: "Opportunity", placeholder: "Food bank shift, cleanup, mentoring...", maxLength: 120 },
      { key: "date", label: "Date", placeholder: "YYYY-MM-DD", maxLength: 10, keyboardType: "numbers-and-punctuation" },
      { key: "time", label: "Time", placeholder: "9:00 AM - 12:00 PM", maxLength: 24 },
      { key: "volunteerLocation", label: "Location", placeholder: "Meetup spot or address", maxLength: 100 },
      { key: "skillsNeeded", label: "Skills needed", placeholder: "None, Spanish, lifting, tutoring...", maxLength: 160 },
      { key: "spotsAvailable", label: "Spots available", placeholder: "12", maxLength: 6, keyboardType: "number-pad" },
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
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync().catch(() => null);

    if (!permission?.granted) {
      alert("Permission to access photos and videos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      orderedSelection: true,
      selectionLimit: MAX_POST_IMAGES,
      quality: mediaKind === "tutorial" ? 0.68 : 0.56,
      videoMaxDuration:
        mediaKind === "tutorial"
          ? TUTORIAL_VIDEO_MAX_SECONDS
          : REGULAR_VIDEO_MAX_SECONDS,
      videoExportPreset:
        mediaKind === "tutorial"
          ? ImagePicker.VideoExportPreset.H264_960x540
          : ImagePicker.VideoExportPreset.H264_640x480,
      videoQuality:
        mediaKind === "tutorial"
          ? ImagePicker.UIImagePickerControllerQualityType.IFrame960x540
          : ImagePicker.UIImagePickerControllerQualityType.VGA640x480,
    }).catch(() => null);

    if (!result) {
      alert("Your photo library could not be opened. Please try again.");
      return;
    }

    if (!result.canceled) {
      const assets = result.assets.slice(0, MAX_POST_IMAGES);

      if (assets.length === 0) return;

      const hasVideo = assets.some((selectedAsset) => selectedAsset.type === "video");

      if (hasVideo && assets.length > 1) {
        alert("Choose one video, or choose up to five photos.");
        return;
      }

      const asset = assets[0];
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
              : "Normal videos can be up to 30 seconds. Switch to Tutorial for longer videos."
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
      } else {
        const oversizedImage = assets.find(
          (selectedAsset) =>
            selectedAsset.type !== "video" &&
            !!selectedAsset.fileSize &&
            selectedAsset.fileSize > IMAGE_SOURCE_MAX_BYTES
        );
        const selectedImageBytes = assets.reduce(
          (total, selectedAsset) =>
            total + (selectedAsset.type !== "video" ? selectedAsset.fileSize ?? 0 : 0),
          0
        );

        if (oversizedImage?.fileSize) {
          alert(
            `One photo is ${formatBytes(
              oversizedImage.fileSize
            )}. Choose photos under ${formatBytes(
              IMAGE_SOURCE_MAX_BYTES
            )}; CityPeak will compress them before upload.`
          );
          return;
        }

        if (selectedImageBytes > IMAGE_SOURCE_TOTAL_MAX_BYTES) {
          alert(
            `These photos are ${formatBytes(
              selectedImageBytes
            )} before compression. Choose fewer or smaller photos for this post.`
          );
          return;
        }
      }

      setMediaUri(asset.uri);
      setMediaType(selectedMediaType);
      setMediaDurationMs(asset.duration ?? undefined);
      setMediaSizeBytes(asset.fileSize ?? undefined);
      setImageUris(
        selectedMediaType === "image"
          ? assets
              .filter((selectedAsset) => selectedAsset.type !== "video")
              .map((selectedAsset) => selectedAsset.uri)
          : []
      );
    }
  }

  function resetMedia() {
    setMediaUri(undefined);
    setImageUris([]);
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
    const isSalePost = postType === "sale";
    const pollDraft =
      wantsPoll && pollQuestion.trim() && cleanedPollOptions.length >= 2
        ? {
            question: pollQuestion.trim(),
            options: cleanedPollOptions,
          }
        : undefined;

    if (wantsPoll && !pollDraft) {
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
      const postImageUris =
        mediaType === "image"
          ? imageUris.length
            ? imageUris
            : mediaUri
            ? [mediaUri]
            : []
          : [];
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

      const posted = await addPost(
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
        cleanPostFields,
        postImageUris
      );

      if (!posted) return;

      setText("");
      setPostType("standard");
      setMediaUri(undefined);
      setImageUris([]);
      setMediaType(undefined);
      setMediaKind("post");
      setMediaDurationMs(undefined);
      setMediaSizeBytes(undefined);
      setCategory(undefined);
      setIncludePoll(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setSaleTitle("");
      setSalePrice("");
      setSaleCondition("");
      setExpiresAt("");
      setTagsText("");
      setPostFields({});
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.postTypeGrid}
        style={styles.postTypeScroller}
      >
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
      </ScrollView>

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
                multiline={field.multiline || LONG_TEXT_FIELD_KEYS.includes(field.key as any)}
                maxLength={field.maxLength}
                keyboardType={field.keyboardType || "default"}
                autoCapitalize={field.keyboardType === "url" ? "none" : "sentences"}
              />
            ))}
          </View>
        </View>
      )}

      <View style={styles.pollComposerCard}>
        <View style={styles.pollComposerHeader}>
          <View>
            <Text style={styles.pollComposerTitle}>Poll</Text>
            <Text style={styles.switchHelp}>
              {postType === "poll"
                ? "Polls are required for the Poll post type."
                : "Add a poll to this post if you want people to vote."}
            </Text>
          </View>

          {postType !== "poll" ? (
            <Pressable
              style={[
                styles.pollToggleButton,
                includePoll && styles.pollToggleButtonActive,
              ]}
              onPress={() => setIncludePoll((current) => !current)}
              disabled={uploading}
            >
              <Text
                style={[
                  styles.pollToggleText,
                  includePoll && styles.pollToggleTextActive,
                ]}
              >
                {includePoll ? "Included" : "Add poll"}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.pollRequiredBadge}>
              <Text style={styles.pollRequiredBadgeText}>Required</Text>
            </View>
          )}
        </View>

        {wantsPoll && (
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
            Videos are compressed on pick, shown as thumbnails in the feed, and only load after a tap.
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

      <View style={styles.mediaLimitGrid}>
        <View style={styles.mediaLimitPill}>
          <Text style={styles.mediaLimitNumber}>30s</Text>
          <Text style={styles.mediaLimitLabel}>Normal video max</Text>
        </View>
        <View style={styles.mediaLimitPill}>
          <Text style={styles.mediaLimitNumber}>10m</Text>
          <Text style={styles.mediaLimitLabel}>Tutorial max</Text>
        </View>
      </View>

      <Pressable
        style={styles.secondaryButton}
        onPress={pickMedia}
        disabled={uploading}
      >
        <Text style={styles.secondaryButtonText}>
          {mediaUri
            ? mediaType === "image"
              ? "Change Photos"
              : "Change Video"
            : mediaKind === "tutorial"
              ? "Add Tutorial Video / Photo"
              : "Add Photos / Video"}
        </Text>
      </Pressable>

      {mediaType === "image" && imageUris.length > 0 && (
        <View style={styles.imagePreviewGrid}>
          {imageUris.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.imagePreviewTile}>
              <Image source={{ uri }} style={styles.imagePreviewThumb} />
              {imageUris.length > 1 && (
                <View style={styles.imagePreviewBadge}>
                  <Text style={styles.imagePreviewBadgeText}>{index + 1}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {mediaUri && mediaType === "video" && <VideoPreview uri={mediaUri} />}

      {mediaUri && mediaType === "video" && (
        <View style={styles.mediaInfoCard}>
          <Text style={styles.mediaInfoTitle}>
            {mediaKind === "tutorial" ? "Tutorial video" : "Post video"}
          </Text>
          <Text style={styles.mediaInfoText}>
            {formatDuration(mediaDurationMs)} · {formatBytes(mediaSizeBytes)} · compressed export · thumbnail required
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
            {mediaType === "image" && imageUris.length > 1
              ? "Remove Photos"
              : "Remove Photo / Video"}
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
