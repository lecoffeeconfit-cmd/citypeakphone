import React from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "../styles";
import type { Tab } from "../types";

type BottomNavProps = {
  tab: Tab;
  setTab: (tab: Tab) => void;
  unreadMessagesCount?: number;
};

export function BottomNav({
  tab,
  setTab,
  unreadMessagesCount = 0,
}: BottomNavProps) {
  const items: { key: Tab; label: string; icon: string }[] = [
    { key: "feed", label: "Feed", icon: "⌂" },
    { key: "search", label: "Scan", icon: "◇" },
    { key: "post", label: "Peak", icon: "+" },
    { key: "messages", label: "DMs", icon: "✦" },
    { key: "profile", label: "Me", icon: "◉" },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => {
        const isActive = tab === item.key;
        const showUnread = item.key === "messages" && unreadMessagesCount > 0;

        return (
          <Pressable
            key={item.key}
            onPress={() => setTab(item.key)}
            style={isActive ? styles.navButtonActive : styles.navButton}
          >
            <View style={isActive ? styles.navIconBubbleActive : styles.navIconBubble}>
              <Text style={isActive ? styles.navIconActive : styles.navIcon}>
                {item.icon}
              </Text>

              {showUnread && <View style={styles.navUnreadDot} />}
            </View>

            <Text style={isActive ? styles.navItemActive : styles.navItem}>
              {showUnread ? `${item.label} ${unreadMessagesCount}` : item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}