// File: src/styles.ts
// Description: shared stylesheet for the MiniInsta app
//
// Usage:
//   import { styles } from '@/styles';
//   <View style={styles.profileCard}> ... </View>

import { StyleSheet } from 'react-native';

export const colors = {
  background: '#ffffff',
  surface: '#fafafa',
  backgroundButton: '#efefef', // grey secondary buttons, e.g. Log out
  border: '#dbdbdb',
  text: '#262626',
  textSecondary: '#8e8e8e',
  link: '#0095f6',
  accent: '#e1306c',
};

export const styles = StyleSheet.create({
  // ---------- Screen layout ----------
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 100, // room for the tab bar
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },

  // ---------- Profile list (one row per profile) ----------
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  profileCardText: {
    flex: 1,
    marginLeft: 12,
  },
  avatarSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.accent,
  },

  // ---------- Text ----------
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  displayName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    marginTop: 4,
  },
  secondaryText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 14,
    color: '#ed4956',
    textAlign: 'center',
  },

  // ---------- Profile header (single profile page) ----------
  profileHeader: {
    padding: 16,
    gap: 4,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarLarge: {
    width: 86,
    height: 86,
    borderRadius: 43,
    marginRight: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: colors.text,
  },
  button: {
    marginTop: 12,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.link,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },

  // ---------- Post grid (3 columns, use with numColumns={3}) ----------
  gridTile: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 1,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridCaption: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 8,
  },

  // ---------- Feed post ----------
  post: {
    marginBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
  },
  postCaption: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  postAuthor: {
    fontWeight: '600',
  },
  postTimestamp: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    marginTop: 4,
  },
  postAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: colors.border,
  },
  postNoPhoto: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  postNoPhotoText: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
    textAlign: 'center',
  },

  // ---------- Photo pager dots (posts with more than one photo) ----------
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.link,
  },

  // ---------- Feed screen ----------
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
  },
});
