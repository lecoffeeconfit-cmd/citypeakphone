import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
  Switch,
  Modal,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

type Tab = "feed" | "search" | "post" | "profile";
type ReactionKey = "fire" | "heart" | "laugh" | "wow";

type Comment = {
  id: string;
  author: string;
  text: string;
};

type Post = {
  id: string;
  author: string;
  anonymous: boolean;
  text: string;
  location: string;
  imageUri?: string;
  reactions: Record<ReactionKey, number>;
  comments: Comment[];
};

const reactionButtons: { key: ReactionKey; emoji: string }[] = [
  { key: "fire", emoji: "🔥" },
  { key: "heart", emoji: "❤️" },
  { key: "laugh", emoji: "😂" },
  { key: "wow", emoji: "😮" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("feed");
  const [selectedArea, setSelectedArea] = useState("Long Beach");
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("howie");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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

  function addPost(text: string, anonymous: boolean, imageUri?: string) {
    const newPost: Post = {
      id: Date.now().toString(),
      author: anonymous ? "Anonymous" : `@${username}`,
      anonymous,
      text,
      location: selectedArea,
      imageUri,
      reactions: { fire: 0, heart: 0, laugh: 0, wow: 0 },
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setTab("feed");
  }

  function reactToPost(postId: string, reaction: ReactionKey) {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              reactions: {
                ...post.reactions,
                [reaction]: post.reactions[reaction] + 1,
              },
            }
          : post
      )
    );

    setSelectedPost((current) =>
      current && current.id === postId
        ? {
            ...current,
            reactions: {
              ...current.reactions,
              [reaction]: current.reactions[reaction] + 1,
            },
          }
        : current
    );
  }

  function addComment(postId: string, text: string, anonymous: boolean) {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: anonymous ? "Anonymous" : `@${username}`,
      text,
    };

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );

    setSelectedPost((current) =>
      current && current.id === postId
        ? { ...current, comments: [...current.comments, newComment] }
        : current
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>CityPeak</Text>
          <Text style={styles.subtitle}>Local anonymous city feeds</Text>
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

      {tab === "post" && <CreatePostScreen addPost={addPost} selectedArea={selectedArea} />}

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

function FeedScreen({
  posts,
  selectedArea,
  setTab,
  onReact,
  onOpenPost,
}: {
  posts: Post[];
  selectedArea: string;
  setTab: (tab: Tab) => void;
  onReact: (postId: string, reaction: ReactionKey) => void;
  onOpenPost: (post: Post) => void;
}) {
  const filteredPosts = posts.filter((post) => post.location === selectedArea);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedList}
        ListHeaderComponent={
          <View style={styles.heroCard}>
            <Text style={styles.heroKicker}>Now peaking in</Text>
            <Text style={styles.heroTitle}>{selectedArea}</Text>
            <Text style={styles.heroText}>
              See what people nearby are talking about. Post anonymously or with your username.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No posts here yet</Text>
            <Text style={styles.muted}>Create the first post for this area.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard post={item} onReact={onReact} onOpen={() => onOpenPost(item)} />
        )}
      />

      <Pressable style={styles.floatingButton} onPress={() => setTab("post")}>
        <Text style={styles.floatingButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

function PostCard({
  post,
  onReact,
  onOpen,
}: {
  post: Post;
  onReact: (postId: string, reaction: ReactionKey) => void;
  onOpen: () => void;
}) {
  return (
    <Pressable style={styles.postCard} onPress={onOpen}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {post.anonymous ? "?" : post.author.replace("@", "")[0]?.toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.location}>{post.location}</Text>
        </View>

        <Text style={styles.more}>•••</Text>
      </View>

      {!!post.text && <Text style={styles.postText}>{post.text}</Text>}

      {post.imageUri && <Image source={{ uri: post.imageUri }} style={styles.postImage} />}

      <View style={styles.reactionRow}>
        {reactionButtons.map((reaction) => (
          <Pressable
            key={reaction.key}
            style={styles.reaction}
            onPress={() => onReact(post.id, reaction.key)}
          >
            <Text style={styles.reactionText}>
              {reaction.emoji} {post.reactions[reaction.key]}
            </Text>
          </Pressable>
        ))}

        <View style={styles.reaction}>
          <Text style={styles.reactionText}>💬 {post.comments.length}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function SearchScreen({
  search,
  setSearch,
  setSelectedArea,
  setTab,
}: {
  search: string;
  setSearch: (value: string) => void;
  setSelectedArea: (value: string) => void;
  setTab: (tab: Tab) => void;
}) {
  const popularAreas = [
    "Long Beach",
    "Los Angeles",
    "90802",
    "Irvine",
    "Santa Monica",
    "San Diego",
    "Hollywood",
    "Pasadena",
  ];

  function chooseArea(value: string) {
    setSelectedArea(value);
    setSearch("");
    setTab("feed");
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 130 }}>
      <Text style={styles.screenTitle}>Search local feeds</Text>
      <Text style={styles.screenSubtext}>
        Enter a city or ZIP code to view posts from that area.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Example: Long Beach or 90802"
        placeholderTextColor="#64748B"
        value={search}
        onChangeText={setSearch}
      />

      <Pressable
        style={styles.primaryButton}
        onPress={() => {
          if (search.trim()) chooseArea(search.trim());
        }}
      >
        <Text style={styles.primaryButtonText}>View Feed</Text>
      </Pressable>

      <Text style={styles.smallTitle}>Popular Areas</Text>

      <View style={styles.chipWrap}>
        {popularAreas.map((area) => (
          <Pressable key={area} style={styles.chip} onPress={() => chooseArea(area)}>
            <Text style={styles.chipText}>{area}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function CreatePostScreen({
  addPost,
  selectedArea,
}: {
  addPost: (text: string, anonymous: boolean, imageUri?: string) => void;
  selectedArea: string;
}) {
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission to access photos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
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

      <Pressable style={styles.secondaryButton} onPress={pickImage}>
        <Text style={styles.secondaryButtonText}>
          {imageUri ? "Change Photo" : "Add Photo"}
        </Text>
      </Pressable>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}

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
          if (text.trim() || imageUri) {
            addPost(text.trim(), anonymous, imageUri);
            setText("");
            setImageUri(undefined);
            setAnonymous(true);
          }
        }}
      >
        <Text style={styles.primaryButtonText}>Publish</Text>
      </Pressable>
    </ScrollView>
  );
}

function ProfileScreen({
  username,
  setUsername,
}: {
  username: string;
  setUsername: (value: string) => void;
}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{username[0]?.toUpperCase()}</Text>
        </View>

        <Text style={styles.profileName}>@{username}</Text>
        <Text style={styles.muted}>
          Used when you choose not to post anonymously.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>248</Text>
            <Text style={styles.statLabel}>Reactions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Areas</Text>
          </View>
        </View>
      </View>

      <Text style={styles.smallTitle}>Username</Text>

      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor="#64748B"
      />
    </View>
  );
}

function PostDetailsModal({
  post,
  onClose,
  onReact,
  onAddComment,
}: {
  post: Post | null;
  onClose: () => void;
  onReact: (postId: string, reaction: ReactionKey) => void;
  onAddComment: (postId: string, text: string, anonymous: boolean) => void;
}) {
  const [commentText, setCommentText] = useState("");
  const [anonymous, setAnonymous] = useState(true);

  if (!post) return null;

  return (
    <Modal visible={!!post} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Post Details</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
            <PostCard post={post} onReact={onReact} onOpen={() => {}} />

            <Text style={styles.smallTitle}>Comments</Text>

            {post.comments.length === 0 ? (
              <View style={styles.emptyCommentCard}>
                <Text style={styles.muted}>No comments yet. Start the conversation.</Text>
              </View>
            ) : (
              post.comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <Text style={styles.commentAuthor}>{comment.author}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))
            )}

            <View style={styles.commentComposer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#64748B"
                value={commentText}
                onChangeText={setCommentText}
              />

              <View style={styles.commentControls}>
                <Text style={styles.switchHelp}>Anon</Text>
                <Switch value={anonymous} onValueChange={setAnonymous} />
                <Pressable
                  style={styles.sendButton}
                  onPress={() => {
                    if (commentText.trim()) {
                      onAddComment(post.id, commentText.trim(), anonymous);
                      setCommentText("");
                    }
                  }}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function BottomNav({
  tab,
  setTab,
}: {
  tab: Tab;
  setTab: (tab: Tab) => void;
}) {
  const items: { key: Tab; label: string }[] = [
    { key: "feed", label: "Feed" },
    { key: "search", label: "Search" },
    { key: "post", label: "Post" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => (
        <Pressable key={item.key} onPress={() => setTab(item.key)} style={styles.navButton}>
          <Text style={tab === item.key ? styles.navIconActive : styles.navIcon}>
            {item.key === "feed"
              ? "🏠"
              : item.key === "search"
              ? "🔍"
              : item.key === "post"
              ? "➕"
              : "👤"}
          </Text>
          <Text style={tab === item.key ? styles.navItemActive : styles.navItem}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 18,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    color: "white",
    fontSize: 34,
    fontWeight: "900",
  },
  subtitle: {
    color: "#94A3B8",
    marginTop: 4,
  },
  headerPill: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1E293B",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    maxWidth: 140,
  },
  headerPillText: {
    color: "#38BDF8",
    fontWeight: "900",
  },
  feedList: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 28,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  heroKicker: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "white",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 4,
  },
  heroText: {
    color: "#94A3B8",
    marginTop: 8,
    lineHeight: 21,
  },
  postCard: {
    backgroundColor: "#0F172A",
    padding: 16,
    borderRadius: 26,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontWeight: "900",
  },
  author: {
    color: "white",
    fontWeight: "900",
  },
  location: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  more: {
    color: "#64748B",
    fontWeight: "900",
  },
  postText: {
    color: "white",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 14,
  },
  postImage: {
    width: "100%",
    height: 240,
    borderRadius: 22,
    marginBottom: 14,
    backgroundColor: "#1E293B",
  },
  reactionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  reaction: {
    backgroundColor: "#111827",
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  reactionText: {
    color: "#E2E8F0",
    fontWeight: "800",
  },
  floatingButton: {
    position: "absolute",
    right: 22,
    bottom: 98,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingButtonText: {
    color: "white",
    fontSize: 36,
    fontWeight: "500",
    marginTop: -3,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  screenTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 6,
  },
  screenSubtext: {
    color: "#94A3B8",
    marginBottom: 16,
    lineHeight: 21,
  },
  input: {
    backgroundColor: "#0F172A",
    color: "white",
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: "#0F172A",
    color: "white",
    minHeight: 190,
    padding: 15,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1E293B",
    textAlignVertical: "top",
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 12,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#111827",
    padding: 15,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  secondaryButtonText: {
    color: "#E2E8F0",
    fontWeight: "900",
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 22,
    marginTop: 14,
    backgroundColor: "#1E293B",
  },
  smallTitle: {
    color: "white",
    fontWeight: "900",
    marginTop: 24,
    marginBottom: 10,
    fontSize: 16,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    backgroundColor: "#0F172A",
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  chipText: {
    color: "#E2E8F0",
    fontWeight: "800",
  },
  switchRow: {
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1E293B",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: {
    color: "white",
    fontWeight: "900",
  },
  switchHelp: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 3,
  },
  profileCard: {
    backgroundColor: "#0F172A",
    padding: 24,
    borderRadius: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  profileAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  profileAvatarText: {
    color: "white",
    fontSize: 34,
    fontWeight: "900",
  },
  profileName: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  statBox: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 14,
    minWidth: 80,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  statNumber: {
    color: "white",
    fontWeight: "900",
    fontSize: 18,
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 3,
  },
  muted: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: "#0F172A",
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  emptyTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
  },
  bottomNav: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "#0F172A",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#1E293B",
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  navButton: {
    alignItems: "center",
    minWidth: 62,
  },
  navIcon: {
    fontSize: 18,
    opacity: 0.55,
  },
  navIconActive: {
    fontSize: 20,
  },
  navItem: {
    color: "#64748B",
    fontWeight: "800",
    fontSize: 11,
    marginTop: 2,
  },
  navItemActive: {
    color: "#38BDF8",
    fontWeight: "900",
    fontSize: 11,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    maxHeight: "92%",
    backgroundColor: "#020617",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  modalTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
  },
  closeButton: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
  },
  emptyCommentCard: {
    backgroundColor: "#0F172A",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  commentCard: {
    backgroundColor: "#0F172A",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 10,
  },
  commentAuthor: {
    color: "white",
    fontWeight: "900",
    marginBottom: 5,
  },
  commentText: {
    color: "#E2E8F0",
    lineHeight: 20,
  },
  commentComposer: {
    backgroundColor: "#0F172A",
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginTop: 16,
  },
  commentInput: {
    color: "white",
    padding: 10,
  },
  commentControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  sendButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "900",
  },
});