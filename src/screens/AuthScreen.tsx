import React, { useState } from "react";
import { Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
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
      <View style={styles.screen}>
        <Text style={styles.logo}>CityPeak</Text>
        <Text style={styles.subtitle}>Create your local city account</Text>

        <Text style={styles.screenTitle}>
          {mode === "signup" ? "Create Account" : "Log In"}
        </Text>

        {mode === "signup" && (
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#64748B"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#64748B"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#64748B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable style={styles.primaryButton} onPress={handleAuth}>
          <Text style={styles.primaryButtonText}>
            {loading
              ? "Loading..."
              : mode === "signup"
              ? "Sign Up"
              : "Log In"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => setMode(mode === "signup" ? "login" : "signup")}
        >
          <Text style={styles.secondaryButtonText}>
            {mode === "signup"
              ? "Already have an account? Log in"
              : "Need an account? Sign up"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}