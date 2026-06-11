import React from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "../styles";
import type { Tab } from "../types";

type BottomNavProps = {
  tab: Tab;
  setTab: (tab: Tab) => void;
  unreadMessagesCount?: number;
};

export function BottomNav({ tab, setTab, unreadMessagesCount = 0 }: BottomNavProps) {  const items: { key: Tab; label: string }[] = [
    { key: "feed", label: "Feed" },
    { key: "search", label: "Search" },
    { key: "post", label: "Post" },
    { key: "messages", label: "Messages" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={() => setTab(item.key)}
          style={styles.navButton}
        >
          <Text style={tab === item.key ? styles.navIconActive : styles.navIcon}>
            {item.key === "feed"
              ? "🏠"
              : item.key === "search"
              ? "🔍"
              : item.key === "post"
              ? "➕"
              : item.key === "messages"
              ? "💬"
              : "👤"}
          </Text>

         <Text style={tab === item.key ? styles.navItemActive : styles.navItem}>
  {item.key === "messages" && unreadMessagesCount > 0
    ? `${item.label} ${unreadMessagesCount}`
    : item.label}
</Text>
        </Pressable>
      ))}
    </View>
  );
}