import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
Platform,
Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import type { User } from "firebase/auth";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { styles } from "../styles";
import { countUsage } from "../utils/usageAudit";

type MessagesScreenProps = {
  currentUser: User;
  username: string;
  startingUserId?: string | null;
};

type AppUser = {
  id: string;
  uid: string;
  username: string;
  email?: string;
  photoUrl?: string;
};

type Message = {
  id: string;
  fromUid: string;
  toUid: string;
  fromUsername: string;
  toUsername: string;
  text: string;
  participants: string[];
  reactions?: Record<string, string>;
  readBy?: string[];
  createdAt?: any;
};

function getMessageDate(createdAt: any) {
  if (!createdAt) return new Date(0);
  return createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
}

function formatMessageTime(createdAt: any) {
  if (!createdAt) return "Sending...";

  const date = getMessageDate(createdAt);

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessagesScreen({
  currentUser,
  username,
  startingUserId,
}: MessagesScreenProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<
    string | null
  >(null);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const messagesListRef = useRef<FlatList>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
  countUsage("messages-keyboard-listeners-create");
  const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
    setKeyboardVisible(true);
  });

  const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
    setKeyboardVisible(false);
  });

  return () => {
    countUsage("messages-keyboard-listeners-cleanup");
    showSubscription.remove();
    hideSubscription.remove();
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  };
}, []);

  useEffect(() => {
    countUsage("listener-create:messages-blocked-user");
    const unsubscribe = onSnapshot(doc(db, "users", currentUser.uid), (userDoc) => {
      countUsage("messages-blocked-user-snapshot");
      const data = userDoc.data();
      setBlockedUserIds(data?.blockedUserIds ?? []);
    });

    return () => {
      countUsage("listener-cleanup:messages-blocked-user");
      unsubscribe();
    };
  }, [currentUser.uid]);

  useEffect(() => {
    countUsage("listener-create:messages-users");
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      countUsage("messages-users-snapshot", snapshot.size);
      const loadedUsers: AppUser[] = snapshot.docs
        .map((userDoc) => ({
          id: userDoc.id,
          ...(userDoc.data() as Omit<AppUser, "id">),
        }))
        .filter((user) => user.uid !== currentUser.uid);

      setUsers(loadedUsers);
    });

    return () => {
      countUsage("listener-cleanup:messages-users");
      unsubscribe();
    };
  }, [currentUser.uid]);

  useEffect(() => {
    countUsage("listener-create:messages-thread-list");
    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      countUsage("messages-thread-list-snapshot", snapshot.size);
      const loadedMessages: Message[] = snapshot.docs
        .map((messageDoc) => ({
          id: messageDoc.id,
          ...(messageDoc.data() as Omit<Message, "id">),
        }))
        .sort(
          (a, b) =>
            getMessageDate(a.createdAt).getTime() -
            getMessageDate(b.createdAt).getTime()
        );

      setAllMessages(loadedMessages);
    });

    return () => {
      countUsage("listener-cleanup:messages-thread-list");
      unsubscribe();
    };
  }, [currentUser.uid]);

  useEffect(() => {
    if (!startingUserId || users.length === 0) return;
    if (blockedUserIds.includes(startingUserId)) return;

    const foundUser = users.find((user) => user.uid === startingUserId);

    if (foundUser) {
      setSelectedUser(foundUser);
    }
  }, [startingUserId, users, blockedUserIds]);

  const messages = selectedUser
    ? allMessages.filter(
        (message) =>
          message.participants.includes(selectedUser.uid) &&
          !blockedUserIds.includes(selectedUser.uid)
      )
    : [];

  const conversations = useMemo(() => {
    const map = new Map<string, { user: AppUser; lastMessage: Message }>();

    allMessages.forEach((message) => {
      const otherUid =
        message.fromUid === currentUser.uid ? message.toUid : message.fromUid;

      const foundUser = users.find((user) => user.uid === otherUid);

      if (!foundUser) return;
      if (blockedUserIds.includes(otherUid)) return;

      const existing = map.get(otherUid);

      if (
        !existing ||
        getMessageDate(message.createdAt).getTime() >
          getMessageDate(existing.lastMessage.createdAt).getTime()
      ) {
        map.set(otherUid, {
          user: foundUser,
          lastMessage: message,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        getMessageDate(b.lastMessage.createdAt).getTime() -
        getMessageDate(a.lastMessage.createdAt).getTime()
    );
  }, [allMessages, users, currentUser.uid, blockedUserIds]);

  function getUnreadCountForUser(userId: string) {
    if (blockedUserIds.includes(userId)) return 0;

    return allMessages.filter(
      (message) =>
        message.fromUid === userId &&
        message.toUid === currentUser.uid &&
        !(message.readBy ?? []).includes(currentUser.uid)
    ).length;
  }

  const cleanedSearch = userSearch.trim().toLowerCase();

  const searchedUsers =
    cleanedSearch.length === 0
      ? []
      : users.filter((user) =>
          !blockedUserIds.includes(user.uid) &&
          user.username?.toLowerCase().includes(cleanedSearch)
        );

  async function blockSelectedUser() {
    if (!selectedUser) return;

    const confirmBlock = window.confirm(
      `Block @${selectedUser.username}? Their messages will be hidden and they will disappear from your conversations.`
    );

    if (!confirmBlock) return;

    await updateDoc(doc(db, "users", currentUser.uid), {
      blockedUserIds: arrayUnion(selectedUser.uid),
    });

    setSelectedUser(null);
    alert(`@${selectedUser.username} has been blocked.`);
  }

  async function unblockSelectedUser() {
    if (!selectedUser) return;

    await updateDoc(doc(db, "users", currentUser.uid), {
      blockedUserIds: arrayRemove(selectedUser.uid),
    });

    Alert.alert("User unblocked", `@${selectedUser.username} has been unblocked.`);
  }

  async function sendMessage() {
    if (!selectedUser) return;

    if (blockedUserIds.includes(selectedUser.uid)) {
      Alert.alert("User blocked", "Unblock this user before messaging them.");
      return;
    }

    const cleanedText = messageText.trim();

    if (!cleanedText) {
      Alert.alert("Empty message", "Please type a message first.");
      return;
    }

    setMessageText("");

    await addDoc(collection(db, "messages"), {
      fromUid: currentUser.uid,
      toUid: selectedUser.uid,
      fromUsername: username,
      toUsername: selectedUser.username,
      text: cleanedText,
      participants: [currentUser.uid, selectedUser.uid],
      reactions: {},
      readBy: [currentUser.uid],
      createdAt: serverTimestamp(),
    });
  }

  async function deleteMessage(messageId: string) {
    Alert.alert("Delete message?", "This will remove the message.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "messages", messageId));
        },
      },
    ]);
  }

  async function reactToMessage(messageId: string, emoji: string) {
    await updateDoc(doc(db, "messages", messageId), {
      [`reactions.${currentUser.uid}`]: emoji,
    });

    setActiveReactionMessageId(null);
  }

  async function markConversationRead(userId: string) {
    if (blockedUserIds.includes(userId)) return;

    const unreadMessages = allMessages.filter(
      (message) =>
        message.fromUid === userId &&
        message.toUid === currentUser.uid &&
        !(message.readBy ?? []).includes(currentUser.uid)
    );

    await Promise.all(
      unreadMessages.map((message) =>
        updateDoc(doc(db, "messages", message.id), {
          readBy: [...(message.readBy ?? []), currentUser.uid],
        })
      )
    );
  }

  if (selectedUser) {
    const selectedUserBlocked = blockedUserIds.includes(selectedUser.uid);

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
        <View style={[styles.screen, { flex: 1, paddingBottom: 0 }]}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Pressable onPress={() => setSelectedUser(null)}>
              <Text style={{ color: "#60A5FA", fontWeight: "900" }}>
                ← Back to messages
              </Text>
            </Pressable>

            <Pressable
              onPress={
                selectedUserBlocked
                  ? unblockSelectedUser
                  : blockSelectedUser
              }
              style={{
                backgroundColor: selectedUserBlocked
                  ? "#166534"
                  : "#7F1D1D",
                paddingVertical: 12,
                paddingHorizontal: 18,
                borderRadius: 14,
                zIndex: 99999,
                elevation: 99999,
                position: "relative",
              }}
            >
              <Text style={{ color: "white", fontWeight: "900" }}>
                {selectedUserBlocked
                  ? "✅ Unblock"
                  : "🚫 Block User"}
              </Text>
            </Pressable>
          </View>

          <Text style={{ color: "white", fontSize: 24, fontWeight: "900" }}>
            Chat with @{selectedUser.username}
          </Text>

          <FlatList
            ref={messagesListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            style={{ flex: 1, marginTop: 16, zIndex: 1 }}
            contentContainerStyle={{ paddingBottom: 12 }}
            onContentSizeChange={() => {
              if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
              }

              scrollTimeoutRef.current = setTimeout(() => {
                messagesListRef.current?.scrollToEnd({
                  animated: true,
                });
              }, 10);
            }}
            renderItem={({ item }) => {
              const isMine = item.fromUid === currentUser.uid;

              return (
                <Pressable
                  onPress={() =>
                    setActiveReactionMessageId(
                      activeReactionMessageId === item.id ? null : item.id
                    )
                  }
                  onLongPress={() => {
                    if (isMine) deleteMessage(item.id);
                  }}
                  style={{
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    backgroundColor: isMine
                      ? "rgba(37, 99, 235, 0.82)"
                      : "rgba(30, 41, 59, 0.34)",
                    borderWidth: 1,
                    borderColor: isMine
                      ? "rgba(147, 197, 253, 0.34)"
                      : "rgba(148, 163, 184, 0.22)",
                    padding: 12,
                    borderRadius: 16,
                    marginBottom: 10,
                    maxWidth: "80%",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "800" }}>
                    {item.text}
                  </Text>

                  <Text
                    style={{
                      color: isMine ? "#BFDBFE" : "#94A3B8",
                      fontSize: 11,
                      marginTop: 5,
                    }}
                  >
                    {formatMessageTime(item.createdAt)}
                    {isMine ? " · Hold to delete" : ""}
                  </Text>

                  {item.reactions &&
                    Object.values(item.reactions).length > 0 && (
                      <Text style={{ marginTop: 6, fontSize: 16 }}>
                        {Object.values(item.reactions).join(" ")}
                      </Text>
                    )}

                  {activeReactionMessageId === item.id && (
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 6,
                        marginTop: 8,
                        backgroundColor: "rgba(2, 6, 23, 0.72)",
                        borderWidth: 1,
                        borderColor: "rgba(148, 163, 184, 0.18)",
                        padding: 6,
                        borderRadius: 999,
                      }}
                    >
                      {["❤️", "😂", "🔥", "😮", "👍"].map((emoji) => (
                        <Pressable
                          key={emoji}
                          onPress={() => reactToMessage(item.id, emoji)}
                        >
                          <Text style={{ fontSize: 18 }}>{emoji}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={{ color: "#94A3B8", marginTop: 20 }}>
                {selectedUserBlocked
                  ? "This user is blocked. Unblock them to view or send messages."
                  : "No messages yet. Send the first one."}
              </Text>
            }
          />

          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 12,
              marginBottom: keyboardVisible ? 2 : 95,
            }}
          >
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              onSubmitEditing={sendMessage}
              editable={!selectedUserBlocked}
              returnKeyType="send"
              blurOnSubmit={false}
              placeholder={selectedUserBlocked ? "User is blocked" : "Type a message..."}
              placeholderTextColor="#64748B"
              style={{
                flex: 1,
                backgroundColor: "rgba(15, 23, 42, 0.30)",
                color: "white",
                borderWidth: 1,
                borderColor: "rgba(148, 163, 184, 0.28)",
                borderRadius: 14,
                padding: 12,
              }}
            />

            <Pressable
              onPress={sendMessage}
              disabled={selectedUserBlocked}
              style={{
                backgroundColor: selectedUserBlocked ? "#334155" : "#2563EB",
                paddingHorizontal: 16,
                justifyContent: "center",
                borderRadius: 14,
              }}
            >
              <Text style={{ color: "white", fontWeight: "900" }}>Send</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={{ color: "white", fontSize: 24, fontWeight: "900" }}>
        Messages
      </Text>

      <Text style={{ color: "#94A3B8", marginTop: 6, marginBottom: 12 }}>
        Search for a username or open an existing conversation.
      </Text>

      <TextInput
        value={userSearch}
        onChangeText={setUserSearch}
        placeholder="Search username..."
        placeholderTextColor="#64748B"
        autoCapitalize="none"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.30)",
          color: "white",
          borderWidth: 1,
          borderColor: "rgba(148, 163, 184, 0.28)",
          borderRadius: 14,
          padding: 12,
          marginBottom: 16,
        }}
      />

      {cleanedSearch.length > 0 ? (
        <FlatList
          data={searchedUsers}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                setSelectedUser(item);
                setUserSearch("");
                markConversationRead(item.uid);
              }}
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.30)",
                borderWidth: 1,
                borderColor: "rgba(148, 163, 184, 0.24)",
                borderRadius: 18,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>
                @{item.username}
              </Text>

              <Text style={{ color: "#94A3B8", marginTop: 4 }}>
                Tap to message
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={{ color: "#94A3B8", marginTop: 20 }}>
              No matching users found.
            </Text>
          }
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.user.uid}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                setSelectedUser(item.user);
                markConversationRead(item.user.uid);
              }}
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.30)",
                borderWidth: 1,
                borderColor: "rgba(148, 163, 184, 0.24)",
                borderRadius: 18,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>
                  @{item.user.username}
                </Text>

                {getUnreadCountForUser(item.user.uid) > 0 && (
                  <Text
                    style={{
                      color: "white",
                      backgroundColor: "#DC2626",
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 999,
                      fontWeight: "900",
                      overflow: "hidden",
                    }}
                  >
                    {getUnreadCountForUser(item.user.uid)}
                  </Text>
                )}
              </View>

              <Text numberOfLines={1} style={{ color: "#94A3B8", marginTop: 4 }}>
                {item.lastMessage.fromUid === currentUser.uid ? "You: " : ""}
                {item.lastMessage.text}
              </Text>

              <Text style={{ color: "#64748B", marginTop: 4, fontSize: 12 }}>
                {formatMessageTime(item.lastMessage.createdAt)}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={{ color: "#94A3B8", marginTop: 20 }}>
              No conversations yet. Search a username to start one.
            </Text>
          }
        />
      )}
    </View>
  );
}
