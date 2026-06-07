import React from "react";
import { Text, TextInput, View } from "react-native";
import { styles } from "../styles";

type ProfileScreenProps = {
  username: string;
  setUsername: (value: string) => void;
};

export function ProfileScreen({ username, setUsername }: ProfileScreenProps) {
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