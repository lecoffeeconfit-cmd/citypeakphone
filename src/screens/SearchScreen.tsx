import React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../styles";
import type { Post, Tab } from "../types";
import { cityIndex } from "../data/cityIndex";

type SearchScreenProps = {
  search: string;
  setSearch: (value: string) => void;
  setSelectedArea: (value: string) => void;
  setTab: (tab: Tab) => void;
  posts: Post[];
};

function normalizeArea(value: string) {
  const cleaned = value.trim().toLowerCase();

  const match = cityIndex.find((area) => {
    return (
      area.city.toLowerCase() === cleaned ||
      `${area.city}, ${area.state}`.toLowerCase() === cleaned
    );
  });

  if (match) return match.city;

  return value.trim();
}

export function SearchScreen({
  search,
  setSearch,
  setSelectedArea,
  setTab,
  posts,
}: SearchScreenProps) {
  function chooseArea(value: string) {
    setSelectedArea(normalizeArea(value));
    setSearch("");
    setTab("feed");
  }

  function getRecentPostCount(city: string) {
    return posts.filter((post) => {
      const location = String(post.location || "").toLowerCase();
      return location === city.toLowerCase();
    }).length;
  }

  const filteredCities = cityIndex
    .filter((area) => {
      const q = search.trim().toLowerCase();

      if (!q) return true;

      return (
        area.city.toLowerCase().includes(q) ||
        area.state.toLowerCase().includes(q) ||
        `${area.city}, ${area.state}`.toLowerCase().includes(q)
      );
    })
    .sort(
      (a, b) =>
        getRecentPostCount(b.city) - getRecentPostCount(a.city)
    );

  const popularCities = cityIndex
    .filter((area) => getRecentPostCount(area.city) > 0)
    .slice(0, 8);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 130 }}>
      <Text style={styles.screenTitle}>Search local feeds</Text>

      <Text style={styles.screenSubtext}>
        Search by city name to discover conversations happening nearby.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Search your city... e.g. Long Beach"
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

      <Text style={styles.smallTitle}>Popular Cities</Text>

      <View style={styles.chipWrap}>
        {popularCities.map((area) => {
          const count = getRecentPostCount(area.city);

          return (
            <Pressable
              key={`${area.city}-${area.state}`}
              style={styles.chip}
              onPress={() => chooseArea(area.city)}
            >
              <Text style={styles.chipText}>
                {area.city}, {area.state}
              </Text>

              <Text style={styles.switchHelp}>
                {count} recent posts
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.smallTitle}>Explore Cities</Text>

      <View style={{ gap: 10 }}>
        {filteredCities.map((area) => {
          const count = getRecentPostCount(area.city);

          return (
            <Pressable
              key={`${area.city}-${area.state}-index`}
              style={styles.postCard}
              onPress={() => chooseArea(area.city)}
            >
              <Text style={styles.author}>
                {area.city}, {area.state}
              </Text>

              <Text style={styles.location}>
                City feed
              </Text>

              <Text style={styles.viewMoreComments}>
                {count} posts in the last 24 hours
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
