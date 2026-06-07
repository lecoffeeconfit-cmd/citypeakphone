import React, { useState } from "react";
import { Image, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { styles } from "../styles";

type CreatePostScreenProps = {
  addPost: (text: string, anonymous: boolean, imageUri?: string) => void;
  selectedArea: string;
};

export function CreatePostScreen({ addPost, selectedArea }: CreatePostScreenProps) {
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission to access photos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 130 }}>
      <Text style={styles.screenTitle}>Create Post</Text>
      <Text style={styles.screenSubtext}>Posting to {selectedArea}</Text>

      <TextInput
        style={styles.textArea}
        placeholder="What's happening locally?"
        placeholderTextColor="#64748B"
        multiline
        value={text}
        onChangeText={setText}
      />

      <Pressable style={styles.secondaryButton} onPress={pickImage}>
        <Text style={styles.secondaryButtonText}>
          {imageUri ? "Change Photo" : "Add Photo"}
        </Text>
      </Pressable>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}

      <View style={styles.switchRow}>
        <View>
          <Text style={styles.switchLabel}>Post anonymously</Text>
          <Text style={styles.switchHelp}>Hide your username on this post.</Text>
        </View>
        <Switch value={anonymous} onValueChange={setAnonymous} />
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => {
          if (text.trim() || imageUri) {
            addPost(text.trim(), anonymous, imageUri);
            setText("");
            setImageUri(undefined);
            setAnonymous(true);
          }
        }}
      >
        <Text style={styles.primaryButtonText}>Publish</Text>
      </Pressable>
    </ScrollView>
  );
}