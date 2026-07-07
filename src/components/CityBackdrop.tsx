import React from "react";
import { StyleSheet, View } from "react-native";

const buildings = [
  { left: "-3%", width: "18%", height: 226, windows: 22 },
  { left: "13%", width: "16%", height: 186, windows: 16 },
  { left: "28%", width: "20%", height: 270, windows: 30 },
  { left: "48%", width: "16%", height: 214, windows: 20 },
  { left: "63%", width: "22%", height: 308, windows: 34 },
  { left: "84%", width: "19%", height: 246, windows: 26 },
] as const;

const stars = [
  { left: "10%", top: "12%" },
  { left: "22%", top: "18%" },
  { left: "38%", top: "10%" },
  { left: "55%", top: "15%" },
  { left: "76%", top: "11%" },
  { left: "88%", top: "20%" },
  { left: "14%", top: "31%" },
  { left: "30%", top: "38%" },
  { left: "46%", top: "28%" },
  { left: "64%", top: "35%" },
  { left: "82%", top: "42%" },
  { left: "92%", top: "33%" },
  { left: "8%", top: "48%" },
  { left: "52%", top: "50%" },
  { left: "18%", top: "58%" },
  { left: "35%", top: "64%" },
  { left: "58%", top: "60%" },
  { left: "73%", top: "67%" },
  { left: "90%", top: "56%" },
] as const;

function Building({
  building,
  index,
}: {
  building: (typeof buildings)[number];
  index: number;
}) {
  return (
    <View
      style={[
        styles.building,
        {
          left: building.left,
          width: building.width,
          height: building.height,
        },
      ]}
    >
      <View style={styles.windowGrid}>
        {Array.from({ length: building.windows }).map((_, windowIndex) => (
          <View
            key={`${index}-${windowIndex}`}
            style={[
              styles.window,
              windowIndex % 3 === 0 && styles.windowWarm,
              windowIndex % 5 === 0 && styles.windowBright,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export function CityBackdrop() {
  return (
    <View pointerEvents="none" style={styles.backdrop}>
      <View style={styles.skyWash} />
      <View style={styles.lightStripHigh} />
      <View style={styles.lightStripLow} />

      {stars.map((star, index) => (
        <View key={index} style={[styles.star, star]} />
      ))}

      <View style={styles.skyline}>
        {buildings.map((building, index) => (
          <Building key={index} building={building} index={index} />
        ))}
      </View>
      <View style={styles.groundFade} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#071326",
    overflow: "hidden",
  },
  skyWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7, 19, 38, 0.72)",
  },
  star: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(248, 180, 0, 0.72)",
  },
  lightStripHigh: {
    position: "absolute",
    left: -70,
    right: -45,
    top: 70,
    height: 34,
    borderRadius: 18,
    backgroundColor: "rgba(134, 181, 207, 0.07)",
    transform: [{ rotate: "-7deg" }],
  },
  lightStripLow: {
    position: "absolute",
    left: -28,
    right: -92,
    top: 178,
    height: 38,
    borderRadius: 20,
    backgroundColor: "rgba(50, 155, 184, 0.06)",
    transform: [{ rotate: "5deg" }],
  },
  skyline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 360,
  },
  building: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "rgba(2, 6, 23, 0.78)",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(42, 111, 151, 0.22)",
    overflow: "hidden",
  },
  windowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 18,
  },
  window: {
    width: 5,
    height: 9,
    borderRadius: 2,
    backgroundColor: "rgba(50, 155, 184, 0.58)",
  },
  windowWarm: {
    backgroundColor: "rgba(248, 180, 0, 0.82)",
  },
  windowBright: {
    backgroundColor: "rgba(255, 217, 102, 0.95)",
  },
  groundFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    backgroundColor: "rgba(2, 6, 23, 0.58)",
  },
});
