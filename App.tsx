import "./global.css";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";import { User, onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
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
  Post,
  PostCategory,
  ReactionKey,
  Tab,
} from "./src/types";

function AdminVideoPreview({ uri }: { uri: string }) {
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
export default function App() {
  const [tab, setTab] = useState<Tab>("feed");
  const [selectedArea, setSelectedArea] = useState("Long Beach");
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [postingStatus, setPostingStatus] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [startingMessageUserId, setStartingMessageUserId] = useState<string | null>(null);

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
    if (!currentUser) return;

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firebasePosts: Post[] = snapshot.docs.map((snapDoc) => ({
        id: snapDoc.id,
        ...(snapDoc.data() as Omit<Post, "id">),
      }));

      setPosts(firebasePosts);
    });

    return unsubscribe;
  }, [currentUser]);
  useEffect(() => {
    if (!selectedPost) return;

    const updatedPost = posts.find(
      (post) => post.id === selectedPost.id
    );

    if (updatedPost) {
      setSelectedPost(updatedPost);
    }
  }, [posts]);
  useEffect(() => {
    if (!currentUser) return;

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
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    if (!isAdmin) return;

    console.log("Starting reports listener for admin:", currentUser.uid);

    const q = query(
  collection(db, "reports"),
  orderBy("createdAt", "desc"),
  limit(50)
);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("========== REPORT SNAPSHOT ==========");
        console.log("Snapshot size:", snapshot.size);

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
  }, [currentUser, isAdmin]);

  async function uploadMediaToSupabase(uri: string, mediaType?: MediaType) {
    const response = await fetch(uri);
    const blob = await response.blob();

    const extension = mediaType === "video" ? "mp4" : "jpg";
    const fileName = `${Date.now()}.${extension}`;

    const { error } = await supabase.storage.from("images").upload(fileName, blob, {
      contentType: mediaType === "video" ? "video/mp4" : "image/jpeg",
    });

    if (error) {
      console.log("SUPABASE ERROR:", error);
      alert(JSON.stringify(error));
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

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
    category?: PostCategory
  ) {
    if (!currentUser) return;

    if (!category) {
      alert("Please choose a category.");
      return;
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

        if (result) {
          uploadedMediaUrl = result;
        }
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
        reactions: { fire: 0, heart: 0, laugh: 0, wow: 0, dislike: 0 },
        comments: [],
        createdAt: serverTimestamp(),
      });

      setPostingStatus("✅ Posted!");

      setTimeout(() => {
        setPostingStatus("");
      }, 2500);
    } catch (error: any) {
      setPostingStatus("");
      alert(error.message || "Post failed.");
    }
  }

  async function reactToPost(postId: string, reaction: ReactionKey) {
    const postRef = doc(db, "posts", postId);

    await updateDoc(postRef, {
      [`reactions.${reaction}`]: increment(1),
    });
  }
  async function deletePost(postId: string) {
    try {
      alert("Delete button clicked");

      await deleteDoc(doc(db, "posts", postId));

      alert("Post deleted");
    } catch (error: any) {
      console.log(error);
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
      replies: [],
      createdAt: Date.now(),
    };

    const postRef = doc(db, "posts", postId);

    await updateDoc(postRef, {
      comments: arrayUnion(newComment),
    });
  }

  function updateNestedCommentLike(
    comments: Comment[],
    commentId: string
  ): Comment[] {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: (comment.likes ?? 0) + 1,
          replies: comment.replies ?? [],
        };
      }

      return {
        ...comment,
        replies: updateNestedCommentLike(
          comment.replies ?? [],
          commentId
        ),
      };
    });
  }

  async function likeComment(postId: string, commentId: string) {
    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost) return;

    const updatedComments = updateNestedCommentLike(
      targetPost.comments ?? [],
      commentId
    );

    await updateDoc(doc(db, "posts", postId), {
      comments: updatedComments,
    });
  }
  function updateNestedCommentDislike(
    comments: Comment[],
    commentId: string
  ): Comment[] {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          dislikes: (comment.dislikes ?? 0) + 1,
          replies: comment.replies ?? [],
        };
      }

      return {
        ...comment,
        replies: updateNestedCommentDislike(comment.replies ?? [], commentId),
      };
    });
  }

  async function dislikeComment(postId: string, commentId: string) {
    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost) return;

    const updatedComments = updateNestedCommentDislike(
      targetPost.comments ?? [],
      commentId
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
        <View>
          <Text style={styles.logo}>CityPeak</Text>
          <Text style={styles.subtitle}>Local anonymous city feeds</Text>

          <Text style={{ color: "#22C55E", marginTop: 4, fontWeight: "800" }}>
            Signed in as @{username}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
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
          selectedArea={selectedArea}
          setTab={setTab}
          onReact={reactToPost}
          onOpenPost={setSelectedPost}
          currentUserId={currentUser.uid}
          onDeletePost={deletePost}
          onReportPost={reportPost}
          onMessagePost={startMessageFromPost}
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
    source={{ uri: report.imageUri }}
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
      />
    </SafeAreaView>
  );
}