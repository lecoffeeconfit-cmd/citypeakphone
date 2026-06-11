import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingTop: 18,
  },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    color: "#003B57",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1.2,
  },

  subtitle: {
    color: "#329BB8",
    marginTop: 3,
    fontWeight: "800",
  },

  headerPill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8EAF2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    maxWidth: 150,
  },

  headerPillText: {
    color: "#003B57",
    fontWeight: "900",
  },

  feedList: {
    paddingHorizontal: 18,
    paddingBottom: 130,
  },

  searchPill: {
    backgroundColor: "#1E293B",
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#D8EAF2",
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
    color: "#111827",
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
    backgroundColor: "#1E3A5F",
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    overflow: "hidden",
  },

  heroCircleYellow: {
    position: "absolute",
    right: -40,
    top: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#F8B400",
    opacity: 0.5,
  },

  heroCircleOrange: {
    position: "absolute",
    left: -35,
    bottom: -45,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#F58A00",
    opacity: 0.35,
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
    backgroundColor: "#1E293B",
    padding: 24,
    borderRadius: 30,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  heroKicker: {
    color: "#329BB8",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },

  heroTitle: {
    color: "#111827",
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
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 28,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    color: "#111827",
    fontWeight: "900",
    fontSize: 15,
  },

  location: {
    color: "#329BB8",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "800",
  },

  more: {
    color: "#64748B",
    fontWeight: "900",
  },

  postText: {
    color: "#1F2937",
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 15,
    fontWeight: "700",
  },

  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 24,
    marginBottom: 15,
    backgroundColor: "#E5E7EB",
  },

  reactionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  reaction: {
    backgroundColor: "#F4F6F8",
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D8EAF2",
  },

  reactionText: {
    color: "#003B57",
    fontWeight: "900",
  },

  commentButton: {
    backgroundColor: "#329BB8",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#329BB8",
  },

  commentButtonText: {
    color: "#1E293B",
    fontWeight: "900",
  },

  floatingButton: {
    position: "absolute",
    right: 22,
    bottom: 102,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F58A00",
    alignItems: "center",
    justifyContent: "center",
  },

  floatingButtonText: {
    color: "#1E293B",
    fontSize: 38,
    fontWeight: "800",
    marginTop: -4,
  },

  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 105,
  },

  screenTitle: {
    color: "#111827",
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
    backgroundColor: "#1E293B",
    color: "#111827",
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D8EAF2",
    marginBottom: 12,
    fontWeight: "700",
  },

  textArea: {
    backgroundColor: "#1E293B",
    color: "#111827",
    minHeight: 190,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D8EAF2",
    textAlignVertical: "top",
    fontSize: 16,
    fontWeight: "700",
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
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 22,
    alignItems: "center",
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#D8EAF2",
  },

  secondaryButtonText: {
    color: "#003B57",
    fontWeight: "900",
  },

  previewImage: {
    width: "100%",
    height: 225,
    borderRadius: 24,
    marginTop: 14,
    backgroundColor: "#E5E7EB",
  },

  smallTitle: {
    color: "#111827",
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
    backgroundColor: "#1E293B",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D8EAF2",
  },

  chipText: {
    color: "#003B57",
    fontWeight: "900",
  },

  switchRow: {
    marginTop: 18,
    padding: 15,
    borderRadius: 22,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#D8EAF2",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  switchLabel: {
    color: "#111827",
    fontWeight: "900",
  },

  switchHelp: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "700",
  },

  profileCard: {
    backgroundColor: "#1E293B",
    padding: 26,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    color: "#111827",
    fontSize: 24,
    fontWeight: "900",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  statBox: {
    backgroundColor: "#F4F6F8",
    borderRadius: 20,
    padding: 14,
    minWidth: 82,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8EAF2",
  },

  statNumber: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 18,
  },

  statLabel: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "800",
  },

  muted: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    fontWeight: "700",
  },

  emptyCard: {
    backgroundColor: "#1E293B",
    padding: 25,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  emptyTitle: {
    color: "#111827",
    fontSize: 21,
    fontWeight: "900",
  },

  bottomNav: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "#1E293B",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D8EAF2",
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
    backgroundColor: "#1E293B",
  },

  navIcon: {
    color: "#D1D5DB",
    fontSize: 18,
    fontWeight: "900",
  },

  navIconActive: {
    color: "#003B57",
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
    color: "#003B57",
    fontWeight: "900",
    fontSize: 10,
    marginTop: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.45)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    maxHeight: "92%",
    backgroundColor: "#F4F6F8",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D8EAF2",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  modalTitle: {
    color: "#111827",
    fontSize: 23,
    fontWeight: "900",
  },

  closeButton: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "900",
  },

  emptyCommentCard: {
    backgroundColor: "#1E293B",
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  commentCard: {
    backgroundColor: "#1E293B",
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },

  commentAuthor: {
    color: "#111827",
    fontWeight: "900",
    marginBottom: 5,
  },

  commentText: {
    color: "#1F2937",
    lineHeight: 20,
    fontWeight: "700",
  },

  commentComposer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 16,
  },

  commentInput: {
    color: "#111827",
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
    backgroundColor: "#F4F6F8",
    borderRadius: 20,
    padding: 11,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  previewCommentMeta: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "800",
  },

  viewMoreComments: {
    color: "#329BB8",
    fontWeight: "900",
    marginTop: 10,
  },

  replyCard: {
    backgroundColor: "#F4F6F8",
    borderRadius: 20,
    padding: 10,
    marginLeft: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  commentActionRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
  },

  commentActionText: {
    color: "#329BB8",
    fontWeight: "900",
    fontSize: 12,
  },

  feedToggleRow: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 999,
    padding: 5,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D8EAF2",
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
    backgroundColor: "#FFFFFF",
    color: "#111827",
    minHeight: 110,
    padding: 15,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D8EAF2",
    textAlignVertical: "top",
    marginBottom: 12,
    fontWeight: "700",
  },

  uploadingCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F8B400",
    borderRadius: 22,
    padding: 14,
    marginTop: 14,
  },

  uploadingText: {
    color: "#111827",
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8EAF2",
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
});