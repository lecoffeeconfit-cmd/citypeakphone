import "./global.css";
import { Platform, Share } from "react-native";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as VideoThumbnails from "expo-video-thumbnails";
import { decode } from "base64-arraybuffer";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native"; import { User, onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  limit,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import { supabase } from "./supabase";

import { BottomNav } from "./src/components/BottomNav";
import { CityBackdrop } from "./src/components/CityBackdrop";
import { PostDetailsModal } from "./src/components/PostDetailsModal";
import { AuthScreen } from "./src/screens/AuthScreen";
import { CreatePostScreen } from "./src/screens/CreatePostScreen";
import { FeedScreen } from "./src/screens/FeedScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { MessagesScreen } from "./src/screens/MessagesScreen";

import { styles } from "./src/styles";
import type {
  Comment,
  MediaType,
  MediaKind,
  Post,
  PostCategory,
  PostFields,
  PostType,
  PollDraft,
  ReactionKey,
  Tab,
  Coordinates,
} from "./src/types";
import { devLog, getStableImageSource, normalizeMediaUri } from "./src/utils/media";
import { countUsage } from "./src/utils/usageAudit";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://71ac6592333e6561f5d9864137d9f0bd@o4511657628008448.ingest.us.sentry.io/4511713519206400',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: false,

  // Enable Logs
  enableLogs: false,

  
  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});


type PublicUserProfile = {
  uid: string;
  username: string;
  email?: string;
  bio?: string;
  photoUrl?: string;
  followerCount?: number;
  followingCount?: number;
  followers?: string[];
  following?: string[];
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
};

type FollowUserSummary = {
  uid: string;
  username: string;
  photoUrl?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
};

type NotificationPreferences = {
  messages: boolean;
  comments: boolean;
  follows: boolean;
  localAlerts: boolean;
};

const defaultNotificationPreferences: NotificationPreferences = {
  messages: true,
  comments: true,
  follows: true,
  localAlerts: true,
};

const onboardingAreas = ["Long Beach", "Los Angeles", "Irvine", "Pasadena"];
const onboardingInterests = [
  "Alerts",
  "Food",
  "Events",
  "Jobs",
  "Deals",
  "Questions",
  "Hidden Gems",
  "Recommendations",
];

type UserProfileTarget = {
  uid?: string;
  username?: string;
  author?: string;
  photoUrl?: string;
};

const REGULAR_VIDEO_MAX_MS = 30 * 1000;
const TUTORIAL_VIDEO_MAX_MS = 10 * 60 * 1000;
const REGULAR_VIDEO_MAX_BYTES = 40 * 1024 * 1024;
const TUTORIAL_VIDEO_MAX_BYTES = 120 * 1024 * 1024;
const FULL_IMAGE_MAX_BYTES = 1400 * 1024;
const THUMBNAIL_IMAGE_MAX_BYTES = 250 * 1024;
const PROFILE_IMAGE_MAX_BYTES = 180 * 1024;

function showActionFailure(context: string, error: unknown, message: string) {
  devLog(`[${context}] action failed`, error);
  alert(message);
}

type ImageUploadOptions = {
  width?: number;
  compress?: number;
  maxBytes?: number;
  skipProcessing?: boolean;
};

function estimateDataUriBytes(uri: string) {
  const [, payload = ""] = uri.split(",");

  if (!payload) return null;

  return Math.ceil((payload.length * 3) / 4);
}

function getPostStats(userPosts: Post[]) {
  const totalReactions = userPosts.reduce((total, post) => {
    return (
      total +
      Object.values(post.reactions ?? {}).reduce(
        (reactionTotal, count) => reactionTotal + (count ?? 0),
        0
      )
    );
  }, 0);
  const totalComments = userPosts.reduce(
    (total, post) => total + (post.comments?.length ?? 0),
    0
  );
  const pollPosts = userPosts.filter((post) => !!post.poll);
  const pollVotes = pollPosts.reduce((total, post) => {
    return (
      total +
      (post.poll?.options.reduce(
        (optionTotal, option) => optionTotal + (option.votes ?? 0),
        0
      ) ?? 0)
    );
  }, 0);
  const areas = new Set(
    userPosts
      .map((post) => post.location)
      .filter((location): location is string => !!location)
  );
  const engagement = userPosts.reduce(
    (totals, post) => ({
      views: totals.views + (post.engagement?.views ?? 0),
      saves: totals.saves + (post.engagement?.saves ?? 0),
      shares: totals.shares + (post.engagement?.shares ?? 0),
    }),
    { views: 0, saves: 0, shares: 0 }
  );

  return {
    posts: userPosts.length,
    reactions: totalReactions,
    comments: totalComments,
    polls: pollPosts.length,
    pollVotes,
    areas: areas.size,
    ...engagement,
  };
}

function emptyStats() {
  return {
    posts: 0,
    reactions: 0,
    comments: 0,
    polls: 0,
    pollVotes: 0,
    areas: 0,
    views: 0,
    saves: 0,
    shares: 0,
  };
}

function OnboardingScreen({
  initialArea,
  notificationPreferences,
  onComplete,
  onEnableNotifications,
}: {
  initialArea: string;
  notificationPreferences: NotificationPreferences;
  onComplete: (settings: {
    area: string;
    interests: string[];
    notificationPreferences: NotificationPreferences;
  }) => Promise<void>;
  onEnableNotifications: (
    preferences: NotificationPreferences
  ) => Promise<boolean>;
}) {
  const [step, setStep] = useState(0);
  const [area, setArea] = useState(initialArea || "Long Beach");
  const [customArea, setCustomArea] = useState("");
  const [interests, setInterests] = useState<string[]>(["Alerts", "Events"]);
  const [prefs, setPrefs] = useState<NotificationPreferences>(
    notificationPreferences
  );
  const [saving, setSaving] = useState(false);

  const chosenArea = customArea.trim() || area;

  function toggleInterest(interest: string) {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  }

  function togglePreference(key: keyof NotificationPreferences) {
    setPrefs((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  async function finish(shouldRequestNotifications: boolean) {
    if (saving) return;

    try {
      setSaving(true);
      let finalPrefs = prefs;

      if (shouldRequestNotifications) {
        const enabled = await onEnableNotifications(prefs);
        finalPrefs = {
          ...prefs,
          messages: enabled && prefs.messages,
          comments: enabled && prefs.comments,
          follows: enabled && prefs.follows,
          localAlerts: enabled && prefs.localAlerts,
        };
        setPrefs(finalPrefs);
      }

      await onComplete({
        area: chosenArea,
        interests,
        notificationPreferences: finalPrefs,
      });
    } catch (error) {
      showActionFailure("onboarding", error, "Your setup could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <CityBackdrop />
      <ScrollView
        style={styles.authScreen}
        contentContainerStyle={styles.onboardingContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.onboardingCard}>
          <View style={styles.onboardingStepRow}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.onboardingStepBadge,
                  index === step && styles.onboardingStepBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.onboardingStepBadgeText,
                    index === step && styles.onboardingStepBadgeTextActive,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.onboardingKicker}>Welcome to CityPeak</Text>
          <Text style={styles.onboardingTitle}>
            {step === 0
              ? "Start with your city"
              : step === 1
              ? "Shape your local feed"
              : "Choose useful notifications"}
          </Text>
          <Text style={styles.onboardingBody}>
            {step === 0
              ? "Pick the area you want CityPeak to open first. You can always change it later."
              : step === 1
              ? "Choose a few topics so your first feed feels relevant instead of empty."
              : "Turn on the alerts that matter. You can change these anytime from your profile."}
          </Text>

          {step === 0 && (
            <>
              <View style={styles.onboardingChipGrid}>
                {onboardingAreas.map((item) => {
                  const active = area === item && !customArea.trim();

                  return (
                    <Pressable
                      key={item}
                      style={[
                        styles.onboardingChoice,
                        active && styles.onboardingChoiceActive,
                      ]}
                      onPress={() => {
                        setArea(item);
                        setCustomArea("");
                      }}
                    >
                      <Text
                        style={[
                          styles.onboardingChoiceText,
                          active && styles.onboardingChoiceTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <TextInput
                style={[styles.authInput, { marginTop: 14 }]}
                placeholder="Or type your city"
                placeholderTextColor="#64748B"
                value={customArea}
                onChangeText={setCustomArea}
              />
            </>
          )}

          {step === 1 && (
            <View style={styles.onboardingChipGrid}>
              {onboardingInterests.map((interest) => {
                const active = interests.includes(interest);

                return (
                  <Pressable
                    key={interest}
                    style={[
                      styles.onboardingChoice,
                      active && styles.onboardingChoiceActive,
                    ]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text
                      style={[
                        styles.onboardingChoiceText,
                        active && styles.onboardingChoiceTextActive,
                      ]}
                    >
                      {interest}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {step === 2 && (
            <View style={styles.notificationPreferenceCard}>
              {(
                [
                  ["messages", "Messages", "Replies from neighbors and direct chats"],
                  ["comments", "Comments", "Replies and activity on your posts"],
                  ["follows", "Follows", "New followers and profile activity"],
                  ["localAlerts", "Local alerts", "Important nearby updates"],
                ] as [keyof NotificationPreferences, string, string][]
              ).map(([key, label, helper]) => (
                <Pressable
                  key={key}
                  style={styles.notificationPreferenceRow}
                  onPress={() => togglePreference(key)}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.notificationPreferenceTitle}>{label}</Text>
                    <Text style={styles.notificationPreferenceHelp}>{helper}</Text>
                  </View>
                  <View
                    style={[
                      styles.notificationToggle,
                      prefs[key] && styles.notificationToggleActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.notificationToggleText,
                        prefs[key] && styles.notificationToggleTextActive,
                      ]}
                    >
                      {prefs[key] ? "On" : "Off"}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.onboardingButtonRow}>
            {step > 0 && (
              <Pressable
                style={styles.onboardingSecondaryButton}
                onPress={() => setStep((current) => current - 1)}
                disabled={saving}
              >
                <Text style={styles.onboardingSecondaryText}>Back</Text>
              </Pressable>
            )}

            {step < 2 ? (
              <Pressable
                style={styles.onboardingPrimaryButton}
                onPress={() => setStep((current) => current + 1)}
                disabled={saving}
              >
                <Text style={styles.onboardingPrimaryText}>Continue</Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  style={styles.onboardingSecondaryButton}
                  onPress={() => finish(false)}
                  disabled={saving}
                >
                  <Text style={styles.onboardingSecondaryText}>Maybe later</Text>
                </Pressable>
                <Pressable
                  style={styles.onboardingPrimaryButton}
                  onPress={() => finish(true)}
                  disabled={saving}
                >
                  <Text style={styles.onboardingPrimaryText}>
                    {saving ? "Saving..." : "Turn on"}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PublicUserProfileModal({
  profile,
  currentUserId,
  isFollowing,
  followBusy,
  isBlocked,
  blockBusy,
  onClose,
  onMessage,
  onToggleFollow,
  onToggleBlock,
}: {
  profile: PublicUserProfile | null;
  currentUserId?: string;
  isFollowing: boolean;
  followBusy: boolean;
  isBlocked: boolean;
  blockBusy: boolean;
  onClose: () => void;
  onMessage: (profile: PublicUserProfile) => void;
  onToggleFollow: (profile: PublicUserProfile) => void;
  onToggleBlock: (profile: PublicUserProfile) => void;
}) {
  if (!profile) return null;

  const displayPhotoSource = getStableImageSource(profile.photoUrl, "public profile photo");
  const isSelf = currentUserId === profile.uid;

  return (
    <Modal visible={!!profile} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Profile</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <View style={styles.profileCard}>
              {displayPhotoSource ? (
                <Image
                  source={displayPhotoSource}
                  style={styles.profilePhoto}
                  onError={() => devLog("[media] public profile photo failed", profile.photoUrl)}
                />
              ) : (
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>
                    {profile.username[0]?.toUpperCase() || "?"}
                  </Text>
                </View>
              )}

              <Text style={styles.profileName}>@{profile.username || "user"}</Text>

              <View style={styles.followSummaryRow}>
                <View style={styles.followSummaryCard}>
                  <Text style={styles.followSummaryNumber}>
                    {Math.max(0, profile.followerCount || 0)}
                  </Text>
                  <Text style={styles.followSummaryLabel}>Followers</Text>
                </View>
                <View style={styles.followSummaryCard}>
                  <Text style={styles.followSummaryNumber}>
                    {Math.max(0, profile.followingCount || 0)}
                  </Text>
                  <Text style={styles.followSummaryLabel}>Following</Text>
                </View>
              </View>

              {!!profile.bio ? (
                <View
                  style={{
                    marginTop: 16,
                    backgroundColor: "rgba(15, 23, 42, 0.30)",
                    borderWidth: 1,
                    borderColor: "rgba(148, 163, 184, 0.24)",
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
                    {profile.bio}
                  </Text>
                </View>
              ) : (
                <Text style={{ color: "#94A3B8", marginTop: 14, textAlign: "center" }}>
                  No bio added yet.
                </Text>
              )}

              {!isSelf && (
                <Pressable
                  style={[
                    styles.profileBioFollowButton,
                    isFollowing && styles.profileBioFollowButtonActive,
                    (followBusy || isBlocked) && { opacity: 0.65 },
                  ]}
                  onPress={() => onToggleFollow(profile)}
                  disabled={followBusy || isBlocked}
                >
                  <Text
                    style={[
                      styles.profileBioFollowButtonText,
                      isFollowing && styles.profileBioFollowButtonTextActive,
                    ]}
                  >
                    {followBusy
                      ? "Saving..."
                      : isBlocked
                      ? "Blocked"
                      : isFollowing
                      ? "Following"
                      : "Follow"}
                  </Text>
                </Pressable>
              )}

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{profile.stats.posts}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{profile.stats.reactions}</Text>
                  <Text style={styles.statLabel}>Reactions</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{profile.stats.areas}</Text>
                  <Text style={styles.statLabel}>Areas</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{profile.stats.comments}</Text>
                  <Text style={styles.statLabel}>Comments</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{profile.stats.polls}</Text>
                  <Text style={styles.statLabel}>Polls</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{profile.stats.pollVotes}</Text>
                  <Text style={styles.statLabel}>Poll Votes</Text>
                </View>
              </View>

              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsKicker}>Engagement</Text>
                <Text style={styles.analyticsTitle}>Post analytics</Text>

                <View style={styles.analyticsGrid}>
                  <View style={styles.analyticsMetric}>
                    <Text style={styles.analyticsIcon}>👁</Text>
                    <Text style={styles.analyticsValue}>{profile.stats.views}</Text>
                    <Text style={styles.analyticsLabel}>Views</Text>
                  </View>

                  <View style={styles.analyticsMetric}>
                    <Text style={styles.analyticsIcon}>☆</Text>
                    <Text style={styles.analyticsValue}>{profile.stats.saves}</Text>
                    <Text style={styles.analyticsLabel}>Saves</Text>
                  </View>

                  <View style={styles.analyticsMetric}>
                    <Text style={styles.analyticsIcon}>↗</Text>
                    <Text style={styles.analyticsValue}>{profile.stats.shares}</Text>
                    <Text style={styles.analyticsLabel}>Shares</Text>
                  </View>
                </View>
              </View>
            </View>

            {!isSelf && (
              <View style={styles.profileActionRow}>
                <Pressable
                  style={[styles.primaryButton, { flex: 1, marginTop: 0 }]}
                  onPress={() => onMessage(profile)}
                  disabled={isBlocked}
                >
                  <Text style={styles.primaryButtonText}>
                    {isBlocked ? "Blocked" : "Message"}
                  </Text>
                </Pressable>
              </View>
            )}

            {!isSelf && (
              <View
                style={[
                  styles.blockProfileActionCard,
                  isBlocked && styles.blockProfileActionCardActive,
                  blockBusy && { opacity: 0.65 },
                ]}
              >
                <View style={styles.blockProfileContentRow}>
                  <View
                    style={[
                      styles.blockProfileIconBox,
                      isBlocked && styles.blockProfileIconBoxActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.blockProfileIconText,
                        isBlocked && styles.blockProfileIconTextActive,
                      ]}
                    >
                      !
                    </Text>
                  </View>

                  <View style={styles.blockProfileTextBlock}>
                    <Text
                      style={[
                        styles.blockProfileKicker,
                        isBlocked && styles.blockProfileKickerActive,
                      ]}
                    >
                      Profile control
                    </Text>
                    <Text style={styles.blockProfileTitle}>
                      {isBlocked ? "User blocked" : "Block user"}
                    </Text>
                    <Text
                      style={[
                        styles.blockProfileSubtitle,
                        isBlocked && styles.blockProfileSubtitleActive,
                      ]}
                    >
                      {isBlocked
                        ? "Unblock to see posts, follow, or message this profile again."
                        : "Hide this person's posts and messages from your CityPeak experience."}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={[
                    styles.blockProfileButton,
                    isBlocked && styles.blockProfileButtonPillActive,
                    blockBusy && styles.blockProfileButtonBusy,
                  ]}
                  onPress={() => onToggleBlock(profile)}
                  disabled={blockBusy}
                  hitSlop={8}
                >
                  <Text
                    style={[
                      styles.blockProfileButtonText,
                      isBlocked && styles.blockProfileButtonTextActive,
                    ]}
                  >
                    {blockBusy
                      ? "Saving..."
                      : isBlocked
                      ? "Unblock user"
                      : "Block user"}
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function AdminLoadedVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer({ uri, useCaching: true }, (player) => {
    player.loop = false;
  });

  return (
    <VideoView
      player={player}
      nativeControls
      allowsFullscreen
      style={{
        width: "100%",
        height: 220,
        borderRadius: 16,
        marginTop: 12,
        backgroundColor: "rgba(15, 23, 42, 0.30)",
      }}
    />
  );
}

function AdminVideoPreview({ uri }: { uri: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoUri = normalizeMediaUri(uri);

  if (!videoUri) {
    devLog("[media] skipped invalid report video", uri);
    return null;
  }

  if (isLoaded) {
    return <AdminLoadedVideo uri={videoUri} />;
  }

  return (
    <Pressable
      onPress={() => {
        countUsage("video-load:admin-report");
        setIsLoaded(true);
      }}
      style={{
        width: "100%",
        height: 220,
        borderRadius: 16,
        marginTop: 12,
        backgroundColor: "rgba(15, 23, 42, 0.30)",
        borderWidth: 1,
        borderColor: "rgba(148, 163, 184, 0.24)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>
        Tap to load reported video
      </Text>
    </Pressable>
  );
}

function AdminReportImagePreview({
  thumbnailUri,
  fullUri,
}: {
  thumbnailUri?: string;
  fullUri?: string;
}) {
  const [isFullLoaded, setIsFullLoaded] = useState(false);
  const previewUri = thumbnailUri || fullUri;
  const previewSource = getStableImageSource(
    previewUri,
    "report image thumbnail"
  );
  const fullSource = isFullLoaded
    ? getStableImageSource(fullUri, "report full image")
    : undefined;
  const displaySource = fullSource || previewSource;
  const canOpenFull = !!fullUri && fullUri !== previewUri && !isFullLoaded;

  if (!displaySource) return null;

  return (
    <View>
      <Image
        source={displaySource}
        style={{
          width: "100%",
          height: 220,
          borderRadius: 16,
          marginTop: 12,
          backgroundColor: "rgba(15, 23, 42, 0.30)",
        }}
        onLoad={() =>
          devLog(
            isFullLoaded
              ? "[media] loaded report full image"
              : "[media] loaded report thumbnail",
            isFullLoaded ? fullUri : previewUri
          )
        }
        onError={() =>
          devLog(
            isFullLoaded
              ? "[media] failed report full image"
              : "[media] failed report thumbnail",
            isFullLoaded ? fullUri : previewUri
          )
        }
      />

      {canOpenFull && (
        <Pressable
          style={[styles.secondaryButton, { marginTop: 10 }]}
          onPress={() => setIsFullLoaded(true)}
        >
          <Text style={styles.secondaryButtonText}>Open full image</Text>
        </Pressable>
      )}
    </View>
  );
}
export default Sentry.wrap(function App() {
  const [tab, setTab] = useState<Tab>("feed");
  const [selectedArea, setSelectedArea] = useState("Long Beach");
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>(defaultNotificationPreferences);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [currentFollowingIds, setCurrentFollowingIds] = useState<string[]>([]);
  const [followingUsers, setFollowingUsers] = useState<FollowUserSummary[]>([]);
  const [followBusyUid, setFollowBusyUid] = useState<string | null>(null);
  const [blockBusyUid, setBlockBusyUid] = useState<string | null>(null);
  const [postingStatus, setPostingStatus] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] =
    useState<PublicUserProfile | null>(null);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profilePosts, setProfilePosts] = useState<Post[]>([]);
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);
  const [feedLimit, setFeedLimit] = useState(15);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [feedRefreshNonce, setFeedRefreshNonce] = useState(0);
  const [feedRefreshing, setFeedRefreshing] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [startingMessageUserId, setStartingMessageUserId] = useState<string | null>(null);
  const postingStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedLoadingMoreRef = useRef(false);
  const publicProfileCacheRef = useRef(
    new Map<string, { profile: PublicUserProfile; loadedAt: number }>()
  );
  const isPostDataTab = tab === "feed" || tab === "search" || tab === "profile";

  useEffect(() => {
    countUsage("listener-create:auth");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      countUsage("auth-snapshot");
      setCurrentUser(user);

      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid)).catch((error) => {
          showActionFailure("auth-profile", error, "Your profile could not be loaded. Check your connection and try again.");
          return null;
        });

        if (!userDoc) {
          setFirebaseReady(true);
          return;
        }

        if (userDoc.exists()) {
          const data = userDoc.data();

          setUsername(data.username || user.email?.split("@")[0] || "user");
          setBio(data.bio || "");
          setPhotoUrl(data.photoUrl || "");
          setSelectedArea(data.selectedArea || "Long Beach");
          setHasCompletedOnboarding(data.hasCompletedOnboarding === true);
          setNotificationPreferences({
            ...defaultNotificationPreferences,
            ...(data.notificationPreferences || {}),
          });
          setNotificationsEnabled(data.notificationsEnabled === true);
          setExpoPushToken(data.expoPushToken || "");
          setBlockedUserIds(Array.isArray(data.blockedUserIds) ? data.blockedUserIds : []);
          setFollowerCount(data.followerCount || 0);
          setFollowingCount(data.followingCount || 0);
          setCurrentFollowingIds(Array.isArray(data.following) ? data.following : []);

          setIsAdmin(data.isAdmin === true);


        } else {
          setUsername(user.email?.split("@")[0] || "user");
          setBio("");
          setPhotoUrl("");
          setHasCompletedOnboarding(false);
          setNotificationPreferences(defaultNotificationPreferences);
          setNotificationsEnabled(false);
          setExpoPushToken("");
          setBlockedUserIds([]);
          setFollowerCount(0);
          setFollowingCount(0);
          setCurrentFollowingIds([]);
        }
      } else {
        setUsername("");
        setBio("");
        setPhotoUrl("");
        setHasCompletedOnboarding(true);
        setNotificationPreferences(defaultNotificationPreferences);
        setNotificationsEnabled(false);
        setExpoPushToken("");
        setBlockedUserIds([]);
        setFollowerCount(0);
        setFollowingCount(0);
        setCurrentFollowingIds([]);
        setFollowingUsers([]);
      }

      setFirebaseReady(true);
    });

    return () => {
      countUsage("listener-cleanup:auth");
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) return;

    countUsage("listener-create:current-user-profile");
    const unsubscribe = onSnapshot(doc(db, "users", currentUser.uid), (userDoc) => {
      countUsage("current-user-profile-snapshot");

      if (!userDoc.exists()) return;

      const data = userDoc.data();
      setUsername(data.username || currentUser.email?.split("@")[0] || "user");
      setBio(data.bio || "");
      setPhotoUrl(data.photoUrl || "");
      setSelectedArea(data.selectedArea || "Long Beach");
      setHasCompletedOnboarding(data.hasCompletedOnboarding === true);
      setNotificationPreferences({
        ...defaultNotificationPreferences,
        ...(data.notificationPreferences || {}),
      });
      setNotificationsEnabled(data.notificationsEnabled === true);
      setExpoPushToken(data.expoPushToken || "");
      setBlockedUserIds(Array.isArray(data.blockedUserIds) ? data.blockedUserIds : []);
      setFollowerCount(Math.max(0, data.followerCount || 0));
      setFollowingCount(Math.max(0, data.followingCount || 0));
      setCurrentFollowingIds(Array.isArray(data.following) ? data.following : []);
      setIsAdmin(data.isAdmin === true);
    });

    return () => {
      countUsage("listener-cleanup:current-user-profile");
      unsubscribe();
    };
  }, [currentUser?.uid, currentUser?.email]);

  useEffect(() => {
    let canceled = false;

    async function loadFollowingUsers() {
      if (!currentFollowingIds.length) {
        setFollowingUsers([]);
        return;
      }

      try {
        const chunks: string[][] = [];

        for (let index = 0; index < currentFollowingIds.length; index += 10) {
          chunks.push(currentFollowingIds.slice(index, index + 10));
        }

        const snapshots = await Promise.all(
          chunks.map((chunk) =>
            getDocs(query(collection(db, "users"), where("uid", "in", chunk)))
          )
        );

        if (canceled) return;

        const loadedUsers = snapshots
          .flatMap((snapshot) =>
            snapshot.docs.map((userDoc) => {
              const data = userDoc.data();

              return {
                uid: data.uid || userDoc.id,
                username: data.username || "user",
                photoUrl: data.photoUrl || "",
                bio: data.bio || "",
                followerCount: Math.max(0, data.followerCount || 0),
                followingCount: Math.max(0, data.followingCount || 0),
              } as FollowUserSummary;
            })
          )
          .filter((user) => !blockedUserIds.includes(user.uid))
          .sort((left, right) => left.username.localeCompare(right.username));

        setFollowingUsers(loadedUsers);
      } catch (error) {
        devLog("[profile] failed to load following users", error);
      }
    }

    loadFollowingUsers();

    return () => {
      canceled = true;
    };
  }, [currentFollowingIds, blockedUserIds]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    if (!hasCompletedOnboarding || tab !== "feed") return;

    let canceled = false;

    async function loadUserCoordinates() {
      const coordinates = await getCurrentCoordinates();

      if (!canceled) {
        setUserCoordinates(coordinates);
      }
    }

    loadUserCoordinates();

    return () => {
      canceled = true;
    };
  }, [currentUser?.uid, hasCompletedOnboarding, tab]);

  async function getCurrentCoordinates(): Promise<Coordinates | null> {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        return null;
      }

      const lastKnownPosition = await Location.getLastKnownPositionAsync({
        maxAge: 5 * 60 * 1000,
        requiredAccuracy: 250,
      });
      const position =
        lastKnownPosition ||
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }));

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      devLog("[location] unable to load coordinates", error);
      return null;
    }
  }

  useEffect(() => {
    if (!currentUser?.uid) return;
    if (!isPostDataTab) return;

    countUsage("listener-create:feed-posts", { feedLimit, feedRefreshNonce });
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(feedLimit + 1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        countUsage("feed-snapshot", {
          requestedLimit: feedLimit,
          snapshotSize: snapshot.size,
        });
        devLog("[feed] posts snapshot received", {
          requestedLimit: feedLimit,
          snapshotSize: snapshot.size,
        });

        feedLoadingMoreRef.current = false;
        const firebasePosts: Post[] = snapshot.docs.map((snapDoc) => ({
          id: snapDoc.id,
          ...(snapDoc.data() as Omit<Post, "id">),
        }));

        setHasMorePosts(firebasePosts.length > feedLimit);
        setPosts(firebasePosts.slice(0, feedLimit));
        setFeedRefreshing(false);
      },
      (error) => {
        devLog("[feed] posts listener error", error);
        feedLoadingMoreRef.current = false;
        setFeedRefreshing(false);
      }
    );

    return () => {
      countUsage("listener-cleanup:feed-posts", { feedLimit, feedRefreshNonce });
      unsubscribe();
    };
  }, [currentUser?.uid, feedLimit, feedRefreshNonce, isPostDataTab]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    if (tab !== "profile") return;

    countUsage("listener-create:profile-posts");
    const q = query(
      collection(db, "posts"),
      where("uid", "==", currentUser.uid),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      countUsage("profile-posts-snapshot", snapshot.size);
      const loadedPosts: Post[] = snapshot.docs.map((snapDoc) => ({
        id: snapDoc.id,
        ...(snapDoc.data() as Omit<Post, "id">),
      }));

      setProfilePosts(loadedPosts);
    });

    return () => {
      countUsage("listener-cleanup:profile-posts");
      unsubscribe();
    };
  }, [currentUser?.uid, tab]);

  useEffect(() => {
    if (!selectedPost) return;

    const updatedPost = posts.find(
      (post) => post.id === selectedPost.id
    );

    if (updatedPost) {
      setSelectedPost(updatedPost);
    }
  }, [posts, selectedPost?.id]);

  useEffect(() => {
    return () => {
      if (postingStatusTimeoutRef.current) {
        clearTimeout(postingStatusTimeoutRef.current);
      }
    };
  }, []);
  useEffect(() => {
    if (!currentUser?.uid) return;

    countUsage("listener-create:unread-messages");
    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(200)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        countUsage("unread-messages-snapshot", snapshot.size);
        const unreadCount = snapshot.docs.filter((messageDoc) => {
          const data = messageDoc.data();

          return (
            data.fromUid !== currentUser.uid &&
            !blockedUserIds.includes(data.fromUid) &&
            !(data.readBy ?? []).includes(currentUser.uid)
          );
        }).length;

        setUnreadMessagesCount(unreadCount);
      },
      (error) => {
        devLog("[messages] unread listener error", error);
      }
    );

    return () => {
      countUsage("listener-cleanup:unread-messages");
      unsubscribe();
    };
  }, [currentUser?.uid, blockedUserIds]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    if (!isAdmin) return;
    if (tab !== ("admin" as Tab)) return;

    countUsage("listener-create:admin-reports");
    devLog("[admin] starting reports listener", currentUser.uid);

    const q = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        countUsage("admin-reports-snapshot", snapshot.size);
        devLog("[admin] report snapshot received", snapshot.size);

        const loadedReports = snapshot.docs.map((reportDoc) => ({
          id: reportDoc.id,
          ...reportDoc.data(),
        }));


        setReports(loadedReports);
      },
      (error) => {
        showActionFailure("admin-reports", error, "Reports could not be loaded. Check your connection and admin access.");
      }
    );

    return () => {
      countUsage("listener-cleanup:admin-reports");
      unsubscribe();
    };
  }, [currentUser?.uid, isAdmin, tab]);

  async function prepareImageForUpload(
    uri: string,
    options: ImageUploadOptions = {}
  ) {
    let width = options.width ?? 1600;
    let compress = options.compress ?? 0.72;
    let lastResultUri = uri;
    let lastSize: number | null = null;

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width } }],
        {
          compress,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      const dataUriSize = result.uri.startsWith("data:")
        ? estimateDataUriBytes(result.uri)
        : null;
      const fileInfo = dataUriSize
        ? null
        : await FileSystem.getInfoAsync(result.uri).catch(() => null);
      const fileSize =
        dataUriSize ||
        (fileInfo?.exists && typeof (fileInfo as any).size === "number"
          ? (fileInfo as any).size
          : null);

      lastResultUri = result.uri;
      lastSize = fileSize;

      devLog("[media] compressed image for upload", {
        originalUri: uri,
        compressedUri: result.uri,
        width: result.width,
        height: result.height,
        fileSize,
        targetMaxBytes: options.maxBytes,
        attempt: attempt + 1,
      });

      if (!options.maxBytes || !fileSize || fileSize <= options.maxBytes) {
        return result.uri;
      }

      width = Math.max(480, Math.round(width * 0.82));
      compress = Math.max(0.48, compress - 0.12);
    }

    devLog("[media] image remained above target after compression attempts", {
      uri: lastResultUri,
      fileSize: lastSize,
      targetMaxBytes: options.maxBytes,
    });

    return lastResultUri;
  }

  async function uploadMediaToSupabase(
    uri: string,
    mediaType?: MediaType,
    imageOptions?: ImageUploadOptions
  ) {
    try {
      countUsage("storage-upload-start", mediaType || "unknown");
      const extension = mediaType === "video" ? "mp4" : "jpg";
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}.${extension}`;
      const contentType = mediaType === "video" ? "video/mp4" : "image/jpeg";
      const uploadUri =
        mediaType === "video" || imageOptions?.skipProcessing
          ? uri
          : await prepareImageForUpload(uri, imageOptions);

      let fileBody: Blob | ArrayBuffer;

      if (Platform.OS === "web") {
        const response = await fetch(uploadUri);
        fileBody = await response.blob();
      } else {
        const base64 = await FileSystem.readAsStringAsync(uploadUri, {
          encoding: "base64",
        });

        fileBody = decode(base64);
      }

      const { error } = await supabase.storage
        .from("images")
        .upload(fileName, fileBody, {
          contentType,
          cacheControl: "31536000",
          upsert: false,
        });

      if (error) {
        devLog("[media] supabase upload error", error);
        alert("Media upload failed. Please try again.");
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);
      countUsage("storage-public-url-created", fileName);

      devLog("[media] uploaded media to Supabase", {
        mediaType,
        fileName,
      });

      const publicUrl = normalizeMediaUri(publicUrlData.publicUrl);

      if (!publicUrl) {
        devLog("[media] Supabase returned invalid public URL", publicUrlData.publicUrl);
        return null;
      }

      return publicUrl;
    } catch (error: any) {
      devLog("[media] upload media error", error);
      alert(error.message || "Media upload failed.");
      return null;
    }
  }

  async function createWebVideoThumbnailUri(uri: string, timeMs: number) {
    const videoBlob = await fetch(uri).then((response) => response.blob());
    const objectUrl = URL.createObjectURL(videoBlob);

    try {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";

      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(
          () => reject(new Error("Timed out loading video metadata")),
          10000
        );

        video.onloadedmetadata = () => {
          window.clearTimeout(timeout);
          resolve();
        };
        video.onerror = () => {
          window.clearTimeout(timeout);
          reject(new Error("Unable to load video metadata"));
        };
        video.src = objectUrl;
        video.load();
      });

      const durationSeconds = Number.isFinite(video.duration) ? video.duration : 0;
      const targetSeconds = Math.min(timeMs / 1000, Math.max(0, durationSeconds - 0.05));

      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(
          () => reject(new Error("Timed out seeking video thumbnail frame")),
          10000
        );

        video.onseeked = () => {
          window.clearTimeout(timeout);
          resolve();
        };
        video.onerror = () => {
          window.clearTimeout(timeout);
          reject(new Error("Unable to seek video thumbnail frame"));
        };
        video.currentTime = targetSeconds;

        if (targetSeconds === 0 && video.readyState >= 2) {
          window.clearTimeout(timeout);
          resolve();
        }
      });

      const sourceWidth = video.videoWidth || 640;
      const sourceHeight = video.videoHeight || 360;
      const width = 640;
      const height = Math.max(1, Math.round((sourceHeight / sourceWidth) * width));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to create thumbnail canvas context");

      context.drawImage(video, 0, 0, width, height);

      return canvas.toDataURL("image/jpeg", 0.58);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function createVideoThumbnailUri(uri: string, durationMs?: number) {
    const candidateTimes = Array.from(
      new Set(
        [
          durationMs ? Math.max(0, Math.min(1000, Math.floor(durationMs / 2))) : 1000,
          500,
          0,
        ].filter((time) => time >= 0)
      )
    );

    for (const time of candidateTimes) {
      try {
        if (Platform.OS === "web") {
          const thumbnailUri = await createWebVideoThumbnailUri(uri, time);

          devLog("[media] generated web video thumbnail", {
            videoUri: uri,
            thumbnailPreview: thumbnailUri.slice(0, 48),
            time,
          });

          return thumbnailUri;
        }

        const thumbnail = await VideoThumbnails.getThumbnailAsync(uri, {
          time,
          quality: 0.7,
        });

        devLog("[media] generated video thumbnail", {
          videoUri: uri,
          thumbnailUri: thumbnail.uri,
          width: thumbnail.width,
          height: thumbnail.height,
          time,
        });

        return thumbnail.uri;
      } catch (error) {
        devLog("[media] failed to generate video thumbnail candidate", {
          time,
          error,
        });
      }
    }

    devLog("[media] failed to generate video thumbnail for all candidates", uri);
    return "";
  }

  function loadMoreFeedPosts() {
    if (!hasMorePosts || feedLoadingMoreRef.current) return;

    feedLoadingMoreRef.current = true;

    setFeedLimit((currentLimit) => {
      const nextLimit = currentLimit + 15;
      devLog("[feed] increasing feed limit", nextLimit);
      return nextLimit;
    });
  }

  function refreshFeedPosts() {
    if (feedRefreshing) return;

    countUsage("manual-feed-refresh");
    setFeedRefreshing(true);
    setFeedRefreshNonce((nonce) => nonce + 1);
  }

  async function saveProfile(
    newUsername: string,
    newBio: string,
    imageUri?: string
  ): Promise<boolean> {
    if (!currentUser) return false;

    try {
      let uploadedPhotoUrl = photoUrl;

    if (imageUri) {
      const result = await uploadMediaToSupabase(imageUri, "image", {
        width: 512,
        compress: 0.72,
        maxBytes: PROFILE_IMAGE_MAX_BYTES,
      });

        if (!result) return false;
        uploadedPhotoUrl = result;
    }

    const cleanedUsername =
      newUsername.trim() || currentUser.email?.split("@")[0] || "user";

    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        uid: currentUser.uid,
        email: currentUser.email,
        username: cleanedUsername,
        bio: newBio.trim(),
        photoUrl: uploadedPhotoUrl,
        followerCount,
        followingCount,
        following: currentFollowingIds,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setUsername(cleanedUsername);
    setBio(newBio.trim());
    setPhotoUrl(uploadedPhotoUrl);

      alert("Profile saved!");
      return true;
    } catch (error) {
      showActionFailure("profile", error, "Your profile could not be saved. Please check your connection and try again.");
      return false;
    }
  }

  async function enableNotifications(
    preferences: NotificationPreferences = notificationPreferences
  ) {
    if (!currentUser) return false;

    if (Platform.OS === "web") {
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          notificationPreferences: preferences,
          notificationsEnabled: false,
          notificationStatus: "web-unavailable",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      alert("Notification preferences saved. Push alerts are available in the mobile build.");
      return false;
    }

    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "CityPeak",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const existingPermissions = await Notifications.getPermissionsAsync();
      const finalPermissions = existingPermissions.granted
        ? existingPermissions
        : await Notifications.requestPermissionsAsync();

      if (!finalPermissions.granted) {
        await setDoc(
          doc(db, "users", currentUser.uid),
          {
            notificationPreferences: preferences,
            notificationsEnabled: false,
            notificationStatus: "declined",
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        return false;
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;
      const tokenResponse = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );

      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          expoPushToken: tokenResponse.data,
          notificationPreferences: preferences,
          notificationsEnabled: true,
          notificationStatus: "enabled",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setExpoPushToken(tokenResponse.data);
      setNotificationsEnabled(true);
      setNotificationPreferences(preferences);
      return true;
    } catch (error: any) {
      devLog("[notifications] enable failed", error);
      alert(error.message || "Notifications could not be enabled yet.");
      return false;
    }
  }

  async function completeOnboarding(settings: {
    area: string;
    interests: string[];
    notificationPreferences: NotificationPreferences;
  }) {
    if (!currentUser) return;

    const nextArea = settings.area.trim() || selectedArea;

    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        hasCompletedOnboarding: true,
        selectedArea: nextArea,
        interests: settings.interests,
        notificationPreferences: settings.notificationPreferences,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setSelectedArea(nextArea);
    setNotificationPreferences(settings.notificationPreferences);
    setHasCompletedOnboarding(true);
  }

  async function toggleNotificationPreference(key: keyof NotificationPreferences) {
    if (!currentUser) return;

    const nextPreferences = {
      ...notificationPreferences,
      [key]: !notificationPreferences[key],
    };

    setNotificationPreferences(nextPreferences);

    try {
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          notificationPreferences: nextPreferences,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      setNotificationPreferences(notificationPreferences);
      showActionFailure("notifications", error, "This notification setting could not be saved.");
    }
  }

  async function addPost(
    text: string,
    mediaUri?: string,
    mediaType?: MediaType,
    category?: PostCategory,
    poll?: PollDraft,
    mediaKind?: MediaKind,
    mediaDurationMs?: number,
    mediaSizeBytes?: number,
    postType: PostType = "standard",
    saleTitle?: string,
    salePrice?: string,
    saleCondition?: string,
    expiresAt?: string,
    tags?: string[],
    postFields?: PostFields,
    imageUris?: string[]
  ): Promise<boolean> {
    if (!currentUser) return false;

    if (!category) {
      alert("Please choose a category.");
      return false;
    }

    if (mediaType === "video") {
      const maxDurationMs =
        mediaKind === "tutorial" ? TUTORIAL_VIDEO_MAX_MS : REGULAR_VIDEO_MAX_MS;
      const maxBytes =
        mediaKind === "tutorial" ? TUTORIAL_VIDEO_MAX_BYTES : REGULAR_VIDEO_MAX_BYTES;

      if (mediaDurationMs && mediaDurationMs > maxDurationMs) {
        alert(
          mediaKind === "tutorial"
            ? "Tutorial videos can be up to 10 minutes."
            : "Regular post videos can be up to 30 seconds."
        );
        return false;
      }

      if (mediaSizeBytes && mediaSizeBytes > maxBytes) {
        alert(
          `${mediaKind === "tutorial" ? "Tutorial" : "Regular post"} videos must be ${Math.round(
            maxBytes / (1024 * 1024)
          )} MB or less.`
        );
        return false;
      }
    }

    setPostingStatus(
      mediaType === "video"
        ? "🎥 Posting your video..."
        : "📝 Posting..."
    );

    let uploadedMediaUrl = "";
    let uploadedThumbnailUrl = "";
    let uploadedImageUrls: string[] = [];
    let uploadedThumbnailUrls: string[] = [];

    try {
      if (mediaType === "image" && imageUris?.length) {
        setPostingStatus(
          imageUris.length > 1
            ? `🖼️ Uploading ${imageUris.length} photos...`
            : "🖼️ Uploading photo..."
        );

        for (const [index, imageUri] of imageUris.entries()) {
          setPostingStatus(
            imageUris.length > 1
              ? `🖼️ Uploading photo ${index + 1} of ${imageUris.length}...`
              : "🖼️ Uploading photo..."
          );
          const [result, thumbnailResult] = await Promise.all([
            uploadMediaToSupabase(imageUri, "image", {
              width: 1600,
              compress: 0.78,
              maxBytes: FULL_IMAGE_MAX_BYTES,
            }),
            uploadMediaToSupabase(imageUri, "image", {
              width: 720,
              compress: 0.66,
              maxBytes: THUMBNAIL_IMAGE_MAX_BYTES,
            }),
          ]);

          if (!result || !thumbnailResult) {
            setPostingStatus("");
            alert("Image upload failed. Please try again.");
            return false;
          }

          uploadedImageUrls.push(result);
          uploadedThumbnailUrls.push(thumbnailResult);
        }

        uploadedMediaUrl = uploadedImageUrls[0] || "";
        uploadedThumbnailUrl = uploadedThumbnailUrls[0] || "";
      } else if (mediaUri) {
        if (mediaType === "video") {
          setPostingStatus("🖼️ Preparing video thumbnail...");
          const thumbnailUri = await createVideoThumbnailUri(mediaUri, mediaDurationMs);

          if (!thumbnailUri) {
            setPostingStatus("");
            alert("We couldn't create a video thumbnail. Please choose another video.");
            return false;
          }

          const thumbnailResult = await uploadMediaToSupabase(thumbnailUri, "image", {
            width: 640,
            compress: 0.54,
            maxBytes: THUMBNAIL_IMAGE_MAX_BYTES,
            skipProcessing:
              Platform.OS === "web" && thumbnailUri.startsWith("data:image/"),
          });

          if (!thumbnailResult) {
            setPostingStatus("");
            alert("Video thumbnail upload failed. Please try again.");
            return false;
          }

          uploadedThumbnailUrl = thumbnailResult;
          setPostingStatus("🎥 Uploading compressed video...");
        }

        const [result, imageThumbnailResult] =
          mediaType === "image"
            ? await Promise.all([
                uploadMediaToSupabase(mediaUri, "image", {
                  width: 1600,
                  compress: 0.78,
                  maxBytes: FULL_IMAGE_MAX_BYTES,
                }),
                uploadMediaToSupabase(mediaUri, "image", {
                  width: 720,
                  compress: 0.66,
                  maxBytes: THUMBNAIL_IMAGE_MAX_BYTES,
                }),
              ])
            : [await uploadMediaToSupabase(mediaUri, mediaType), null];

        if (!result) {
          setPostingStatus("");
          alert("Media upload failed. Please try again.");
          return false;
        }

        uploadedMediaUrl = result;

        if (mediaType === "image") {
          uploadedThumbnailUrl = imageThumbnailResult || result;
        }
      }

      if (mediaType === "image" && uploadedMediaUrl && uploadedImageUrls.length === 0) {
        uploadedImageUrls = [uploadedMediaUrl];
      }

      if (mediaType === "image" && uploadedThumbnailUrl && uploadedThumbnailUrls.length === 0) {
        uploadedThumbnailUrls = [uploadedThumbnailUrl];
      }

      const postCoordinates = userCoordinates || (await getCurrentCoordinates());

      if (postCoordinates) {
        setUserCoordinates(postCoordinates);
      }

      await addDoc(collection(db, "posts"), {
        uid: currentUser.uid,
        username,
        photoUrl,
        author: `@${username}`,
        postType,
        saleTitle: saleTitle || "",
        salePrice: salePrice || "",
        saleCondition: saleCondition || "",
        postFields: postFields || {},
        text,
        tags: tags || [],
        location: selectedArea,
        postCoordinates,
        expiresAt: expiresAt || null,
        imageUrl: uploadedMediaUrl,
        imageUri: uploadedMediaUrl,
        imageUris: uploadedImageUrls,
        thumbnailUrl: uploadedThumbnailUrl,
        thumbnailUrls: uploadedThumbnailUrls,
        imageThumbnailUri:
          mediaType === "image"
            ? uploadedThumbnailUrl || uploadedMediaUrl
            : uploadedThumbnailUrl,
        mediaType: mediaType || "",
        mediaKind: mediaKind || "post",
        mediaDurationMs: mediaDurationMs || null,
        mediaSizeBytes: mediaSizeBytes || null,
        poll: poll
          ? {
              question: poll.question,
              options: poll.options.map((option, index) => ({
                id: `${Date.now()}-${index}`,
                text: option,
                votes: 0,
              })),
              votedBy: {},
            }
          : null,
        reactions: { fire: 0, heart: 0, laugh: 0, wow: 0, dislike: 0 },
        reactedBy: {},
        engagement: { views: 0, saves: 0, shares: 0 },
        viewedBy: {},
        savedBy: {},
        comments: [],
        createdAt: serverTimestamp(),
      });

      setTab("feed");
      setPostingStatus("✅ Posted!");

      if (postingStatusTimeoutRef.current) {
        clearTimeout(postingStatusTimeoutRef.current);
      }

      postingStatusTimeoutRef.current = setTimeout(() => {
        setPostingStatus("");
      }, 2500);
      return true;
    } catch (error: any) {
      setPostingStatus("");
      alert(error.message || "Post failed.");
      return false;
    }
  }

  async function reactToPost(postId: string, reaction: ReactionKey) {
    if (!currentUser) return;

    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost) return;

    const previousReaction = targetPost.reactedBy?.[currentUser.uid];

    if (previousReaction === reaction) return;

    const nextReactions = {
      fire: targetPost.reactions?.fire ?? 0,
      heart: targetPost.reactions?.heart ?? 0,
      laugh: targetPost.reactions?.laugh ?? 0,
      wow: targetPost.reactions?.wow ?? 0,
      dislike: targetPost.reactions?.dislike ?? 0,
    };

    if (previousReaction) {
      nextReactions[previousReaction] = Math.max(
        0,
        (nextReactions[previousReaction] ?? 0) - 1
      );
    }

    nextReactions[reaction] = (nextReactions[reaction] ?? 0) + 1;

    try {
      await updateDoc(doc(db, "posts", postId), {
        reactions: nextReactions,
        [`reactedBy.${currentUser.uid}`]: reaction,
      });
    } catch (error) {
      showActionFailure("reactions", error, "Your reaction could not be saved. Please try again.");
    }
  }

  async function voteOnPoll(postId: string, optionId: string) {
    if (!currentUser) return;

    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost?.poll) return;

    const previousOptionId = targetPost.poll.votedBy?.[currentUser.uid];

    if (previousOptionId === optionId) return;

    const nextOptions = targetPost.poll.options.map((option) => {
      if (option.id === optionId) {
        return {
          ...option,
          votes: (option.votes ?? 0) + 1,
        };
      }

      if (previousOptionId && option.id === previousOptionId) {
        return {
          ...option,
          votes: Math.max(0, (option.votes ?? 0) - 1),
        };
      }

      return option;
    });

    try {
      await updateDoc(doc(db, "posts", postId), {
        "poll.options": nextOptions,
        [`poll.votedBy.${currentUser.uid}`]: optionId,
      });
    } catch (error) {
      showActionFailure("polls", error, "Your vote could not be saved. Please try again.");
    }
  }

  async function addPollToPost(
    postId: string,
    poll: PollDraft
  ) {
    if (!currentUser) return;

    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost) return;

    if (targetPost.poll) {
      alert("This post already has a poll.");
      return;
    }

    const cleanedQuestion = poll.question.trim();
    const cleanedOptions = poll.options.map((option) => option.trim()).filter(Boolean);

    if (!cleanedQuestion || cleanedOptions.length < 2) {
      alert("Add a poll question and at least two options.");
      return;
    }

    try {
      await updateDoc(doc(db, "posts", postId), {
        poll: {
          question: cleanedQuestion,
          options: cleanedOptions.map((option, index) => ({
            id: `${Date.now()}-${index}`,
            text: option,
            votes: 0,
          })),
          votedBy: {},
        },
      });
    } catch (error) {
      showActionFailure("polls", error, "The poll could not be added. Please try again.");
    }
  }

  async function openPostWithView(post: Post) {
    setSelectedPost(post);

    if (!currentUser?.uid || post.uid === currentUser.uid || post.viewedBy?.[currentUser.uid]) {
      return;
    }

    try {
      await updateDoc(doc(db, "posts", post.id), {
        "engagement.views": increment(1),
        [`viewedBy.${currentUser.uid}`]: true,
      });
    } catch (error) {
      devLog("[engagement] view update failed", error);
    }
  }

  async function savePost(postId: string) {
    if (!currentUser?.uid) return;

    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost) return;

    try {
    if (targetPost.savedBy?.[currentUser.uid]) {
      await updateDoc(doc(db, "posts", postId), {
        "engagement.saves": increment(-1),
        [`savedBy.${currentUser.uid}`]: deleteField(),
      });

      return;
    }

    await updateDoc(doc(db, "posts", postId), {
      "engagement.saves": increment(1),
      [`savedBy.${currentUser.uid}`]: true,
    });
    } catch (error) {
      showActionFailure("saved-posts", error, "This post could not be updated. Please try again.");
    }
  }

  async function sharePost(post: Post) {
    if (!currentUser?.uid) return;

    const title = post.saleTitle || post.poll?.question || post.text || "CityPeak post";
    try {
    const result = await Share.share({
      message: `${title}\n\nPosted in ${post.location} on CityPeak.`,
    });

    if (result.action === Share.dismissedAction) return;

    await updateDoc(doc(db, "posts", post.id), {
      "engagement.shares": increment(1),
    });
    } catch (error) {
      showActionFailure("sharing", error, "This post could not be shared. Please try again.");
    }
  }

  async function updatePostDetails(
    postId: string,
    updates: {
      text: string;
      tags: string[];
      expiresAt?: string | null;
      saleTitle?: string;
      salePrice?: string;
      saleCondition?: string;
    }
  ): Promise<boolean> {
    const targetPost =
      posts.find((post) => post.id === postId) ||
      profilePosts.find((post) => post.id === postId);

    if (!currentUser?.uid || targetPost?.uid !== currentUser.uid) {
      alert("You can only edit your own posts.");
      return false;
    }

    try {
      await updateDoc(doc(db, "posts", postId), updates);
      return true;
    } catch (error) {
      showActionFailure("posts", error, "Your post changes could not be saved. Please try again.");
      return false;
    }
  }

  async function deletePost(postId: string) {
    try {
      await deleteDoc(doc(db, "posts", postId));

      alert("Post deleted");
    } catch (error: any) {
      devLog("[posts] delete post error", error);
      alert(error.message);
    }
  }
  async function reportPost(postId: string, reason: string) {
    if (!currentUser) return;

    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost) {
      alert("Post not found.");
      return;
    }

    if (targetPost.uid === currentUser.uid) {
      alert("You cannot report your own post.");
      return;
    }

    try {
      await addDoc(collection(db, "reports"), {
      type: "post",
      postId,
      postText: targetPost.text || "",
      imageUrl: targetPost.imageUrl || targetPost.imageUri || "",
      imageUri: targetPost.imageUri || "",
      thumbnailUrl:
        targetPost.thumbnailUrl || targetPost.imageThumbnailUri || targetPost.imageUri || "",
      mediaType: targetPost.mediaType || "",
      postOwnerUid: targetPost.uid || "",
      postAuthor: targetPost.author || "",
      reportedByUid: currentUser.uid,
      reportedByUsername: username,
      reason,
      status: "open",
      createdAt: serverTimestamp(),
      });

      alert("Report submitted. Thank you for helping keep CityPeak safe.");
    } catch (error) {
      showActionFailure("reports", error, "Your report could not be submitted. Please try again.");
    }
  }

  async function reportComment(postId: string, commentId: string, reason: string) {
    if (!currentUser) return;

    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost) {
      alert("Post not found.");
      return;
    }

    const targetComment = targetPost.comments.find(
      (comment) => comment.id === commentId
    );

    if (!targetComment) {
      alert("Comment not found.");
      return;
    }

    if (targetComment.uid === currentUser.uid) {
      alert("You cannot report your own comment.");
      return;
    }

    try {
      await addDoc(collection(db, "reports"), {
      type: "comment",
      postId,
      commentId,
      commentText: targetComment.text || "",
      commentAuthor: targetComment.author || "",
      commentOwnerUid: targetComment.uid || "",
      reportedByUid: currentUser.uid,
      reportedByUsername: username,
      reason,
      status: "open",
      createdAt: serverTimestamp(),
      });

      alert("Comment report submitted.");
    } catch (error) {
      showActionFailure("reports", error, "This comment report could not be submitted. Please try again.");
    }
  }

  async function deleteComment(postId: string, commentId: string) {
    if (!currentUser) return;

    const targetPost = posts.find((post) => post.id === postId);

    if (!targetPost) {
      alert("Post not found.");
      return;
    }

    const targetComment = targetPost.comments.find(
      (comment) => comment.id === commentId
    );

    if (!targetComment) {
      alert("Comment not found.");
      return;
    }

    const isOwner =
      targetComment.uid === currentUser.uid ||
      targetComment.author === `@${username}`;

    if (!isOwner) {
      alert("You can only delete your own comments.");
      return;
    }

    const updatedComments = targetPost.comments.filter(
      (comment) => comment.id !== commentId
    );

    try {
      await updateDoc(doc(db, "posts", postId), { comments: updatedComments });
      alert("Comment deleted.");
    } catch (error) {
      showActionFailure("comments", error, "This comment could not be deleted. Please try again.");
    }
  }



  async function addComment(postId: string, text: string): Promise<boolean> {
    if (!currentUser) return false;

    const newComment: Comment = {
      id: Date.now().toString(),
      uid: currentUser.uid,
      username,
      author: `@${username}`,
      text,
      likes: 0,
      dislikes: 0,
      likedBy: {},
      dislikedBy: {},
      replies: [],
      createdAt: Date.now(),
    };

    const postRef = doc(db, "posts", postId);

    try {
      await updateDoc(postRef, { comments: arrayUnion(newComment) });
      return true;
    } catch (error) {
      showActionFailure("comments", error, "Your comment could not be posted. Please try again.");
      return false;
    }
  }

  function updateNestedCommentReaction(
    comments: Comment[],
    commentId: string,
    userId: string,
    reaction: "like" | "dislike"
  ): Comment[] {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        const likedBy = { ...(comment.likedBy ?? {}) };
        const dislikedBy = { ...(comment.dislikedBy ?? {}) };
        const hasLiked = likedBy[userId] === true;
        const hasDisliked = dislikedBy[userId] === true;
        const nextComment = {
          ...comment,
          likes: comment.likes ?? 0,
          dislikes: comment.dislikes ?? 0,
          likedBy,
          dislikedBy,
          replies: comment.replies ?? [],
        };

        if (reaction === "like") {
          if (hasLiked) return nextComment;

          nextComment.likes += 1;
          likedBy[userId] = true;

          if (hasDisliked) {
            nextComment.dislikes = Math.max(0, nextComment.dislikes - 1);
            delete dislikedBy[userId];
          }

          return nextComment;
        }

        if (hasDisliked) return nextComment;

        nextComment.dislikes += 1;
        dislikedBy[userId] = true;

        if (hasLiked) {
          nextComment.likes = Math.max(0, nextComment.likes - 1);
          delete likedBy[userId];
        }

        return {
          ...nextComment,
          likedBy,
          dislikedBy,
        };
      }

      return {
        ...comment,
        replies: updateNestedCommentReaction(
          comment.replies ?? [],
          commentId,
          userId,
          reaction
        ),
      };
    });
  }

  async function likeComment(postId: string, commentId: string) {
    if (!currentUser) return;

    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost) return;

    const updatedComments = updateNestedCommentReaction(
      targetPost.comments ?? [],
      commentId,
      currentUser.uid,
      "like"
    );

    try {
      await updateDoc(doc(db, "posts", postId), { comments: updatedComments });
    } catch (error) {
      showActionFailure("comments", error, "Your reaction could not be saved. Please try again.");
    }
  }

  async function dislikeComment(postId: string, commentId: string) {
    if (!currentUser) return;

    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost) return;

    const updatedComments = updateNestedCommentReaction(
      targetPost.comments ?? [],
      commentId,
      currentUser.uid,
      "dislike"
    );

    try {
      await updateDoc(doc(db, "posts", postId), { comments: updatedComments });
    } catch (error) {
      showActionFailure("comments", error, "Your reaction could not be saved. Please try again.");
    }
  }

  function addNestedReply(
    comments: Comment[],
    parentCommentId: string,
    newReply: Comment
  ): Comment[] {
    return comments.map((comment) => {
      if (comment.id === parentCommentId) {
        return {
          ...comment,
          replies: [...(comment.replies ?? []), newReply],
        };
      }

      return {
        ...comment,
        replies: addNestedReply(comment.replies ?? [], parentCommentId, newReply),
      };
    });
  }

  async function addReply(
    postId: string,
    commentId: string,
    text: string
  ): Promise<boolean> {
    if (!currentUser) return false;

    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost) return false;

    const newReply: Comment = {
      id: Date.now().toString(),
      uid: currentUser.uid,
      username,
      author: `@${username}`,
      text,
      likes: 0,
      dislikes: 0,
      likedBy: {},
      dislikedBy: {},
      replies: [],
      createdAt: Date.now(),
    };

    const updatedComments = addNestedReply(
      targetPost.comments ?? [],
      commentId,
      newReply
    );

    try {
      await updateDoc(doc(db, "posts", postId), { comments: updatedComments });
      return true;
    } catch (error) {
      showActionFailure("comments", error, "Your reply could not be posted. Please try again.");
      return false;
    }
  }

  function startMessageFromPost(post: Post) {
    if (!post.uid) {
      alert("This user cannot be messaged.");
      return;
    }

    if (post.uid === currentUser?.uid) {
      alert("You cannot message yourself.");
      return;
    }

    if (blockedUserIds.includes(post.uid)) {
      alert("Unblock this user before messaging them.");
      return;
    }

    setStartingMessageUserId(post.uid);
    setTab("messages");
  }

  async function deleteReportedPost(postId?: string) {
    if (!isAdmin || !postId) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
      alert("Reported post deleted.");
    } catch (error) {
      showActionFailure("admin", error, "The reported post could not be deleted.");
    }
  }

  async function markReportReviewed(reportId: string) {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, "reports", reportId), {
        status: "reviewed",
        reviewedAt: serverTimestamp(),
      });
    } catch (error) {
      showActionFailure("admin", error, "This report could not be marked as reviewed.");
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      showActionFailure("auth", error, "You could not be logged out. Please try again.");
    }
  }

  async function cleanupAccountData(userId: string) {
    const [
      userPostsSnapshot,
      userMessagesSnapshot,
      reportedBySnapshot,
      postOwnerReportsSnapshot,
      commentOwnerReportsSnapshot,
      followingRefsSnapshot,
      followerRefsSnapshot,
    ] = await Promise.all([
      getDocs(query(collection(db, "posts"), where("uid", "==", userId))),
      getDocs(
        query(collection(db, "messages"), where("participants", "array-contains", userId))
      ),
      getDocs(query(collection(db, "reports"), where("reportedByUid", "==", userId))),
      getDocs(query(collection(db, "reports"), where("postOwnerUid", "==", userId))),
      getDocs(query(collection(db, "reports"), where("commentOwnerUid", "==", userId))),
      getDocs(query(collection(db, "users"), where("following", "array-contains", userId))),
      getDocs(query(collection(db, "users"), where("followers", "array-contains", userId))),
    ]);

    const batches: ReturnType<typeof writeBatch>[] = [];
    let batch = writeBatch(db);
    let operationCount = 0;

    function queue(operation: (activeBatch: typeof batch) => void) {
      if (operationCount >= 440) {
        batches.push(batch);
        batch = writeBatch(db);
        operationCount = 0;
      }

      operation(batch);
      operationCount += 1;
    }

    followingRefsSnapshot.docs.forEach((userDoc) => {
      if (userDoc.id === userId) return;

      queue((activeBatch) =>
        activeBatch.update(userDoc.ref, {
          following: arrayRemove(userId),
          followingCount: increment(-1),
          updatedAt: serverTimestamp(),
        })
      );
    });

    followerRefsSnapshot.docs.forEach((userDoc) => {
      if (userDoc.id === userId) return;

      queue((activeBatch) =>
        activeBatch.update(userDoc.ref, {
          followers: arrayRemove(userId),
          followerCount: increment(-1),
          updatedAt: serverTimestamp(),
        })
      );
    });

    userPostsSnapshot.docs.forEach((postDoc) => {
      queue((activeBatch) => activeBatch.delete(postDoc.ref));
    });

    userMessagesSnapshot.docs.forEach((messageDoc) => {
      queue((activeBatch) => activeBatch.delete(messageDoc.ref));
    });

    const reportDocs = new Map<string, (typeof reportedBySnapshot.docs)[number]>();

    [
      ...reportedBySnapshot.docs,
      ...postOwnerReportsSnapshot.docs,
      ...commentOwnerReportsSnapshot.docs,
    ].forEach((reportDoc) => {
      reportDocs.set(reportDoc.id, reportDoc);
    });

    reportDocs.forEach((reportDoc) => {
      queue((activeBatch) => activeBatch.delete(reportDoc.ref));
    });

    queue((activeBatch) => activeBatch.delete(doc(db, "users", userId)));

    batches.push(batch);
    await Promise.all(batches.map((queuedBatch) => queuedBatch.commit()));
  }

  async function deleteAccount() {
    if (!currentUser) return;

    const confirmed = confirm(
      "Delete your CityPeak account? Your profile, posts, messages, reports, and follow links will be cleaned up. This cannot be undone."
    );

    if (!confirmed) return;

    try {
      setPostingStatus("Cleaning up your account...");
      await cleanupAccountData(currentUser.uid);
      await deleteUser(currentUser);
      setPostingStatus("");

      alert("Account deleted.");
    } catch (error: any) {
      setPostingStatus("");
      alert(
        error.message ||
        "Please log out and back in before deleting your account."
      );
    }
  }

  const profileStats = useMemo(() => {
    return getPostStats(profilePosts);
  }, [profilePosts]);

  const visiblePosts = useMemo(() => {
    return posts.filter((post) => !post.uid || !blockedUserIds.includes(post.uid));
  }, [posts, blockedUserIds]);

  const visibleProfilePosts = useMemo(() => {
    return profilePosts.filter((post) => !post.uid || !blockedUserIds.includes(post.uid));
  }, [profilePosts, blockedUserIds]);

  const savedPosts = useMemo(() => {
    if (!currentUser?.uid) return [];

    return visiblePosts.filter((post) => !!post.savedBy?.[currentUser.uid]);
  }, [visiblePosts, currentUser?.uid]);

  async function openUserProfile(target: UserProfileTarget) {
    if (!target.uid) return;

    const cachedProfile = publicProfileCacheRef.current.get(target.uid);
    const cacheIsFresh =
      cachedProfile && Date.now() - cachedProfile.loadedAt < 5 * 60 * 1000;

    if (cacheIsFresh) {
      countUsage("profile-cache-hit", target.uid);
      setSelectedUserProfile(cachedProfile.profile);
      return;
    }

    const fallbackUsername =
      target.username ||
      target.author?.replace("@", "") ||
      "user";

    setSelectedUserProfile({
      uid: target.uid,
      username: fallbackUsername,
      photoUrl: target.photoUrl,
      stats: emptyStats(),
    });

    try {
      countUsage("profile-fetch", target.uid);
      const [userDoc, userPostsSnapshot] = await Promise.all([
        getDoc(doc(db, "users", target.uid)),
        getDocs(
          query(
            collection(db, "posts"),
            where("uid", "==", target.uid),
            limit(100)
          )
        ),
      ]);
      const userData = userDoc.exists() ? userDoc.data() : {};
      const loadedPosts: Post[] = userPostsSnapshot.docs.map((snapDoc) => ({
        id: snapDoc.id,
        ...(snapDoc.data() as Omit<Post, "id">),
      }));

      const loadedProfile = {
        uid: target.uid,
        username:
          userData.username ||
          fallbackUsername,
        email: userData.email,
        bio: userData.bio || "",
        photoUrl: userData.photoUrl || target.photoUrl || "",
        followerCount: Math.max(0, userData.followerCount || 0),
        followingCount: Math.max(0, userData.followingCount || 0),
        followers: Array.isArray(userData.followers) ? userData.followers : [],
        following: Array.isArray(userData.following) ? userData.following : [],
        stats: getPostStats(loadedPosts),
      };

      publicProfileCacheRef.current.set(target.uid, {
        profile: loadedProfile,
        loadedAt: Date.now(),
      });
      setSelectedUserProfile(loadedProfile);
    } catch (error) {
      devLog("[profile] failed to load public user profile", error);
    }
  }

  async function toggleFollowUser(profile: PublicUserProfile) {
    if (!currentUser) return;

    if (profile.uid === currentUser.uid) {
      setSelectedUserProfile(null);
      setTab("profile");
      return;
    }

    const alreadyFollowing = currentFollowingIds.includes(profile.uid);
    const nextFollowerCount = Math.max(
      0,
      (profile.followerCount || 0) + (alreadyFollowing ? -1 : 1)
    );

    try {
      setFollowBusyUid(profile.uid);

      await Promise.all([
        updateDoc(doc(db, "users", currentUser.uid), {
          following: alreadyFollowing
            ? arrayRemove(profile.uid)
            : arrayUnion(profile.uid),
          followingCount: increment(alreadyFollowing ? -1 : 1),
          updatedAt: serverTimestamp(),
        }),
        updateDoc(doc(db, "users", profile.uid), {
          followers: alreadyFollowing
            ? arrayRemove(currentUser.uid)
            : arrayUnion(currentUser.uid),
          followerCount: increment(alreadyFollowing ? -1 : 1),
          updatedAt: serverTimestamp(),
        }),
      ]);

      const updatedProfile = {
        ...profile,
        followerCount: nextFollowerCount,
        followers: alreadyFollowing
          ? (profile.followers || []).filter((uid) => uid !== currentUser.uid)
          : Array.from(new Set([...(profile.followers || []), currentUser.uid])),
      };

      setSelectedUserProfile(updatedProfile);
      publicProfileCacheRef.current.set(profile.uid, {
        profile: updatedProfile,
        loadedAt: Date.now(),
      });
      setCurrentFollowingIds((ids) =>
        alreadyFollowing
          ? ids.filter((uid) => uid !== profile.uid)
          : Array.from(new Set([...ids, profile.uid]))
      );
      setFollowingCount((count) => Math.max(0, count + (alreadyFollowing ? -1 : 1)));
    } catch (error: any) {
      devLog("[profile] follow toggle failed", error);
      alert(error.message || "Follow update failed. Please try again.");
    } finally {
      setFollowBusyUid(null);
    }
  }

  async function toggleBlockUser(profile: PublicUserProfile) {
    if (!currentUser) return;
    if (profile.uid === currentUser.uid) return;

    const alreadyBlocked = blockedUserIds.includes(profile.uid);
    const confirmed =
      alreadyBlocked ||
      confirm(
        `Block @${profile.username}? Their posts and messages will be hidden from your CityPeak experience.`
      );

    if (!confirmed) return;

    try {
      setBlockBusyUid(profile.uid);
      const wasFollowing = currentFollowingIds.includes(profile.uid);
      const currentUserUpdates: any = {
        blockedUserIds: alreadyBlocked
          ? arrayRemove(profile.uid)
          : arrayUnion(profile.uid),
        updatedAt: serverTimestamp(),
      };
      const targetUserUpdates: any = {
        updatedAt: serverTimestamp(),
      };

      if (!alreadyBlocked && wasFollowing) {
        currentUserUpdates.following = arrayRemove(profile.uid);
        currentUserUpdates.followingCount = increment(-1);
        targetUserUpdates.followers = arrayRemove(currentUser.uid);
        targetUserUpdates.followerCount = increment(-1);
      }

      await Promise.all([
        updateDoc(doc(db, "users", currentUser.uid), currentUserUpdates),
        updateDoc(doc(db, "users", profile.uid), targetUserUpdates),
      ]);

      setBlockedUserIds((ids) =>
        alreadyBlocked
          ? ids.filter((uid) => uid !== profile.uid)
          : Array.from(new Set([...ids, profile.uid]))
      );

      if (!alreadyBlocked) {
        setCurrentFollowingIds((ids) => ids.filter((uid) => uid !== profile.uid));
        setFollowingCount((count) =>
          wasFollowing ? Math.max(0, count - 1) : count
        );
      }
    } catch (error: any) {
      devLog("[profile] block toggle failed", error);
      alert(error.message || "Block update failed. Please try again.");
    } finally {
      setBlockBusyUid(null);
    }
  }

  function messageUserFromProfile(profile: PublicUserProfile) {
    if (!currentUser) return;

    if (profile.uid === currentUser.uid) {
      setSelectedUserProfile(null);
      setTab("profile");
      return;
    }

    if (blockedUserIds.includes(profile.uid)) {
      alert("Unblock this user before messaging them.");
      return;
    }

    setSelectedUserProfile(null);
    setStartingMessageUserId(profile.uid);
    setTab("messages");
  }

  if (!firebaseReady) {
    return (
      <SafeAreaView style={styles.container}>
        <CityBackdrop />
        <View style={styles.screen}>
          <Text style={styles.logo}>CityPeak</Text>
          <Text style={styles.subtitle}>Connecting Firebase...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={() => { }} />;
  }

  if (!hasCompletedOnboarding) {
    return (
      <OnboardingScreen
        initialArea={selectedArea}
        notificationPreferences={notificationPreferences}
        onComplete={completeOnboarding}
        onEnableNotifications={enableNotifications}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CityBackdrop />
      <View style={styles.header}>
        <View style={styles.headerTitleArea}>
          <Text style={styles.logo}>CityPeak</Text>
          <Text style={styles.subtitle}>Local city feeds</Text>

          <Text style={styles.signedInText}>
            Signed in as @{username}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {isAdmin && (
            <Pressable style={styles.headerPill} onPress={() => setTab("admin" as Tab)}>
              <Text style={styles.headerPillText}>Admin</Text>
            </Pressable>
          )}

          <Pressable style={styles.headerPill} onPress={() => setTab("search")}>
            <Text style={styles.headerPillText}>{selectedArea}</Text>
          </Pressable>
        </View>
      </View>

      {postingStatus !== "" && (
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 12,
            backgroundColor: "rgba(15, 23, 42, 0.34)",
            borderWidth: 1,
            borderColor: "rgba(96, 165, 250, 0.42)",
            borderRadius: 18,
            padding: 12,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "900",
              textAlign: "center",
            }}
          >
            {postingStatus}
          </Text>

          <Text
            style={{
              color: "#94A3B8",
              fontSize: 12,
              textAlign: "center",
              marginTop: 4,
            }}
          >
            Keep CityPeak open while upload finishes.
          </Text>
        </View>
      )}

      {tab === "feed" && (
        <FeedScreen
          posts={visiblePosts}
          hasMorePosts={hasMorePosts}
          onLoadMorePosts={loadMoreFeedPosts}
          onRefreshPosts={refreshFeedPosts}
          refreshing={feedRefreshing}
          selectedArea={selectedArea}
          setTab={setTab}
          onReact={reactToPost}
          onOpenPost={openPostWithView}
          currentUserId={currentUser.uid}
          onDeletePost={deletePost}
          onReportPost={reportPost}
          onMessagePost={startMessageFromPost}
          onVotePoll={voteOnPoll}
          onSavePost={savePost}
          onSharePost={sharePost}
          userCoordinates={userCoordinates}
          onOpenUserProfile={openUserProfile}
        />
      )}

      {tab === "search" && (
        <SearchScreen
          search={search}
          setSearch={setSearch}
          setSelectedArea={setSelectedArea}
          setTab={setTab}
          posts={visiblePosts}
        />
      )}

      {tab === "post" && (
        <CreatePostScreen addPost={addPost} selectedArea={selectedArea} />
      )}

      {tab === "messages" && (
        <MessagesScreen
          currentUser={currentUser}
          username={username}
          startingUserId={startingMessageUserId}
          onOpenUserProfile={openUserProfile}
        />
      )}

      {tab === ("admin" as Tab) && (
        <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 130 }}>
          <Text style={styles.screenTitle}>Admin Dashboard</Text>
          <Text style={styles.muted}>Review reports and remove unsafe content.</Text>
          <Text
            style={{
              color: "yellow",
              fontWeight: "900",
              marginTop: 10,
              fontSize: 16,
            }}
          >
            Reports loaded: {reports.length}
          </Text>
          {reports.length === 0 && (
            <Text style={styles.muted}>No reports yet.</Text>
          )}

          {reports.map((report) => (
            <View key={report.id} style={styles.postCard}>
              <Text style={styles.smallTitle}>
                {report.type === "comment" ? "Reported Comment" : "Reported Post"}
              </Text>

              <Text style={styles.muted}>Reason: {report.reason}</Text>
              <Text style={styles.muted}>Status: {report.status || "open"}</Text>

              <Text style={{ color: "white", marginTop: 10, fontWeight: "800" }}>
                {report.postText || report.commentText || "No text available"}
              </Text>
              {report.imageUri && report.mediaType === "video" && (
                <AdminVideoPreview uri={report.imageUri} />
              )}

              {report.imageUri && report.mediaType !== "video" && (
                <AdminReportImagePreview
                  thumbnailUri={report.thumbnailUrl || report.imageThumbnailUri}
                  fullUri={report.imageUrl || report.imageUri}
                />
              )}



              <Pressable
                style={[styles.logoutButton, { marginTop: 12 }]}
                onPress={() => deleteReportedPost(report.postId)}
              >
                <Text style={styles.logoutButtonText}>Delete Post</Text>
              </Pressable>

              <Pressable
                style={[styles.primaryButton, { marginTop: 10 }]}
                onPress={() => markReportReviewed(report.id)}
              >
                <Text style={styles.primaryButtonText}>Mark Reviewed</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {tab === "profile" && (
        <View style={{ flex: 1 }}>
          <ProfileScreen
            username={username}
            setUsername={setUsername}
            bio={bio}
            setBio={setBio}
            photoUrl={photoUrl}
            email={currentUser.email}
            stats={profileStats}
            followerCount={followerCount}
            followingCount={followingCount}
            followingUsers={followingUsers}
            notificationsEnabled={notificationsEnabled}
            notificationPreferences={notificationPreferences}
            posts={visibleProfilePosts}
            savedPosts={savedPosts}
            onOpenFollowingUser={(user) => openUserProfile(user)}
            onEnableNotifications={async () => {
              await enableNotifications(notificationPreferences);
            }}
            onToggleNotificationPreference={toggleNotificationPreference}
            onSaveProfile={saveProfile}
            onUpdatePost={updatePostDetails}
            onOpenPost={openPostWithView}
            onLogout={handleLogout}
            onDeleteAccount={deleteAccount}
          />


        </View>
      )}

      <BottomNav
        tab={tab}
        setTab={setTab}
        unreadMessagesCount={unreadMessagesCount}
      />
      <PostDetailsModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onReact={reactToPost}
        onAddComment={addComment}
        onLikeComment={likeComment}
        onAddReply={addReply}
        currentUserId={currentUser?.uid}
        onDeletePost={deletePost}
        onReportPost={reportPost}
        onReportComment={reportComment}
          onDeleteComment={deleteComment}
          onDislikeComment={dislikeComment}
          onVotePoll={voteOnPoll}
          onAddPollToPost={addPollToPost}
          userCoordinates={userCoordinates}
          onOpenUserProfile={openUserProfile}
        />
      <PublicUserProfileModal
        profile={selectedUserProfile}
        currentUserId={currentUser?.uid}
        isFollowing={
          !!selectedUserProfile &&
          currentFollowingIds.includes(selectedUserProfile.uid)
        }
        followBusy={followBusyUid === selectedUserProfile?.uid}
        isBlocked={
          !!selectedUserProfile &&
          blockedUserIds.includes(selectedUserProfile.uid)
        }
        blockBusy={blockBusyUid === selectedUserProfile?.uid}
        onClose={() => setSelectedUserProfile(null)}
        onMessage={messageUserFromProfile}
        onToggleFollow={toggleFollowUser}
        onToggleBlock={toggleBlockUser}
      />
    </SafeAreaView>
  );
});
