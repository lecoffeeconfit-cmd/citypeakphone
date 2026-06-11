import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030712",
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
    color: "#F8FAFC",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1.5,
  },

  subtitle: {
    color: "#8B5CF6",
    marginTop: 3,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  headerPill: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#22D3EE",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: 150,
  },

  headerPillText: {
    color: "#22D3EE",
    fontWeight: "900",
  },

  feedList: {
    paddingHorizontal: 18,
    paddingBottom: 130,
  },

  heroCard: {
    backgroundColor: "#0B1020",
    padding: 24,
    borderRadius: 38,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#312E81",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },

  heroKicker: {
    color: "#22D3EE",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.8,
  },

  heroTitle: {
    color: "#F8FAFC",
    fontSize: 38,
    fontWeight: "900",
    marginTop: 6,
    letterSpacing: -1.4,
  },

  heroText: {
    color: "#A5B4FC",
    marginTop: 10,
    lineHeight: 23,
    fontWeight: "700",
  },

  postCard: {
    backgroundColor: "#090E1D",
    padding: 17,
    borderRadius: 36,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#1E3A8A",
    shadowColor: "#22D3EE",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },

  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#22D3EE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#A78BFA",
  },

  avatarText: {
    color: "#020617",
    fontWeight: "900",
  },

  author: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 15,
  },

  location: {
    color: "#818CF8",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "800",
  },

  more: {
    color: "#818CF8",
    fontWeight: "900",
  },

  postText: {
    color: "#F8FAFC",
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 15,
    fontWeight: "700",
  },

  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 30,
    marginBottom: 15,
    backgroundColor: "#111827",
  },

  reactionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  reaction: {
    backgroundColor: "#111827",
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#312E81",
  },

  reactionText: {
    color: "#E0E7FF",
    fontWeight: "900",
  },

  commentButton: {
    backgroundColor: "#22D3EE",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#67E8F9",
  },

  commentButtonText: {
    color: "#020617",
    fontWeight: "900",
  },

  floatingButton: {
    position: "absolute",
    right: 22,
    bottom: 102,
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    transform: [{ rotate: "8deg" }],
  },

  floatingButtonText: {
    color: "white",
    fontSize: 40,
    fontWeight: "800",
    marginTop: -5,
    transform: [{ rotate: "-8deg" }],
  },

  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 105,
  },

  screenTitle: {
    color: "#F8FAFC",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 6,
    letterSpacing: -1,
  },

  screenSubtext: {
    color: "#A5B4FC",
    marginBottom: 16,
    lineHeight: 22,
    fontWeight: "700",
  },

  input: {
    backgroundColor: "#090E1D",
    color: "#F8FAFC",
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#312E81",
    marginBottom: 12,
    fontWeight: "800",
  },

  textArea: {
    backgroundColor: "#090E1D",
    color: "#F8FAFC",
    minHeight: 190,
    padding: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#312E81",
    textAlignVertical: "top",
    fontSize: 16,
    fontWeight: "700",
  },

  primaryButton: {
    backgroundColor: "#22D3EE",
    padding: 17,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#22D3EE",
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },

  primaryButtonText: {
    color: "#020617",
    fontWeight: "900",
    fontSize: 16,
  },

  secondaryButton: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#312E81",
  },

  secondaryButtonText: {
    color: "#E0E7FF",
    fontWeight: "900",
  },

  previewImage: {
    width: "100%",
    height: 225,
    borderRadius: 30,
    marginTop: 14,
    backgroundColor: "#111827",
  },

  smallTitle: {
    color: "#F8FAFC",
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
    backgroundColor: "#090E1D",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#312E81",
  },

  chipText: {
    color: "#E0E7FF",
    fontWeight: "900",
  },

  switchRow: {
    marginTop: 18,
    padding: 15,
    borderRadius: 26,
    backgroundColor: "#090E1D",
    borderWidth: 1,
    borderColor: "#312E81",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  switchLabel: {
    color: "#F8FAFC",
    fontWeight: "900",
  },

  switchHelp: {
    color: "#A5B4FC",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "700",
  },

  profileCard: {
    backgroundColor: "#090E1D",
    padding: 26,
    borderRadius: 38,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#312E81",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },

  profileAvatar: {
    width: 98,
    height: 98,
    borderRadius: 28,
    backgroundColor: "#22D3EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#A78BFA",
  },

  profileAvatarText: {
    color: "#020617",
    fontSize: 36,
    fontWeight: "900",
  },

  profileName: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "900",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  statBox: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 14,
    minWidth: 82,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#312E81",
  },

  statNumber: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 18,
  },

  statLabel: {
    color: "#A5B4FC",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "800",
  },

  muted: {
    color: "#A5B4FC",
    textAlign: "center",
    marginTop: 6,
    fontWeight: "700",
  },

  emptyCard: {
    backgroundColor: "#090E1D",
    padding: 25,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#312E81",
  },

  emptyTitle: {
    color: "#F8FAFC",
    fontSize: 21,
    fontWeight: "900",
  },

  bottomNav: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 15,
    backgroundColor: "#070B16",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#312E81",
    paddingVertical: 8,
    paddingHorizontal: 6,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#22D3EE",
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },

  navButton: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 58,
    paddingVertical: 7,
    borderRadius: 20,
  },

  navButtonActive: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 66,
    paddingVertical: 7,
    paddingHorizontal: 5,
    borderRadius: 22,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#22D3EE",
  },

  navIconBubble: {
    width: 30,
    height: 30,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconBubbleActive: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22D3EE",
    shadowColor: "#22D3EE",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },

  navIcon: {
    color: "#64748B",
    fontSize: 18,
    fontWeight: "900",
  },

  navIconActive: {
    color: "#020617",
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
    backgroundColor: "#F43F5E",
    borderWidth: 1,
    borderColor: "#020617",
  },

  navItem: {
    color: "#64748B",
    fontWeight: "900",
    fontSize: 10,
    marginTop: 3,
  },

  navItemActive: {
    color: "#22D3EE",
    fontWeight: "900",
    fontSize: 10,
    marginTop: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(3, 7, 18, 0.86)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    maxHeight: "92%",
    backgroundColor: "#030712",
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    padding: 18,
    borderWidth: 1,
    borderColor: "#312E81",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  modalTitle: {
    color: "#F8FAFC",
    fontSize: 23,
    fontWeight: "900",
  },

  closeButton: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "900",
  },

  emptyCommentCard: {
    backgroundColor: "#090E1D",
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#312E81",
  },

  commentCard: {
    backgroundColor: "#090E1D",
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#312E81",
    marginBottom: 10,
  },

  commentAuthor: {
    color: "#F8FAFC",
    fontWeight: "900",
    marginBottom: 5,
  },

  commentText: {
    color: "#E0E7FF",
    lineHeight: 20,
    fontWeight: "700",
  },

  commentComposer: {
    backgroundColor: "#090E1D",
    borderRadius: 28,
    padding: 12,
    borderWidth: 1,
    borderColor: "#312E81",
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
    backgroundColor: "#22D3EE",
    paddingVertical: 11,
    paddingHorizontal: 17,
    borderRadius: 16,
  },

  sendButtonText: {
    color: "#020617",
    fontWeight: "900",
  },

  previewCommentCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 11,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#312E81",
  },

  previewCommentMeta: {
    color: "#A5B4FC",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "800",
  },

  viewMoreComments: {
    color: "#22D3EE",
    fontWeight: "900",
    marginTop: 10,
  },

  replyCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 10,
    marginLeft: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#312E81",
  },

  commentActionRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
  },

  commentActionText: {
    color: "#22D3EE",
    fontWeight: "900",
    fontSize: 12,
  },

  feedToggleRow: {
    flexDirection: "row",
    backgroundColor: "#090E1D",
    borderRadius: 20,
    padding: 5,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#312E81",
  },

  feedToggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },

  feedToggleButtonActive: {
    backgroundColor: "#22D3EE",
  },

  feedToggleText: {
    color: "#A5B4FC",
    fontWeight: "900",
  },

  feedToggleTextActive: {
    color: "#020617",
  },

  profilePhoto: {
    width: 98,
    height: 98,
    borderRadius: 28,
    backgroundColor: "#111827",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#22D3EE",
  },

  profileBioInput: {
    backgroundColor: "#090E1D",
    color: "#F8FAFC",
    minHeight: 110,
    padding: 15,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#312E81",
    textAlignVertical: "top",
    marginBottom: 12,
    fontWeight: "700",
  },

  uploadingCard: {
    backgroundColor: "#090E1D",
    borderWidth: 1,
    borderColor: "#22D3EE",
    borderRadius: 26,
    padding: 14,
    marginTop: 14,
  },

  uploadingText: {
    color: "#F8FAFC",
    fontWeight: "900",
    textAlign: "center",
  },

  uploadingSubtext: {
    color: "#A5B4FC",
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
    backgroundColor: "#090E1D",
    borderWidth: 1,
    borderColor: "#312E81",
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 16,
    marginRight: 10,
  },

  categoryFilterChipActive: {
    backgroundColor: "#8B5CF6",
    borderColor: "#A78BFA",
  },

  categoryFilterText: {
    color: "#C7D2FE",
    fontWeight: "900",
  },

  categoryFilterTextActive: {
    color: "#FFFFFF",
  },
});