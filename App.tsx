import React, { useEffect, useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import { supabase } from "./supabase";

import { BottomNav } from "./src/components/BottomNav";
import { PostDetailsModal } from "./src/components/PostDetailsModal";
import { CreatePostScreen } from "./src/screens/CreatePostScreen";
import { FeedScreen } from "./src/screens/FeedScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { styles } from "./src/styles";
import type { Comment, Post, ReactionKey, Tab } from "./src/types";

export default function App() {
  const [tab, setTab] = useState<Tab>("feed");
  const [selectedArea, setSelectedArea] = useState("Long Beach");
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("howie");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [firebaseReady, setFirebaseReady] = useState(false);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: "Anonymous",
      anonymous: true,
      text: "Anyone know what’s happening downtown tonight? Hearing helicopters near Pine Ave.",
      location: "Long Beach",
      reactions: { fire: 12, heart: 8, laugh: 3, wow: 6 },
      comments: [
        { id: "c1", author: "Anonymous", text: "I heard it too near Ocean Blvd." },
        { id: "c2", author: "@local808", text: "Probably an event by the Pike." },
      ],
    },
    {
      id: "2",
      author: "@howie",
      anonymous: false,
      text: "Looking for a good coffee shop to work from near the beach. Good WiFi is a must.",
      location: "Long Beach",
      reactions: { fire: 5, heart: 14, laugh: 2, wow: 1 },
      comments: [{ id: "c3", author: "Anonymous", text: "Rose Park Roasters is solid." }],
    },
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        await signInAnonymously(auth);
      }

      setFirebaseReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "posts"), (snapshot) => {
      const firebasePosts: Post[] = snapshot.docs.map((snapDoc) => ({
        id: snapDoc.id,
        ...(snapDoc.data() as Omit<Post, "id">),
      }));

      setPosts(firebasePosts.reverse());
    });

    return unsubscribe;
  }, []);

  async function uploadImageToSupabase(uri: string) {
    const response = await fetch(uri);
    const blob = await response.blob();

    const fileName = `${Date.now()}.jpg`;

    const { error } = await supabase.storage.from("images").upload(fileName, blob);

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

  async function addPost(text: string, anonymous: boolean, imageUri?: string) {
    let uploadedImageUrl = "";

    if (imageUri) {
      const result = await uploadImageToSupabase(imageUri);

      if (result) {
        uploadedImageUrl = result;
      }
    }

    const newPost: Post = {
      id: Date.now().toString(),
      author: anonymous ? "Anonymous" : `@${username}`,
      anonymous,
      text,
      location: selectedArea,
      imageUri: uploadedImageUrl,
      reactions: { fire: 0, heart: 0, laugh: 0, wow: 0 },
      comments: [],
    };

    setPosts([newPost, ...posts]);

    await addDoc(collection(db, "posts"), {
      author: newPost.author,
      anonymous: newPost.anonymous,
      text: newPost.text,
      location: newPost.location,
      imageUri: newPost.imageUri || "",
      reactions: newPost.reactions,
      comments: newPost.comments,
      createdAt: serverTimestamp(),
    });

    setTab("feed");
  }

  async function reactToPost(postId: string, reaction: ReactionKey) {
    const postRef = doc(db, "posts", postId);

    await updateDoc(postRef, {
      [`reactions.${reaction}`]: increment(1),
    });
  }

  async function addComment(postId: string, text: string, anonymous: boolean) {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: anonymous ? "Anonymous" : `@${username}`,
      text,
    };

    const postRef = doc(db, "posts", postId);

    await updateDoc(postRef, {
      comments: arrayUnion(newComment),
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>CityPeak</Text>
          <Text style={styles.subtitle}>Local anonymous city feeds</Text>

          <Text style={{ color: "#22C55E", marginTop: 4, fontWeight: "800" }}>
            {firebaseReady ? "Firebase Connected" : "Connecting Firebase..."}
          </Text>
        </View>

        <Pressable style={styles.headerPill} onPress={() => setTab("search")}>
          <Text style={styles.headerPillText}>{selectedArea}</Text>
        </Pressable>
      </View>

      {tab === "feed" && (
        <FeedScreen
          posts={posts}
          selectedArea={selectedArea}
          setTab={setTab}
          onReact={reactToPost}
          onOpenPost={setSelectedPost}
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
        <ProfileScreen username={username} setUsername={setUsername} />
      )}

      <BottomNav tab={tab} setTab={setTab} />

      <PostDetailsModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onReact={reactToPost}
        onAddComment={addComment}
      />
    </SafeAreaView>
  );
}