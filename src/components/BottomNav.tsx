import React from "react";
import { Pressable, Text, View } from "react-native";
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
    { key: "feed", label: "Community", icon: "🏠" },
    { key: "city", label: "Explore", icon: "🏙️" },
    { key: "post", label: "Post", icon: "➕" },
    { key: "messages", label: "Messages", icon: "💬" },
    { key: "profile", label: "Me", icon: "👤" },
  ];

  return (
    <View
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 16,
        backgroundColor: "#111827",
        borderRadius: 28,
        borderWidth: 2,
        borderColor: "#22D3EE",
        paddingVertical: 10,
        paddingHorizontal: 6,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 999,
        elevation: 20,
      }}
    >
      {items.map((item) => {
        const isActive = tab === item.key;
        const showUnread =
          item.key === "messages" && unreadMessagesCount > 0;

        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={`${item.label} tab`}
            accessibilityState={{ selected: isActive }}
            onPress={() => setTab(item.key)}
            style={{
              flex: 1,
              minWidth: 0,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isActive ? "#22D3EE" : "transparent",
              borderRadius: 20,
              paddingVertical: 9,
              paddingHorizontal: 6,
            }}
          >
            <View style={{ position: "relative" }}>
              <Text style={{ fontSize: 19 }}>{item.icon}</Text>

              {showUnread && (
                <View
                  style={{
                    position: "absolute",
                    right: -7,
                    top: -5,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#EF4444",
                  }}
                />
              )}
            </View>

            <Text
              style={{
                color: isActive ? "#020617" : "#FFFFFF",
                fontWeight: "900",
              fontSize: 10,
              marginTop: 3,
              textAlign: "center",
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
          >
              {showUnread
                ? `${item.label} ${unreadMessagesCount}`
                : item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
