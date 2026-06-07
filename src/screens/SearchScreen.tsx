import React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../styles";
import type { Tab } from "../types";

type SearchScreenProps = {
  search: string;
  setSearch: (value: string) => void;
  setSelectedArea: (value: string) => void;
  setTab: (tab: Tab) => void;
};

export function SearchScreen({
  search,
  setSearch,
  setSelectedArea,
  setTab,
}: SearchScreenProps) {
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