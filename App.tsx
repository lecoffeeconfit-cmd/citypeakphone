import React, { useEffect, useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
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
  serverTimestamp,
  setDoc,
  updateDoc,
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
import { styles } from "./src/styles";
import type {
  Comment,
  MediaType,
  Post,
  PostCategory,
  ReactionKey,
  Tab,
} from "./src/types";
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
  const [posts, setPosts] = useState<Post[]>([]);

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

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firebasePosts: Post[] = snapshot.docs.map((snapDoc) => ({
        id: snapDoc.id,
        ...(snapDoc.data() as Omit<Post, "id">),
      }));

      setPosts(firebasePosts);
    });

    return unsubscribe;
  }, [currentUser]);

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
      author: anonymous ? "Anonymous" : `@${username}`,
      anonymous,
      text,
      location: selectedArea,
      category,
      imageUri: uploadedMediaUrl,
      mediaType: mediaType || "",
      reactions: { fire: 0, heart: 0, laugh: 0, wow: 0 },
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
    replies: [],
    createdAt: Date.now(),
  };

  const postRef = doc(db, "posts", postId);

  await updateDoc(postRef, {
    comments: arrayUnion(newComment),
  });
}

  async function likeComment(postId: string, commentId: string) {
    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost) return;

    const updatedComments = targetPost.comments.map((comment) => {
      if (comment.id !== commentId) return comment;

      return {
        ...comment,
        likes: (comment.likes ?? 0) + 1,
        replies: comment.replies ?? [],
      };
    });

    const postRef = doc(db, "posts", postId);

    await updateDoc(postRef, {
      comments: updatedComments,
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

    const newReply = {
      id: Date.now().toString(),
      author: anonymous ? "Anonymous" : `@${username}`,
      text,
      likes: 0,
      createdAt: Date.now(),
    };

    const updatedComments = targetPost.comments.map((comment) => {
      if (comment.id !== commentId) return comment;

      return {
        ...comment,
        likes: comment.likes ?? 0,
        replies: [...(comment.replies ?? []), newReply],
      };
    });

    const postRef = doc(db, "posts", postId);

    await updateDoc(postRef, {
      comments: updatedComments,
    });
  }

  async function handleLogout() {
    await signOut(auth);
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
    return <AuthScreen onAuthSuccess={() => {}} />;
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

        <Pressable style={styles.headerPill} onPress={() => setTab("search")}>
          <Text style={styles.headerPillText}>{selectedArea}</Text>
        </Pressable>
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
/>
      )}

      {tab === "search" && (
        <SearchScreen
          search={search}
          setSearch={setSearch}
          setSelectedArea={setSelectedArea}
          setTab={setTab}
        />
      )}

      {tab === "post" && (
        <CreatePostScreen addPost={addPost} selectedArea={selectedArea} />
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
          />

          <Pressable
            style={[styles.secondaryButton, { marginHorizontal: 20 }]}
            onPress={handleLogout}
          >
            <Text style={styles.secondaryButtonText}>Log Out</Text>
          </Pressable>
        </View>
      )}

      <BottomNav tab={tab} setTab={setTab} />

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
/>
    </SafeAreaView>
  );
}