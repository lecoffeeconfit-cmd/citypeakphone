import { StyleSheet } from "react-native";

const glassPanel = {
  backgroundColor: "rgba(30, 41, 59, 0.34)",
  borderColor: "rgba(186, 230, 253, 0.26)",
  shadowColor: "#000000",
  shadowOpacity: 0.14,
  shadowRadius: 22,
  shadowOffset: { width: 0, height: 10 },
  elevation: 3,
};

const glassInset = {
  backgroundColor: "rgba(15, 23, 42, 0.28)",
  borderColor: "rgba(186, 230, 253, 0.25)",
};

const glassAccent = {
  backgroundColor: "rgba(19, 34, 56, 0.36)",
  borderColor: "rgba(134, 181, 207, 0.38)",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071326",
    paddingTop: 18,
  },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
  },

  headerTitleArea: {
    width: "100%",
    minWidth: 0,
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1.2,
  },

  subtitle: {
    color: "#329BB8",
    marginTop: 3,
    fontWeight: "800",
  },

  signedInText: {
    color: "#22C55E",
    marginTop: 4,
    fontWeight: "800",
  },

  authScreen: {
    flex: 1,
    backgroundColor: "transparent",
  },

  authContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 28,
  },

  authHero: {
    alignItems: "center",
    marginBottom: 18,
  },

  authLogoMark: {
    width: 154,
    height: 154,
    borderRadius: 40,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
    borderWidth: 2,
    borderColor: "#86B5CF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    overflow: "hidden",
  },

  authLogoImage: {
    width: "100%",
    height: "100%",
  },

  authLogo: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1.4,
  },

  authSubtitle: {
    color: "#86B5CF",
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 320,
  },

  authCard: {
    backgroundColor: "transparent",
    borderWidth: 0,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 26,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },

  authModeSegment: {
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.28)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.22)",
    borderRadius: 999,
    padding: 5,
    marginBottom: 18,
  },

  authModeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  authModeButtonActive: {
    backgroundColor: "#329BB8",
  },

  authModeText: {
    color: "#CBD5E1",
    fontWeight: "900",
  },

  authModeTextActive: {
    color: "#0F172A",
  },

  authTitle: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.2,
  },

  authHelpText: {
    color: "#94A3B8",
    fontWeight: "800",
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 22,
    textAlign: "center",
    maxWidth: 430,
    alignSelf: "center",
  },

  authFieldGroup: {
    marginTop: 14,
  },

  authFieldLabel: {
    color: "#86B5CF",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 7,
  },

  authInput: {
    backgroundColor: "rgba(17, 28, 49, 0.32)",
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(186, 230, 253, 0.34)",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontWeight: "800",
    width: "100%",
  },

  authForgotButton: {
    alignSelf: "flex-end",
    marginTop: 9,
  },

  authForgotText: {
    color: "#86B5CF",
    fontSize: 12,
    fontWeight: "900",
  },

  authPrimaryButton: {
    backgroundColor: "#329BB8",
    borderRadius: 14,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    borderWidth: 1,
    borderColor: "#86B5CF",
  },

  authPrimaryButtonText: {
    color: "#0F172A",
    fontWeight: "900",
    fontSize: 16,
  },

  authSwitchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 16,
  },

  authSwitchText: {
    color: "#CBD5E1",
    fontWeight: "800",
  },

  authSwitchLink: {
    color: "#329BB8",
    fontWeight: "900",
  },

  authDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
  },

  authDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#334155",
  },

  authDividerSymbol: {
    color: "#86B5CF",
    fontWeight: "900",
    fontSize: 14,
    lineHeight: 14,
  },

  authFeatureRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 18,
    flexWrap: "wrap",
  },

  authFeaturePill: {
    minWidth: 92,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(17, 28, 49, 0.30)",
    borderWidth: 1,
    borderColor: "rgba(186, 230, 253, 0.24)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  authFeatureIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  authFeatureText: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  onboardingContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 30,
  },

  onboardingCard: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 26,
  },

  onboardingStepRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 22,
  },

  onboardingStepBadge: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(148, 163, 184, 0.32)",
    alignItems: "center",
    justifyContent: "center",
  },

  onboardingStepBadgeActive: {
    backgroundColor: "#329BB8",
  },

  onboardingStepBadgeText: {
    color: "#CBD5E1",
    fontWeight: "900",
  },

  onboardingStepBadgeTextActive: {
    color: "#0F172A",
  },

  onboardingKicker: {
    color: "#86B5CF",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  onboardingTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 8,
  },

  onboardingBody: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 22,
  },

  onboardingChipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },

  onboardingChoice: {
    ...glassInset,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    maxWidth: "100%",
  },

  onboardingChoiceActive: {
    backgroundColor: "#329BB8",
    borderColor: "#86B5CF",
  },

  onboardingChoiceText: {
    color: "#CBD5E1",
    fontWeight: "900",
    textAlign: "center",
  },

  onboardingChoiceTextActive: {
    color: "#0F172A",
  },

  onboardingButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 24,
  },

  onboardingPrimaryButton: {
    flexGrow: 1,
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: "#329BB8",
    borderWidth: 1,
    borderColor: "#86B5CF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  onboardingPrimaryText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },

  onboardingSecondaryButton: {
    flexGrow: 1,
    minHeight: 54,
    borderRadius: 18,
    ...glassInset,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  onboardingSecondaryText: {
    color: "#BAE6FD",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },

  notificationPreferenceCard: {
    ...glassInset,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginTop: 16,
    width: "100%",
  },

  notificationPreferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
  },

  notificationPreferenceTitle: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },

  notificationPreferenceHelp: {
    color: "#94A3B8",
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 3,
  },

  notificationToggle: {
    minWidth: 54,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.28)",
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: "center",
  },

  notificationToggleActive: {
    backgroundColor: "#329BB8",
    borderColor: "#86B5CF",
  },

  notificationToggleText: {
    color: "#CBD5E1",
    fontWeight: "900",
    fontSize: 12,
  },

  notificationToggleTextActive: {
    color: "#0F172A",
  },

  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8,
    maxWidth: "100%",
  },

  headerPill: {
    ...glassPanel,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    maxWidth: 150,
    flexShrink: 1,
  },

 headerPillText: {
  color: "#FFFFFF",
  fontWeight: "900",
  fontSize: 16,
  textAlign: "center",
},

  feedList: {
    paddingHorizontal: 18,
    paddingBottom: 130,
  },

  searchPill: {
    ...glassPanel,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.24)",
  },

  searchPillText: {
    color: "#D1D5DB",
    fontWeight: "800",
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionHeaderTitle: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },

  sectionHeaderLink: {
    color: "#329BB8",
    fontWeight: "900",
    fontSize: 12,
  },

  feedCategoryCard: {
    width: 150,
    height: 88,
    borderRadius: 20,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    justifyContent: "space-between",
  },

  feedCategoryText: {
    fontWeight: "900",
    fontSize: 13,
    lineHeight: 16,
  },

  feedHeroBanner: {
    backgroundColor: "#17375F",
    borderWidth: 1,
    borderColor: "rgba(134, 181, 207, 0.26)",
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    overflow: "hidden",
  },

  heroMoonGlow: {
    position: "absolute",
    right: -58,
    top: -56,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(248, 180, 0, 0.16)",
  },

  heroMoon: {
    position: "absolute",
    right: -22,
    top: -22,
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: "rgba(255, 217, 102, 0.84)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.34)",
  },

  heroMoonShadow: {
    position: "absolute",
    right: 52,
    top: -18,
    width: 122,
    height: 174,
    borderRadius: 86,
    backgroundColor: "rgba(17, 42, 74, 0.34)",
  },

  heroMoonCraterLarge: {
    position: "absolute",
    left: 34,
    top: 46,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(153, 115, 36, 0.18)",
  },

  heroMoonCraterSmall: {
    position: "absolute",
    right: 38,
    top: 32,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(153, 115, 36, 0.16)",
  },

  heroMoonCraterTiny: {
    position: "absolute",
    right: 48,
    bottom: 38,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(153, 115, 36, 0.15)",
  },

  heroSkyStarOne: {
    position: "absolute",
    left: 28,
    top: 34,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(248, 180, 0, 0.64)",
  },

  heroSkyStarTwo: {
    position: "absolute",
    right: 178,
    top: 76,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255, 217, 102, 0.54)",
  },

  heroSkyStarThree: {
    position: "absolute",
    right: 92,
    bottom: 36,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255, 217, 102, 0.48)",
  },

  feedHeroKicker: {
    color: "white",
    fontWeight: "900",
    fontSize: 12,
  },

  feedHeroTitle: {
    color: "white",
    fontWeight: "900",
    fontSize: 30,
    marginTop: 8,
    letterSpacing: -1,
  },

  feedHeroText: {
    color: "#EAF6FA",
    fontWeight: "700",
    marginTop: 8,
    lineHeight: 21,
  },

  localPostsTitle: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 12,
  },

  heroCard: {
    ...glassPanel,
    padding: 24,
    borderRadius: 30,
    marginBottom: 18,
    borderWidth: 1,
  },

  heroKicker: {
    color: "#329BB8",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },

  heroTitle: {
     color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 6,
    letterSpacing: -1,
  },

  heroText: {
    color: "#64748B",
    marginTop: 10,
    lineHeight: 23,
    fontWeight: "700",
  },

  postCard: {
    ...glassPanel,
    padding: 18,
    borderRadius: 28,
    marginBottom: 18,
    borderWidth: 1,
  },

  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#329BB8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#86B5CF",
  },

  avatarText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  author: {
   color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },

  location: {
    color: "#86B5CF",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "800",
  },

  expirationCard: {
    ...glassAccent,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  expirationInput: {
    width: 118,
    ...glassInset,
    borderWidth: 1,
    borderRadius: 14,
    color: "#FFFFFF",
    fontWeight: "900",
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 12,
  },

  expirationBadge: {
    alignSelf: "flex-start",
    ...glassAccent,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
    marginBottom: 12,
  },

  expirationBadgeExpired: {
    backgroundColor: "#450A0A",
    borderColor: "#991B1B",
  },

  expirationBadgeText: {
    color: "#BAE6FD",
    fontSize: 12,
    fontWeight: "900",
  },

  expirationBadgeTextExpired: {
    color: "#FECACA",
  },

  tagComposerCard: {
    ...glassInset,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginTop: 12,
    marginBottom: 4,
  },

  postTagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 12,
  },

  postTag: {
    backgroundColor: "rgba(19, 34, 56, 0.34)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.24)",
    borderRadius: 999,
    color: "#BAE6FD",
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  postApiMeta: {
    marginTop: 7,
    gap: 3,
  },

  postApiMetaText: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "800",
  },

  more: {
    color: "#64748B",
    fontWeight: "900",
  },

  postText: {
    color: "#E2E8F0",
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 15,
    fontWeight: "700",
  },

  postImage: {
  width: "100%",
  height: 320,
  borderRadius: 24,
  marginBottom: 15,
  backgroundColor: "rgba(15, 23, 42, 0.24)",
},

  postImageGallery: {
    marginBottom: 15,
  },

  postImageGalleryContent: {
    gap: 10,
    paddingRight: 4,
  },

  postImageGalleryItem: {
    width: 290,
    height: 320,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(15, 23, 42, 0.24)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
  },

  postImageGalleryPhoto: {
    width: "100%",
    height: "100%",
  },

  postImageCountBadge: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "rgba(15, 23, 42, 0.82)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
  },

  postImageCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  reactionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  reaction: {
    ...glassInset,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
  },

  reactionSelected: {
    backgroundColor: "#86B5CF",
    borderColor: "#FFFFFF",
  },

  reactionText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  reactionTextSelected: {
    color: "#003B57",
  },

 commentButton: {
  ...glassInset,
  paddingVertical: 10,
  paddingHorizontal: 15,
  borderRadius: 999,
  borderWidth: 1,
},

  commentButtonText: {
  color: "#FFFFFF",
  fontWeight: "900",
},

  statChip: {
    ...glassAccent,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
  },

  statChipText: {
    color: "#BAE6FD",
    fontWeight: "900",
  },

  floatingButton: {
    position: "absolute",
    right: 22,
    bottom: 100,
    width: 68,
    height: 68,
    borderRadius: 999,
    backgroundColor: "#F59E0B",
    borderWidth: 1,
    borderColor: "rgba(254, 243, 199, 0.78)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F59E0B",
    shadowOpacity: 0.38,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  floatingButtonIcon: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
  },

  floatingButtonIconText: {
    color: "#FBBF24",
    fontSize: 38,
    fontWeight: "900",
    marginTop: -5,
  },

  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 105,
  },

  screenTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 6,
    letterSpacing: -0.8,
  },

  screenSubtext: {
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 22,
    fontWeight: "700",
  },

  input: {
  ...glassPanel,
  color: "#FFFFFF",
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 12,
    fontWeight: "700",
  },

  textArea: {
    ...glassPanel,
    color: "#FFFFFF",
    minHeight: 190,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    textAlignVertical: "top",
    fontSize: 16,
    fontWeight: "700",
  },

  pollComposerCard: {
    ...glassInset,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginTop: 14,
  },

  pollComposerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  pollComposerTitle: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },

  pollInput: {
    ...glassPanel,
    color: "#FFFFFF",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    fontWeight: "800",
  },

  pollToggleButton: {
    ...glassPanel,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  pollToggleButtonActive: {
    backgroundColor: "#329BB8",
    borderColor: "#86B5CF",
  },

  pollToggleText: {
    color: "#CBD5E1",
    fontWeight: "900",
    fontSize: 12,
  },

  pollToggleTextActive: {
    color: "#FFFFFF",
  },

  pollRequiredBadge: {
    ...glassAccent,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  pollRequiredBadgeText: {
    color: "#86B5CF",
    fontWeight: "900",
    fontSize: 12,
  },

  postTypeScroller: {
    marginTop: 10,
    marginBottom: 16,
  },

  postTypeGrid: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 4,
  },

  postTypeButton: {
    width: 104,
    minHeight: 88,
    ...glassInset,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },

  postTypeButtonActive: {
    backgroundColor: "#329BB8",
    borderColor: "#86B5CF",
  },

  postTypeEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },

  postTypeText: {
    color: "#CBD5E1",
    fontWeight: "900",
    fontSize: 12,
    lineHeight: 15,
    textAlign: "center",
  },

  postTypeTextActive: {
    color: "#FFFFFF",
  },

  mediaModeCard: {
    ...glassInset,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  mediaModeSegment: {
    flexDirection: "row",
    backgroundColor: "rgba(30, 41, 59, 0.28)",
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.22)",
  },

  mediaModeButton: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 999,
  },

  mediaModeButtonActive: {
    backgroundColor: "#329BB8",
  },

  mediaModeText: {
    color: "#94A3B8",
    fontWeight: "900",
    fontSize: 12,
  },

  mediaModeTextActive: {
    color: "#FFFFFF",
  },

  mediaLimitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },

  mediaLimitPill: {
    ...glassPanel,
    borderWidth: 1,
    borderRadius: 18,
    minWidth: 118,
    flexGrow: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  mediaLimitNumber: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  mediaLimitLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 3,
  },

  messageProfileHeader: {
    ...glassPanel,
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  messageUserRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  messageProfileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#329BB8",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  messageProfileAvatarText: {
    color: "#0F172A",
    fontWeight: "900",
    fontSize: 17,
  },

  messageProfileName: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },

  messageProfileHint: {
    color: "#86B5CF",
    fontWeight: "900",
    marginTop: 2,
  },

  messageProfilePill: {
    ...glassAccent,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 11,
    flexShrink: 0,
  },

  messageProfilePillText: {
    color: "#BAE6FD",
    fontSize: 12,
    fontWeight: "900",
  },

  mediaInfoCard: {
    ...glassInset,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginTop: 10,
  },

  mediaInfoTitle: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  mediaInfoText: {
    color: "#94A3B8",
    fontWeight: "800",
    marginTop: 4,
    lineHeight: 18,
  },

  primaryButton: {
    backgroundColor: "#329BB8",
    padding: 17,
    borderRadius: 22,
    alignItems: "center",
    marginTop: 12,
  },

  primaryButtonText: {
    color: "#1E293B",
    fontWeight: "900",
    fontSize: 16,
  },

  secondaryButton: {
    ...glassPanel,
    padding: 16,
    borderRadius: 22,
    alignItems: "center",
    marginTop: 14,
    borderWidth: 1,
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  previewImage: {
    width: "100%",
    height: 225,
    borderRadius: 24,
    marginTop: 14,
    backgroundColor: "#E5E7EB",
  },

  imagePreviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },

  imagePreviewTile: {
    width: "31%",
    aspectRatio: 1,
    minWidth: 96,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(15, 23, 42, 0.30)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.24)",
  },

  imagePreviewThumb: {
    width: "100%",
    height: "100%",
  },

  imagePreviewBadge: {
    position: "absolute",
    right: 7,
    top: 7,
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.86)",
    alignItems: "center",
    justifyContent: "center",
  },

  imagePreviewBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  smallTitle: {
  color: "#FFFFFF",
    fontWeight: "900",
    marginTop: 24,
    marginBottom: 10,
    fontSize: 17,
  },

  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  chip: {
    ...glassPanel,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
  },

  chipText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  switchRow: {
    marginTop: 18,
    padding: 15,
    borderRadius: 22,
    ...glassPanel,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  switchLabel: {
   color: "#FFFFFF",
    fontWeight: "900",
  },

  switchHelp: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "700",
  },

  profileCard: {
    ...glassPanel,
    padding: 26,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
  },

  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: "#329BB8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#86B5CF",
  },

  profileAvatarText: {
    color: "#1E293B",
    fontSize: 36,
    fontWeight: "900",
  },

  profileName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  followSummaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    width: "100%",
  },

  followSummaryCard: {
    ...glassAccent,
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
  },

  followSummaryNumber: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },

  followSummaryLabel: {
    color: "#BAE6FD",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "uppercase",
  },

  profileActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  followButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#86B5CF",
    backgroundColor: "#329BB8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  followButtonActive: {
    backgroundColor: "rgba(15, 23, 42, 0.34)",
  },

  followButtonText: {
    color: "#0F172A",
    fontWeight: "900",
    fontSize: 16,
  },

  followButtonTextActive: {
    color: "#BAE6FD",
  },

  profileBioFollowButton: {
    backgroundColor: "#329BB8",
    borderWidth: 1,
    borderColor: "#86B5CF",
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 18,
    marginTop: 14,
    alignSelf: "stretch",
    alignItems: "center",
  },

  profileBioFollowButtonActive: {
    backgroundColor: "rgba(15, 23, 42, 0.34)",
  },

  profileBioFollowButtonText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },

  profileBioFollowButtonTextActive: {
    color: "#BAE6FD",
  },

  blockProfileActionCard: {
    backgroundColor: "rgba(69, 10, 10, 0.72)",
    borderRadius: 24,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#991B1B",
    gap: 16,
  },

  blockProfileContentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  blockProfileActionCardActive: {
    backgroundColor: "rgba(20, 83, 45, 0.66)",
    borderColor: "rgba(22, 163, 74, 0.78)",
  },

  blockProfileIconBox: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "rgba(107, 31, 31, 0.68)",
    borderWidth: 1,
    borderColor: "#991B1B",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  blockProfileIconBoxActive: {
    backgroundColor: "rgba(22, 101, 52, 0.58)",
    borderColor: "rgba(134, 239, 172, 0.48)",
  },

  blockProfileIconText: {
    color: "#FCA5A5",
    fontSize: 28,
    fontWeight: "900",
  },

  blockProfileIconTextActive: {
    color: "#BBF7D0",
  },

  blockProfileTextBlock: {
    flex: 1,
    paddingTop: 2,
  },

  blockProfileKicker: {
    color: "#FCA5A5",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  blockProfileKickerActive: {
    color: "#BBF7D0",
  },

  blockProfileTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },

  blockProfileSubtitle: {
    color: "#FECACA",
    fontWeight: "800",
    marginTop: 4,
    lineHeight: 20,
  },

  blockProfileSubtitleActive: {
    color: "#DCFCE7",
  },

  blockProfileButton: {
    backgroundColor: "#DC2626",
    borderRadius: 999,
    minHeight: 54,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: "rgba(254, 202, 202, 0.42)",
    shadowColor: "#7F1D1D",
    shadowOpacity: 0.34,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  blockProfileButtonPillActive: {
    backgroundColor: "#16A34A",
    borderColor: "rgba(187, 247, 208, 0.48)",
    shadowColor: "#14532D",
  },

  blockProfileButtonBusy: {
    shadowOpacity: 0.16,
  },

  blockProfileButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },

  blockProfileButtonTextActive: {
    color: "#FFFFFF",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  statBox: {
  ...glassInset,
  borderRadius: 20,
  padding: 14,
  minWidth: 82,
  alignItems: "center",
  borderWidth: 1,
},

statNumber: {
  color: "#FFFFFF",
  fontWeight: "900",
  fontSize: 18,
},

  statLabel: {
  color: "#CBD5E1",
  fontSize: 12,
  marginTop: 3,
  fontWeight: "800",
},

  analyticsCard: {
    width: "100%",
    backgroundColor: "rgba(11, 18, 32, 0.66)",
    borderWidth: 1,
    borderColor: "rgba(134, 181, 207, 0.34)",
    borderRadius: 22,
    padding: 16,
    marginTop: 18,
  },

  postAuthorProfileHint: {
    color: "#86B5CF",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3,
  },

  analyticsKicker: {
    color: "#86B5CF",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  analyticsTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },

  analyticsGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  analyticsMetric: {
    flex: 1,
    minHeight: 96,
    ...glassAccent,
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  analyticsIcon: {
    color: "#86B5CF",
    fontSize: 18,
    fontWeight: "900",
  },

  analyticsValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 6,
  },

  analyticsLabel: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3,
  },

  savedButton: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
  },

  savedButtonText: {
    color: "#14532D",
  },

  profileViewTabs: {
    ...glassInset,
    borderWidth: 1,
    borderRadius: 20,
    padding: 6,
    marginTop: 16,
    flexDirection: "row",
    gap: 6,
  },

  profileViewTab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  profileViewTabActive: {
    backgroundColor: "#329BB8",
  },

  profileViewTabText: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },

  profileViewTabTextActive: {
    color: "#FFFFFF",
  },

  profileContentPanel: {
    ...glassPanel,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginTop: 14,
  },

  profileContentTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },

  profileContentEmpty: {
    color: "#94A3B8",
    fontWeight: "800",
    lineHeight: 21,
  },

  followingUserCard: {
    ...glassInset,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  followingUserPhoto: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "rgba(15, 23, 42, 0.30)",
  },

  followingUserAvatar: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#329BB8",
    alignItems: "center",
    justifyContent: "center",
  },

  followingUserAvatarText: {
    color: "#0F172A",
    fontWeight: "900",
    fontSize: 19,
  },

  followingUserName: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },

  followingUserBio: {
    color: "#94A3B8",
    fontWeight: "800",
    marginTop: 3,
    lineHeight: 18,
  },

  followingUserCountPill: {
    ...glassAccent,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    minWidth: 74,
  },

  followingUserCountText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  followingUserCountLabel: {
    color: "#BAE6FD",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 2,
  },

  profilePostCard: {
    ...glassInset,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
  },

  profilePostHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

  profilePostKicker: {
    color: "#86B5CF",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  profilePostTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 21,
    marginTop: 3,
  },

  profilePostActionButton: {
    ...glassAccent,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 13,
  },

  profilePostActionText: {
    color: "#BAE6FD",
    fontSize: 12,
    fontWeight: "900",
  },

  profilePostMeta: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 10,
  },

  profilePostTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },

  profilePostTag: {
    backgroundColor: "rgba(19, 34, 56, 0.34)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.24)",
    borderRadius: 999,
    color: "#BAE6FD",
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  accountActionCard: {
    ...glassPanel,
    borderRadius: 24,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  accountIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    ...glassInset,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  accountIconText: {
    color: "#86B5CF",
    fontSize: 25,
    fontWeight: "900",
  },

  accountTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  accountKicker: {
    color: "#86B5CF",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  accountTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 3,
  },

  accountSubtitle: {
    color: "#94A3B8",
    fontWeight: "800",
    marginTop: 2,
  },

  accountLogoutButton: {
    ...glassInset,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexShrink: 0,
  },

  accountLogoutText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  dangerActionCard: {
    backgroundColor: "rgba(69, 10, 10, 0.72)",
    borderRadius: 24,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#991B1B",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  dangerIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(107, 31, 31, 0.68)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#991B1B",
  },

  dangerIconText: {
    color: "#FCA5A5",
    fontSize: 24,
    fontWeight: "900",
  },

  dangerKicker: {
    color: "#FCA5A5",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  dangerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },

  dangerSubtitle: {
    color: "#FECACA",
    fontWeight: "800",
    marginTop: 4,
    lineHeight: 20,
  },

  dangerDeleteButton: {
    backgroundColor: "#DC2626",
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  dangerDeleteText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  legalActionCard: {
    backgroundColor: "rgba(15, 23, 42, 0.34)",
    borderRadius: 24,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  legalIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    ...glassPanel,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  legalIconText: {
    color: "#38BDF8",
    fontSize: 24,
    fontWeight: "900",
  },

  legalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  legalSubtitle: {
    color: "#CBD5E1",
    fontWeight: "800",
    marginTop: 4,
    lineHeight: 20,
  },

  legalButtonColumn: {
    gap: 9,
  },

  legalPillButton: {
    ...glassPanel,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },

  legalPillText: {
    color: "#38BDF8",
    fontWeight: "900",
  },

  legalFootnote: {
    color: "#94A3B8",
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 16,
    marginBottom: 24,
  },

  legalModalText: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "700",
    marginTop: 14,
  },

  muted: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    fontWeight: "700",
  },

  emptyCard: {
    ...glassPanel,
    padding: 25,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },

  bottomNav: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    ...glassPanel,
    borderRadius: 28,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 999,
    elevation: 20,
  },

  navButton: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 58,
    paddingVertical: 8,
    borderRadius: 20,
  },

  navButtonActive: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#F8B400",
  },

  navIconBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconBubbleActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30, 41, 59, 0.34)",
  },

  navIcon: {
    color: "#D1D5DB",
    fontSize: 18,
    fontWeight: "900",
  },

  navIconActive: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  navUnreadDot: {
    position: "absolute",
    right: -2,
    top: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F58A00",
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  navItem: {
    color: "#D1D5DB",
    fontWeight: "900",
    fontSize: 10,
    marginTop: 3,
  },

  navItemActive: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 10,
    marginTop: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.52)",
    justifyContent: "flex-end",
  },

  modalSheet: {
  maxHeight: "92%",
  backgroundColor: "rgba(15, 23, 42, 0.78)",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.28)",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

 modalTitle: {
  color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
  },

  closeButton: {
  color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  emptyCommentCard: {
    ...glassPanel,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
  },

  commentCard: {
    ...glassPanel,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    marginTop: 12,
marginBottom: 12,
  },

  threadedCommentCard: {
    marginLeft: 14,
    marginTop: 12,
    marginBottom: 6,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
    borderLeftWidth: 3,
    borderLeftColor: "#38BDF8",
    paddingLeft: 14,
  },

  threadedCommentCardDeep: {
    marginLeft: 0,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#329BB8",
  },

  commentReplies: {
    marginTop: 6,
  },

  commentAuthor: {
  color: "#FFFFFF",
  fontWeight: "800",
  fontSize: 15,
  marginBottom: 4,
},

  commentText: {
  color: "#E2E8F0",
  fontSize: 15,
  marginBottom: 8,
},

 commentComposer: {
  ...glassPanel,
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    marginTop: 16,
  },

  commentInput: {
  color: "#FFFFFF",
    padding: 10,
  },

  commentControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },

  sendButton: {
    backgroundColor: "#329BB8",
    paddingVertical: 11,
    paddingHorizontal: 17,
    borderRadius: 999,
  },

  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

 previewCommentCard: {
  ...glassPanel,
  borderRadius: 16,
  padding: 14,
  marginBottom: 10,
  borderWidth: 1,
},

  previewCommentMeta: {
  color: "#94A3B8",
  fontSize: 12,
  fontWeight: "600",
},

  viewMoreComments: {
    color: "#329BB8",
    fontWeight: "900",
    marginTop: 10,
  },

  replyCard: {
  ...glassInset,
  borderRadius: 16,
  paddingVertical: 10,
  paddingHorizontal: 12,
  marginLeft: 18,
  marginTop: 8,
  borderWidth: 1,
},

  commentActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 8,
  },

  commentActionText: {
    color: "#329BB8",
    fontWeight: "900",
    fontSize: 12,
  },

  commentActionTextSelected: {
    color: "#F8B400",
  },

  pollCard: {
    ...glassInset,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginBottom: 15,
  },

  saleCard: {
    ...glassInset,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginBottom: 15,
  },

  saleKicker: {
    color: "#F8B400",
    fontWeight: "900",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 6,
  },

  saleTitle: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 19,
    lineHeight: 25,
  },

  salePrice: {
    color: "#86B5CF",
    fontWeight: "900",
    fontSize: 24,
    marginTop: 6,
  },

  saleMeta: {
    color: "#CBD5E1",
    fontWeight: "800",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },

  postFieldsCard: {
    ...glassInset,
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    marginBottom: 15,
    gap: 10,
  },

  postFieldRow: {
    gap: 3,
  },

  postFieldLabel: {
    color: "#86B5CF",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  postFieldValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },

  pollHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  pollKicker: {
    color: "#86B5CF",
    fontWeight: "900",
    fontSize: 12,
    textTransform: "uppercase",
  },

  pollVoteCount: {
    color: "#94A3B8",
    fontWeight: "800",
    fontSize: 12,
  },

  pollQuestion: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 12,
  },

  pollOption: {
    minHeight: 44,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(30, 41, 59, 0.30)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.24)",
  },

  pollOptionSelected: {
    borderColor: "#F8B400",
  },

  pollFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#329BB8",
    opacity: 0.55,
  },

  pollOptionContent: {
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  pollOptionText: {
    color: "#FFFFFF",
    flex: 1,
    fontWeight: "900",
  },

  pollOptionTextSelected: {
    color: "#F8B400",
  },

  pollPercent: {
    color: "#E2E8F0",
    fontWeight: "900",
    minWidth: 40,
    textAlign: "right",
  },

  feedToggleRow: {
    flexDirection: "row",
    ...glassPanel,
    borderRadius: 999,
    padding: 5,
    marginBottom: 16,
    borderWidth: 1,
  },

  feedToggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },

  feedToggleButtonActive: {
    backgroundColor: "#329BB8",
  },

  feedToggleText: {
    color: "#64748B",
    fontWeight: "900",
  },

  feedToggleTextActive: {
    color: "#FFFFFF",
  },

  profilePhoto: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#86B5CF",
  },

  profileBioInput: {
  ...glassPanel,
  color: "#FFFFFF",
    minHeight: 110,
    padding: 15,
    borderRadius: 22,
    borderWidth: 1,
    textAlignVertical: "top",
    marginBottom: 12,
    fontWeight: "700",
  },

  uploadingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "#F8B400",
    borderRadius: 22,
    padding: 14,
    marginTop: 14,
  },

  uploadingText: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
  },

  uploadingSubtext: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
    fontWeight: "700",
  },

  categoryFilterRow: {
    paddingBottom: 16,
    gap: 10,
  },

  categoryFilterChip: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.24)",
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 999,
    marginRight: 10,
  },

  categoryFilterChipActive: {
    backgroundColor: "#329BB8",
    borderColor: "#329BB8",
  },

  categoryFilterText: {
    color: "#64748B",
    fontWeight: "900",
  },

  categoryFilterTextActive: {
    color: "#FFFFFF",
  },

replyAuthor: {
  color: "#FFFFFF",
  fontWeight: "800",
  fontSize: 14,
  marginBottom: 4,
},

replyText: {
  color: "#E2E8F0",
  fontSize: 15,
  marginBottom: 6,
},

replyMeta: {
  color: "#94A3B8",
  fontSize: 12,
  fontWeight: "600",
},

logoutButton: {
  marginTop: 14,
  backgroundColor: "#EF4444",
  paddingVertical: 14,
  borderRadius: 999,
  alignItems: "center",
},

logoutButtonText: {
  color: "#FFFFFF",
  fontWeight: "700",
  fontSize: 16,
},
});
