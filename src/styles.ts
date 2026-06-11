import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F0D",
    paddingTop: 18,
  },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    color: "#F8FAFC",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.2,
  },

  subtitle: {
    color: "#9CA3AF",
    marginTop: 4,
    fontWeight: "600",
  },

  headerPill: {
    backgroundColor: "#141A17",
    borderWidth: 1,
    borderColor: "#26342D",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    maxWidth: 150,
  },

  headerPillText: {
    color: "#B9F24A",
    fontWeight: "900",
  },

  feedList: {
    paddingHorizontal: 18,
    paddingBottom: 125,
  },

  heroCard: {
    backgroundColor: "#121914",
    padding: 22,
    borderRadius: 34,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#26342D",
    shadowColor: "#B9F24A",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  heroKicker: {
    color: "#B9F24A",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },

  heroTitle: {
    color: "#F8FAFC",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 5,
    letterSpacing: -1,
  },

  heroText: {
    color: "#A1A1AA",
    marginTop: 9,
    lineHeight: 22,
    fontWeight: "600",
  },

  postCard: {
    backgroundColor: "#121914",
    padding: 16,
    borderRadius: 32,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#253228",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#B9F24A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E7FF8F",
  },

  avatarText: {
    color: "#111827",
    fontWeight: "900",
  },

  author: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 15,
  },

  location: {
    color: "#7C867F",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "700",
  },

  more: {
    color: "#7C867F",
    fontWeight: "900",
  },

  postText: {
    color: "#F8FAFC",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 14,
    fontWeight: "600",
  },

  postImage: {
    width: "100%",
    height: 240,
    borderRadius: 26,
    marginBottom: 14,
    backgroundColor: "#1B241F",
  },

  reactionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  reaction: {
    backgroundColor: "#1A211D",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2B3A31",
  },

  reactionText: {
    color: "#E5E7EB",
    fontWeight: "900",
  },

  commentButton: {
    backgroundColor: "#B9F24A",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E7FF8F",
  },

  commentButtonText: {
    color: "#111827",
    fontWeight: "900",
  },

  floatingButton: {
    position: "absolute",
    right: 22,
    bottom: 98,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#B9F24A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B9F24A",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  floatingButtonText: {
    color: "#111827",
    fontSize: 38,
    fontWeight: "700",
    marginTop: -4,
  },

  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  screenTitle: {
    color: "#F8FAFC",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 6,
    letterSpacing: -0.8,
  },

  screenSubtext: {
    color: "#A1A1AA",
    marginBottom: 16,
    lineHeight: 21,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#121914",
    color: "#F8FAFC",
    padding: 15,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#26342D",
    marginBottom: 12,
    fontWeight: "700",
  },

  textArea: {
    backgroundColor: "#121914",
    color: "#F8FAFC",
    minHeight: 190,
    padding: 15,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#26342D",
    textAlignVertical: "top",
    fontSize: 16,
    fontWeight: "600",
  },

  primaryButton: {
    backgroundColor: "#B9F24A",
    padding: 16,
    borderRadius: 22,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#B9F24A",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  primaryButtonText: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 16,
  },

  secondaryButton: {
    backgroundColor: "#171F1A",
    padding: 15,
    borderRadius: 22,
    alignItems: "center",
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#2B3A31",
  },

  secondaryButtonText: {
    color: "#E5E7EB",
    fontWeight: "900",
  },

  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 26,
    marginTop: 14,
    backgroundColor: "#1B241F",
  },

  smallTitle: {
    color: "#F8FAFC",
    fontWeight: "900",
    marginTop: 24,
    marginBottom: 10,
    fontSize: 16,
  },

  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  chip: {
    backgroundColor: "#121914",
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#26342D",
  },

  chipText: {
    color: "#E5E7EB",
    fontWeight: "900",
  },

  switchRow: {
    marginTop: 18,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "#121914",
    borderWidth: 1,
    borderColor: "#26342D",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  switchLabel: {
    color: "#F8FAFC",
    fontWeight: "900",
  },

  switchHelp: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 3,
  },

  profileCard: {
    backgroundColor: "#121914",
    padding: 24,
    borderRadius: 34,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#26342D",
  },

  profileAvatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "#B9F24A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#E7FF8F",
  },

  profileAvatarText: {
    color: "#111827",
    fontSize: 34,
    fontWeight: "900",
  },

  profileName: {
    color: "#F8FAFC",
    fontSize: 23,
    fontWeight: "900",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  statBox: {
    backgroundColor: "#1A211D",
    borderRadius: 22,
    padding: 14,
    minWidth: 80,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2B3A31",
  },

  statNumber: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 18,
  },

  statLabel: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "700",
  },

  muted: {
    color: "#A1A1AA",
    textAlign: "center",
    marginTop: 6,
    fontWeight: "600",
  },

  emptyCard: {
    backgroundColor: "#121914",
    padding: 24,
    borderRadius: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#26342D",
  },

  emptyTitle: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "900",
  },

  bottomNav: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "#111713",
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "#2B3A31",
    paddingVertical: 11,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  navButton: {
    alignItems: "center",
    minWidth: 62,
  },

  navIcon: {
    fontSize: 18,
    opacity: 0.45,
  },

  navIconActive: {
    fontSize: 21,
  },

  navItem: {
    color: "#6B7280",
    fontWeight: "900",
    fontSize: 11,
    marginTop: 2,
  },

  navItemActive: {
    color: "#B9F24A",
    fontWeight: "900",
    fontSize: 11,
    marginTop: 2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 13, 0.82)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    maxHeight: "92%",
    backgroundColor: "#0A0F0D",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    padding: 18,
    borderWidth: 1,
    borderColor: "#26342D",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  modalTitle: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "900",
  },

  closeButton: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "900",
  },

  emptyCommentCard: {
    backgroundColor: "#121914",
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "#26342D",
  },

  commentCard: {
    backgroundColor: "#121914",
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "#26342D",
    marginBottom: 10,
  },

  commentAuthor: {
    color: "#F8FAFC",
    fontWeight: "900",
    marginBottom: 5,
  },

  commentText: {
    color: "#E5E7EB",
    lineHeight: 20,
    fontWeight: "600",
  },

  commentComposer: {
    backgroundColor: "#121914",
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: "#26342D",
    marginTop: 16,
  },

  commentInput: {
    color: "#F8FAFC",
    padding: 10,
  },

  commentControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },

  sendButton: {
    backgroundColor: "#B9F24A",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },

  sendButtonText: {
    color: "#111827",
    fontWeight: "900",
  },

  previewCommentCard: {
    backgroundColor: "#1A211D",
    borderRadius: 18,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#2B3A31",
  },

  previewCommentMeta: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "800",
  },

  viewMoreComments: {
    color: "#B9F24A",
    fontWeight: "900",
    marginTop: 10,
  },

  replyCard: {
    backgroundColor: "#1A211D",
    borderRadius: 18,
    padding: 10,
    marginLeft: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#2B3A31",
  },

  commentActionRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
  },

  commentActionText: {
    color: "#B9F24A",
    fontWeight: "900",
    fontSize: 12,
  },

  feedToggleRow: {
    flexDirection: "row",
    backgroundColor: "#121914",
    borderRadius: 999,
    padding: 5,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#26342D",
  },

  feedToggleButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: "center",
  },

  feedToggleButtonActive: {
    backgroundColor: "#B9F24A",
  },

  feedToggleText: {
    color: "#A1A1AA",
    fontWeight: "900",
  },

  feedToggleTextActive: {
    color: "#111827",
  },

  profilePhoto: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "#1B241F",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#B9F24A",
  },

  profileBioInput: {
    backgroundColor: "#121914",
    color: "#F8FAFC",
    minHeight: 110,
    padding: 15,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#26342D",
    textAlignVertical: "top",
    marginBottom: 12,
    fontWeight: "600",
  },

  uploadingCard: {
    backgroundColor: "#121914",
    borderWidth: 1,
    borderColor: "#B9F24A",
    borderRadius: 22,
    padding: 14,
    marginTop: 14,
  },

  uploadingText: {
    color: "#F8FAFC",
    fontWeight: "900",
    textAlign: "center",
  },

  uploadingSubtext: {
    color: "#A1A1AA",
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
    fontWeight: "600",
  },

  categoryFilterRow: {
    paddingBottom: 16,
    gap: 10,
  },

  categoryFilterChip: {
    backgroundColor: "#121914",
    borderWidth: 1,
    borderColor: "#26342D",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginRight: 10,
  },

  categoryFilterChipActive: {
    backgroundColor: "#B9F24A",
    borderColor: "#E7FF8F",
  },

  categoryFilterText: {
    color: "#D1D5DB",
    fontWeight: "900",
  },

  categoryFilterTextActive: {
    color: "#111827",
  },
});