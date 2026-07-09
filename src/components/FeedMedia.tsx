import React, { memo, useMemo } from "react";
import { Image, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles";
import type { MediaKind, MediaType } from "../types";
import { devLog, getStableImageSource } from "../utils/media";

type FeedMediaProps = {
  mediaType?: MediaType | "";
  thumbnailUrls?: string[];
  posterUrl?: string;
  mediaKind?: MediaKind;
  onOpenImage: (index: number) => void;
  onOpenVideo: () => void;
};

function FeedMediaComponent({
  mediaType,
  thumbnailUrls = [],
  posterUrl,
  mediaKind,
  onOpenImage,
  onOpenVideo,
}: FeedMediaProps) {
  const webLazyImageProps = Platform.OS === "web" ? ({ loading: "lazy" } as any) : {};
  const posterSource = useMemo(
    () => getStableImageSource(posterUrl, "feed video poster"),
    [posterUrl]
  );
  const thumbnailSources = useMemo(
    () =>
      thumbnailUrls
        .map((uri, index) =>
          getStableImageSource(uri, `feed image thumbnail ${index + 1}`)
        )
        .filter((source): source is { uri: string } => !!source),
    [thumbnailUrls]
  );

  if (mediaType === "video") {
    return (
      <Pressable onPress={onOpenVideo}>
        <View
          style={{
            height: 220,
            borderRadius: 24,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#334155",
            marginBottom: 15,
            position: "relative",
            backgroundColor: "rgba(15, 23, 42, 0.30)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {posterSource && (
            <Image
              {...webLazyImageProps}
              source={posterSource}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
              }}
              resizeMode="cover"
              onLoad={() => devLog("[media] loaded feed video poster", posterUrl)}
              onError={() => devLog("[media] failed feed video poster", posterUrl)}
            />
          )}
          {posterSource && (
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.28)",
              }}
            />
          )}
          <Text style={{ color: "white", fontSize: 42, fontWeight: "900" }}>
            ▶
          </Text>
          <Text
            style={{
              color: "#CBD5E1",
              fontWeight: "900",
              marginTop: 8,
            }}
          >
            Tap to load video
          </Text>
          {mediaKind === "tutorial" && (
            <Text
              style={{
                color: "#86B5CF",
                fontWeight: "900",
                marginTop: 5,
                fontSize: 12,
              }}
            >
              Tutorial · opens on demand
            </Text>
          )}

          <View
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "rgba(0,0,0,0.75)",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "900",
                fontSize: 12,
              }}
            >
              {mediaKind === "tutorial" ? "▶ TUTORIAL" : "▶ VIDEO"}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  if (mediaType !== "image" || thumbnailSources.length === 0) return null;

  if (thumbnailSources.length > 1) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.postImageGallery}
        contentContainerStyle={styles.postImageGalleryContent}
      >
        {thumbnailSources.map((source, index) => (
          <Pressable
            key={`${source.uri}-${index}`}
            style={styles.postImageGalleryItem}
            onPress={() => onOpenImage(index)}
          >
            <Image
              {...webLazyImageProps}
              source={source}
              style={styles.postImageGalleryPhoto}
              resizeMode="cover"
              onLoad={() => devLog("[media] loaded feed gallery thumbnail", source.uri)}
              onError={() => devLog("[media] failed feed gallery thumbnail", source.uri)}
            />
            <View style={styles.postImageCountBadge}>
              <Text style={styles.postImageCountText}>
                {index + 1}/{thumbnailSources.length}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  return (
    <Pressable onPress={() => onOpenImage(0)}>
      <Image
        {...webLazyImageProps}
        source={thumbnailSources[0]}
        style={styles.postImage}
        resizeMode="contain"
        onLoad={() =>
          devLog("[media] loaded feed image thumbnail", thumbnailSources[0].uri)
        }
        onError={() =>
          devLog("[media] failed feed image thumbnail", thumbnailSources[0].uri)
        }
      />
    </Pressable>
  );
}

export const FeedMedia = memo(FeedMediaComponent);
