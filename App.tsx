import "./global.css";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
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
  View,
} from "react-native"; import { User, onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  limit,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import { supabase } from "./supabase";

import { BottomNav } from "./src/components/BottomNav";
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
  PollDraft,
  ReactionKey,
  Tab,
} from "./src/types";
import { devLog, getFeedImagePreviewUrl } from "./src/utils/media";

type PublicUserProfile = {
  uid: string;
  username: string;
  email?: string;
  bio?: string;
  photoUrl?: string;
  stats: {
    posts: number;
    reactions: number;
    comments: number;
    polls: number;
    pollVotes: number;
    areas: number;
  };
};

type UserProfileTarget = {
  uid?: string;
  username?: string;
  author?: string;
  photoUrl?: string;
};

const REGULAR_VIDEO_MAX_MS = 60 * 1000;
const TUTORIAL_VIDEO_MAX_MS = 10 * 60 * 1000;
const REGULAR_VIDEO_MAX_BYTES = 80 * 1024 * 1024;
const TUTORIAL_VIDEO_MAX_BYTES = 250 * 1024 * 1024;

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

  return {
    posts: userPosts.length,
    reactions: totalReactions,
    comments: totalComments,
    polls: pollPosts.length,
    pollVotes,
    areas: areas.size,
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
  };
}

function PublicUserProfileModal({
  profile,
  currentUserId,
  onClose,
  onMessage,
}: {
  profile: PublicUserProfile | null;
  currentUserId?: string;
  onClose: () => void;
  onMessage: (profile: PublicUserProfile) => void;
}) {
  if (!profile) return null;

  const displayPhoto = getFeedImagePreviewUrl(profile.photoUrl);
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
              {displayPhoto ? (
                <Image source={{ uri: displayPhoto }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>
                    {profile.username[0]?.toUpperCase() || "?"}
                  </Text>
                </View>
              )}

              <Text style={styles.profileName}>@{profile.username || "user"}</Text>

              {!!profile.bio ? (
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
                    {profile.bio}
                  </Text>
                </View>
              ) : (
                <Text style={{ color: "#94A3B8", marginTop: 14, textAlign: "center" }}>
                  No bio added yet.
                </Text>
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
            </View>

            {!isSelf && (
              <Pressable
                style={styles.primaryButton}
                onPress={() => onMessage(profile)}
              >
                <Text style={styles.primaryButtonText}>Message @{profile.username}</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function AdminLoadedVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (player) => {
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
        backgroundColor: "#0F172A",
      }}
    />
  );
}

function AdminVideoPreview({ uri }: { uri: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (isLoaded) {
    return <AdminLoadedVideo uri={uri} />;
  }

  return (
    <Pressable
      onPress={() => setIsLoaded(true)}
      style={{
        width: "100%",
        height: 220,
        borderRadius: 16,
        marginTop: 12,
        backgroundColor: "#0F172A",
        borderWidth: 1,
        borderColor: "#334155",
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
export default function App() {
  const [tab, setTab] = useState<Tab>("feed");
  const [selectedArea, setSelectedArea] = useState("Long Beach");
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
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
  const [feedLimit, setFeedLimit] = useState(25);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [startingMessageUserId, setStartingMessageUserId] = useState<string | null>(null);
  const postingStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedLoadingMoreRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setFirebaseReady(true);

      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const data = userDoc.data();

          setUsername(data.username || user.email?.split("@")[0] || "user");
          setBio(data.bio || "");
          setPhotoUrl(data.photoUrl || "");

          setIsAdmin(data.isAdmin === true);


        } else {
          setUsername(user.email?.split("@")[0] || "user");
          setBio("");
          setPhotoUrl("");
        }
      } else {
        setUsername("");
        setBio("");
        setPhotoUrl("");
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(feedLimit + 1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
    });

    return unsubscribe;
  }, [currentUser?.uid, feedLimit]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "posts"),
      where("uid", "==", currentUser.uid),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedPosts: Post[] = snapshot.docs.map((snapDoc) => ({
        id: snapDoc.id,
        ...(snapDoc.data() as Omit<Post, "id">),
      }));

      setProfilePosts(loadedPosts);
    });

    return unsubscribe;
  }, [currentUser?.uid]);

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

    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unreadCount = snapshot.docs.filter((messageDoc) => {
        const data = messageDoc.data();

        return (
          data.fromUid !== currentUser.uid &&
          !(data.readBy ?? []).includes(currentUser.uid)
        );
      }).length;

      setUnreadMessagesCount(unreadCount);
    });

    return unsubscribe;
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    if (!isAdmin) return;

    devLog("[admin] starting reports listener", currentUser.uid);

    const q = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        devLog("[admin] report snapshot received", snapshot.size);

        const loadedReports = snapshot.docs.map((reportDoc) => ({
          id: reportDoc.id,
          ...reportDoc.data(),
        }));


        setReports(loadedReports);
      },
      (error) => {
        console.error("REPORT LISTENER ERROR:", error);
        alert("Reports listener error: " + error.message);
      }
    );

    return unsubscribe;
  }, [currentUser?.uid, isAdmin]);

  async function prepareImageForUpload(uri: string) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1600 } }],
      {
        compress: 0.72,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    devLog("[media] compressed image for upload", {
      originalUri: uri,
      compressedUri: result.uri,
      width: result.width,
      height: result.height,
    });

    return result.uri;
  }

  async function uploadMediaToSupabase(uri: string, mediaType?: MediaType) {
  try {
    const extension = mediaType === "video" ? "mp4" : "jpg";
    const fileName = `${Date.now()}.${extension}`;
    const contentType = mediaType === "video" ? "video/mp4" : "image/jpeg";
    const uploadUri = mediaType === "video" ? uri : await prepareImageForUpload(uri);

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
        upsert: false,
      });

    if (error) {
      devLog("[media] supabase upload error", error);
      alert(JSON.stringify(error));
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    devLog("[media] uploaded media to Supabase", {
      mediaType,
      fileName,
    });

    return publicUrlData.publicUrl;
  } catch (error: any) {
    devLog("[media] upload media error", error);
    alert(error.message || "Media upload failed.");
    return null;
  }
}

  function loadMoreFeedPosts() {
    if (!hasMorePosts || feedLoadingMoreRef.current) return;

    feedLoadingMoreRef.current = true;

    setFeedLimit((currentLimit) => {
      const nextLimit = currentLimit + 25;
      devLog("[feed] increasing feed limit", nextLimit);
      return nextLimit;
    });
  }

  const reportImagePreviewSources = useMemo(() => {
    const sources = new Map<string, { uri: string }>();

    reports.forEach((report) => {
      if (report.imageUri && report.mediaType !== "video") {
        const previewUri = getFeedImagePreviewUrl(report.imageUri);

        if (previewUri) {
          sources.set(report.id, { uri: previewUri });
        }
      }
    });

    return sources;
  }, [reports]);

  async function saveProfile(
    newUsername: string,
    newBio: string,
    imageUri?: string
  ) {
    if (!currentUser) return;

    let uploadedPhotoUrl = photoUrl;

    if (imageUri) {
      const result = await uploadMediaToSupabase(imageUri, "image");

      if (result) {
        uploadedPhotoUrl = result;
      }
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
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setUsername(cleanedUsername);
    setBio(newBio.trim());
    setPhotoUrl(uploadedPhotoUrl);

    alert("Profile saved!");
  }

  async function addPost(
    text: string,
    anonymous: boolean,
    mediaUri?: string,
    mediaType?: MediaType,
    category?: PostCategory,
    poll?: PollDraft,
    mediaKind?: MediaKind,
    mediaDurationMs?: number,
    mediaSizeBytes?: number
  ) {
    if (!currentUser) return;

    if (!category) {
      alert("Please choose a category.");
      return;
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
            : "Regular post videos can be up to 60 seconds."
        );
        return;
      }

      if (mediaSizeBytes && mediaSizeBytes > maxBytes) {
        alert(
          mediaKind === "tutorial"
            ? "Tutorial videos must be 250 MB or less."
            : "Regular post videos must be 80 MB or less."
        );
        return;
      }
    }

    setPostingStatus(
      mediaType === "video"
        ? "🎥 Posting your video..."
        : "📝 Posting..."
    );

    setTab("feed");

    let uploadedMediaUrl = "";

    try {
      if (mediaUri) {
  const result = await uploadMediaToSupabase(mediaUri, mediaType);

  if (!result) {
    setPostingStatus("");
    alert("Media upload failed. Please try again.");
    return;
  }

  uploadedMediaUrl = result;
}

      await addDoc(collection(db, "posts"), {
        uid: currentUser.uid,
        username,
        photoUrl: anonymous ? "" : photoUrl,
        author: anonymous ? "Anonymous" : `@${username}`,
        anonymous,
        text,
        location: selectedArea,
        imageUri: uploadedMediaUrl,
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
        comments: [],
        createdAt: serverTimestamp(),
      });

      setPostingStatus("✅ Posted!");

      if (postingStatusTimeoutRef.current) {
        clearTimeout(postingStatusTimeoutRef.current);
      }

      postingStatusTimeoutRef.current = setTimeout(() => {
        setPostingStatus("");
      }, 2500);
    } catch (error: any) {
      setPostingStatus("");
      alert(error.message || "Post failed.");
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

    await updateDoc(doc(db, "posts", postId), {
      reactions: nextReactions,
      [`reactedBy.${currentUser.uid}`]: reaction,
    });
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

    await updateDoc(doc(db, "posts", postId), {
      "poll.options": nextOptions,
      [`poll.votedBy.${currentUser.uid}`]: optionId,
    });
  }
  async function deletePost(postId: string) {
    try {
      alert("Delete button clicked");

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

    await addDoc(collection(db, "reports"), {
      type: "post",
      postId,
      postText: targetPost.text || "",
      imageUri: targetPost.imageUri || "",
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

    await updateDoc(doc(db, "posts", postId), {
      comments: updatedComments,
    });

    alert("Comment deleted.");
  }



  async function addComment(postId: string, text: string, anonymous: boolean) {
    if (!currentUser) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      uid: currentUser.uid,
      username,
      author: anonymous ? "Anonymous" : `@${username}`,
      text,
      likes: 0,
      dislikes: 0,
      likedBy: {},
      dislikedBy: {},
      replies: [],
      createdAt: Date.now(),
    };

    const postRef = doc(db, "posts", postId);

    await updateDoc(postRef, {
      comments: arrayUnion(newComment),
    });
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

    await updateDoc(doc(db, "posts", postId), {
      comments: updatedComments,
    });
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

    await updateDoc(doc(db, "posts", postId), {
      comments: updatedComments,
    });
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
    text: string,
    anonymous: boolean
  ) {
    if (!currentUser) return;

    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost) return;

    const newReply: Comment = {
      id: Date.now().toString(),
      uid: currentUser.uid,
      username,
      author: anonymous ? "Anonymous" : `@${username}`,
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

    await updateDoc(doc(db, "posts", postId), {
      comments: updatedComments,
    });
  }

  function startMessageFromPost(post: Post) {
    if (!post.uid) {
      alert("This user cannot be messaged.");
      return;
    }

    if (post.anonymous) {
      alert("Anonymous posts cannot be messaged.");
      return;
    }

    if (post.uid === currentUser?.uid) {
      alert("You cannot message yourself.");
      return;
    }

    setStartingMessageUserId(post.uid);
    setTab("messages");
  }

  async function handleLogout() {
    await signOut(auth);
  }
  async function deleteAccount() {
    if (!currentUser) return;

    const confirmed = confirm(
      "Are you sure you want to permanently delete your CityPeak account?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "users", currentUser.uid));
      await deleteUser(currentUser);

      alert("Account deleted.");
    } catch (error: any) {
      alert(
        error.message ||
        "Please log out and back in before deleting your account."
      );
    }
  }

  const profileStats = useMemo(() => {
    return getPostStats(profilePosts);
  }, [profilePosts]);

  async function openUserProfile(target: UserProfileTarget) {
    if (!target.uid) return;

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

      setSelectedUserProfile({
        uid: target.uid,
        username:
          userData.username ||
          fallbackUsername,
        email: userData.email,
        bio: userData.bio || "",
        photoUrl: userData.photoUrl || target.photoUrl || "",
        stats: getPostStats(loadedPosts),
      });
    } catch (error) {
      devLog("[profile] failed to load public user profile", error);
    }
  }

  function messageUserFromProfile(profile: PublicUserProfile) {
    if (!currentUser) return;

    if (profile.uid === currentUser.uid) {
      setSelectedUserProfile(null);
      setTab("profile");
      return;
    }

    setSelectedUserProfile(null);
    setStartingMessageUserId(profile.uid);
    setTab("messages");
  }

  if (!firebaseReady) {
    return (
      <SafeAreaView style={styles.container}>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleArea}>
          <Text style={styles.logo}>CityPeak</Text>
          <Text style={styles.subtitle}>Local anonymous city feeds</Text>

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
            backgroundColor: "#0F172A",
            borderWidth: 1,
            borderColor: "#2563EB",
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
          posts={posts}
          hasMorePosts={hasMorePosts}
          onLoadMorePosts={loadMoreFeedPosts}
          selectedArea={selectedArea}
          setTab={setTab}
          onReact={reactToPost}
          onOpenPost={setSelectedPost}
          currentUserId={currentUser.uid}
          onDeletePost={deletePost}
          onReportPost={reportPost}
          onMessagePost={startMessageFromPost}
          onVotePoll={voteOnPoll}
          onOpenUserProfile={openUserProfile}
        />
      )}

      {tab === "search" && (
        <SearchScreen
          search={search}
          setSearch={setSearch}
          setSelectedArea={setSelectedArea}
          setTab={setTab}
          posts={posts}
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
                <Image
                  source={reportImagePreviewSources.get(report.id) ?? { uri: report.imageUri }}
                  style={{
                    width: "100%",
                    height: 220,
                    borderRadius: 16,
                    marginTop: 12,
                    backgroundColor: "#0F172A",
                  }}
                />
              )}



              <Pressable
                style={[styles.logoutButton, { marginTop: 12 }]}
                onPress={() => deleteDoc(doc(db, "posts", report.postId))}
              >
                <Text style={styles.logoutButtonText}>Delete Post</Text>
              </Pressable>

              <Pressable
                style={[styles.primaryButton, { marginTop: 10 }]}
                onPress={() =>
                  updateDoc(doc(db, "reports", report.id), {
                    status: "reviewed",
                    reviewedAt: serverTimestamp(),
                  })
                }
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
            onSaveProfile={saveProfile}
            onLogout={() => signOut(auth)}
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
        onOpenUserProfile={openUserProfile}
      />
      <PublicUserProfileModal
        profile={selectedUserProfile}
        currentUserId={currentUser?.uid}
        onClose={() => setSelectedUserProfile(null)}
        onMessage={messageUserFromProfile}
      />
    </SafeAreaView>
  );
}
