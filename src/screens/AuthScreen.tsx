import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { styles } from "../styles";

type AuthScreenProps = {
  onAuthSuccess: () => void;
};

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    try {
      setLoading(true);

      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        const cleanedUsername = username.trim() || email.trim().split("@")[0];

await setDoc(doc(db, "users", userCredential.user.uid), {
  uid: userCredential.user.uid,
  email: email.trim().toLowerCase(),
  username: cleanedUsername,
  usernameLower: cleanedUsername.toLowerCase(),
  createdAt: serverTimestamp(),
});
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }

      onAuthSuccess();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.authScreen}
          contentContainerStyle={styles.authContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.authHero}>
            <View style={styles.authLogoMark}>
              <Image
                source={require("../../assets/icon.png")}
                style={styles.authLogoImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.authLogo}>CityPeak</Text>
            <Text style={styles.authSubtitle}>
              Local city feeds, posts, events, deals, alerts, and conversations.
            </Text>
          </View>

          <View style={styles.authCard}>
            <View style={styles.authModeSegment}>
              {(["signup", "login"] as const).map((item) => {
                const active = mode === item;

                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.authModeButton,
                      active && styles.authModeButtonActive,
                    ]}
                    onPress={() => setMode(item)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.authModeText,
                        active && styles.authModeTextActive,
                      ]}
                    >
                      {item === "signup" ? "Create" : "Log in"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.authTitle}>
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </Text>
            <Text style={styles.authHelpText}>
              {mode === "signup"
                ? "Pick a username and join the local conversation."
                : "Sign in to catch up on your city feed."}
            </Text>

            {mode === "signup" && (
              <View style={styles.authFieldGroup}>
                <Text style={styles.authFieldLabel}>Username</Text>
                <TextInput
                  style={styles.authInput}
                  placeholder="yourname"
                  placeholderTextColor="#64748B"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            )}

            <View style={styles.authFieldGroup}>
              <Text style={styles.authFieldLabel}>Email</Text>
              <TextInput
                style={styles.authInput}
                placeholder="you@example.com"
                placeholderTextColor="#64748B"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            <View style={styles.authFieldGroup}>
              <Text style={styles.authFieldLabel}>Password</Text>
              <TextInput
                style={styles.authInput}
                placeholder="Enter your password"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete={mode === "signup" ? "new-password" : "password"}
                editable={!loading}
              />
            </View>

            <Pressable
              style={[styles.authPrimaryButton, loading && { opacity: 0.65 }]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.authPrimaryButtonText}>
                {loading
                  ? "Please wait..."
                  : mode === "signup"
                  ? "Create Account"
                  : "Log In"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.authInfoRow}>
            <View style={styles.authInfoPill}>
              <Text style={styles.authInfoText}>📍 Local</Text>
            </View>
            <View style={styles.authInfoPill}>
              <Text style={styles.authInfoText}>🔒 Secure</Text>
            </View>
            <View style={styles.authInfoPill}>
              <Text style={styles.authInfoText}>💬 Social</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
