import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  commentButton: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },

  commentButtonText: {
    color: "white",
    fontWeight: "900",
  },

  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 18,
  },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    color: "white",
    fontSize: 34,
    fontWeight: "900",
  },

  subtitle: {
    color: "#94A3B8",
    marginTop: 4,
  },

  headerPill: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1E293B",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    maxWidth: 140,
  },

  headerPillText: {
    color: "#38BDF8",
    fontWeight: "900",
  },

  feedList: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  heroCard: {
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 28,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  heroKicker: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  heroTitle: {
    color: "white",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 4,
  },

  heroText: {
    color: "#94A3B8",
    marginTop: 8,
    lineHeight: 21,
  },

  postCard: {
    backgroundColor: "#0F172A",
    padding: 16,
    borderRadius: 26,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "white",
    fontWeight: "900",
  },

  author: {
    color: "white",
    fontWeight: "900",
  },

  location: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },

  more: {
    color: "#64748B",
    fontWeight: "900",
  },

  postText: {
    color: "white",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 14,
  },

  postImage: {
    width: "100%",
    height: 240,
    borderRadius: 22,
    marginBottom: 14,
    backgroundColor: "#1E293B",
  },

  reactionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  reaction: {
    backgroundColor: "#111827",
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  reactionText: {
    color: "#E2E8F0",
    fontWeight: "800",
  },

  floatingButton: {
    position: "absolute",
    right: 22,
    bottom: 98,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  floatingButtonText: {
    color: "white",
    fontSize: 36,
    fontWeight: "500",
    marginTop: -3,
  },

  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  screenTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 6,
  },

  screenSubtext: {
    color: "#94A3B8",
    marginBottom: 16,
    lineHeight: 21,
  },

  input: {
    backgroundColor: "#0F172A",
    color: "white",
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 12,
  },

  textArea: {
    backgroundColor: "#0F172A",
    color: "white",
    minHeight: 190,
    padding: 15,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1E293B",
    textAlignVertical: "top",
    fontSize: 16,
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 12,
  },

  primaryButtonText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },

  secondaryButton: {
    backgroundColor: "#111827",
    padding: 15,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  secondaryButtonText: {
    color: "#E2E8F0",
    fontWeight: "900",
  },

  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 22,
    marginTop: 14,
    backgroundColor: "#1E293B",
  },

  smallTitle: {
    color: "white",
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
    backgroundColor: "#0F172A",
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  chipText: {
    color: "#E2E8F0",
    fontWeight: "800",
  },

  switchRow: {
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1E293B",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  switchLabel: {
    color: "white",
    fontWeight: "900",
  },

  switchHelp: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 3,
  },

  profileCard: {
    backgroundColor: "#0F172A",
    padding: 24,
    borderRadius: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  profileAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  profileAvatarText: {
    color: "white",
    fontSize: 34,
    fontWeight: "900",
  },

  profileName: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  statBox: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 14,
    minWidth: 80,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  statNumber: {
    color: "white",
    fontWeight: "900",
    fontSize: 18,
  },

  statLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 3,
  },

  muted: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 6,
  },

  emptyCard: {
    backgroundColor: "#0F172A",
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  emptyTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
  },

  bottomNav: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "#0F172A",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#1E293B",
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-around",
  },

  navButton: {
    alignItems: "center",
    minWidth: 62,
  },

  navIcon: {
    fontSize: 18,
    opacity: 0.55,
  },

  navIconActive: {
    fontSize: 20,
  },

  navItem: {
    color: "#64748B",
    fontWeight: "800",
    fontSize: 11,
    marginTop: 2,
  },

  navItemActive: {
    color: "#38BDF8",
    fontWeight: "900",
    fontSize: 11,
    marginTop: 2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.75)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    maxHeight: "92%",
    backgroundColor: "#020617",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  modalTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
  },

  closeButton: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
  },

  emptyCommentCard: {
    backgroundColor: "#0F172A",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  commentCard: {
    backgroundColor: "#0F172A",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 10,
  },

  commentAuthor: {
    color: "white",
    fontWeight: "900",
    marginBottom: 5,
  },

  commentText: {
    color: "#E2E8F0",
    lineHeight: 20,
  },

  commentComposer: {
    backgroundColor: "#0F172A",
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginTop: 16,
  },

  commentInput: {
    color: "white",
    padding: 10,
  },

  commentControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },

  sendButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },

  sendButtonText: {
    color: "white",
    fontWeight: "900",
  },

    previewCommentCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  previewCommentMeta: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "700",
  },

  viewMoreComments: {
    color: "#38BDF8",
    fontWeight: "900",
    marginTop: 10,
  },

  replyCard: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 10,
    marginLeft: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  commentActionRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
  },

  commentActionText: {
    color: "#38BDF8",
    fontWeight: "900",
    fontSize: 12,
  },

    feedToggleRow: {
    flexDirection: "row",
    backgroundColor: "#0F172A",
    borderRadius: 999,
    padding: 5,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  feedToggleButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: "center",
  },

  feedToggleButtonActive: {
    backgroundColor: "#2563EB",
  },

  feedToggleText: {
    color: "#94A3B8",
    fontWeight: "900",
  },

  feedToggleTextActive: {
    color: "white",
  },
});