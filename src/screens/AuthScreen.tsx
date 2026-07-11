import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { CityBackdrop } from "../components/CityBackdrop";
import { styles } from "../styles";

type AuthScreenProps = {
  onAuthSuccess: () => void;
};

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
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
  followers: [],
  following: [],
  followerCount: 0,
  followingCount: 0,
  blockedUserIds: [],
  hasCompletedOnboarding: false,
  selectedArea: "Long Beach",
  interests: [],
  notificationsEnabled: false,
  notificationPreferences: {
    messages: true,
    comments: true,
    follows: true,
    localAlerts: true,
  },
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

  async function handlePasswordReset() {
    const cleanedEmail = email.trim();

    if (!cleanedEmail) {
      alert("Enter your email address first.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, cleanedEmail);
      alert("Password reset email sent. Check your inbox.");
    } catch {
      alert("A password reset email could not be sent. Check the address and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <CityBackdrop />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.authScreen}
          contentContainerStyle={styles.authContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.authCard}>
            <View style={styles.authHero}>
              <View style={styles.authLogoMark}>
                <Image
                  source={require("../../assets/icon.png")}
                  style={styles.authLogoImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.authLogo}>CityPeak</Text>
            </View>

            <Text style={styles.authTitle}>
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </Text>
            <Text style={styles.authHelpText}>
              {mode === "signup"
                ? "Local city feeds, posts, events, deals, alerts, and conversations."
                : "Sign in to catch up on your city feed."}
            </Text>

            {mode === "signup" && (
              <View style={styles.authFieldGroup}>
                <Text style={styles.authFieldLabel}>Username</Text>
                <TextInput
                  style={styles.authInput}
                  placeholder="Choose a username"
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

            {mode === "login" && (
              <Pressable style={styles.authForgotButton} onPress={handlePasswordReset} disabled={loading}>
                <Text style={styles.authForgotText}>Forgot password?</Text>
              </Pressable>
            )}

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

            <View style={styles.authSwitchRow}>
              <Text style={styles.authSwitchText}>
                {mode === "signup"
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </Text>
              <Pressable
                onPress={() => setMode(mode === "signup" ? "login" : "signup")}
                disabled={loading}
              >
                <Text style={styles.authSwitchLink}>
                  {mode === "signup" ? "Log in" : "Sign up"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.authDividerRow}>
              <View style={styles.authDividerLine} />
              <Text style={styles.authDividerSymbol}>♥</Text>
              <View style={styles.authDividerLine} />
            </View>

            <View style={styles.authFeatureRow}>
              {[
                { label: "Feed", icon: "⌂" },
                { label: "Post", icon: "+" },
                { label: "Chat", icon: "✦" },
              ].map((item) => (
                <View key={item.label} style={styles.authFeaturePill}>
                  <Text style={styles.authFeatureIcon}>{item.icon}</Text>
                  <Text style={styles.authFeatureText}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
