import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_URL, fullUrl, useAuth, type Post, type Profile } from '@/auth';
import { colors, styles } from '@/styles';

// Shows the logged-in user's own profile and posts.
// This tab only appears while logged in (see components/app-tabs.tsx).
export default function ProfileScreen() {
  const { token, profileId, logout, authFetch } = useAuth(); // shared with every screen
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      // profile info + first page of posts at the same time
      const [profileRes, postsRes] = await Promise.all([
        authFetch(`${API_URL}/profile/${profileId}`),
        authFetch(`${API_URL}/profile/${profileId}/posts`),
      ]);
      if (!profileRes.ok || !postsRes.ok) {
        setError(`Could not load your profile (error ${profileRes.ok ? postsRes.status : profileRes.status}).`);
        return;
      }
      setProfile(await profileRes.json());

      // the API returns 10 posts per page; follow "next" until every page is loaded
      let page: { results: Post[]; next: string | null } = await postsRes.json();
      const allPosts = [...page.results];
      while (page.next) {
        page = await (await authFetch(page.next)).json();
        allPosts.push(...page.results);
      }
      allPosts.sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // newest first
      setPosts(allPosts);
      setError('');
    } catch {
      setError('Could not reach the server. Is Django running?');
    }
  };

  // Load the profile after logging in (also runs when a saved session is restored at launch)
  useEffect(() => {
    if (!token || !profileId) {
      setProfile(null);
      setPosts([]);
      return;
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, profileId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const logoutButton = (
    <Pressable
      onPress={logout}
      style={({ pressed }) => [styles.button, local.logoutButton, pressed && local.pressed]}>
      <Text style={local.logoutText}>Log out</Text>
    </Pressable>
  );

  // ---------- No profile (e.g. admin), error, or still loading ----------
  if (!profile) {
    return (
      <SafeAreaView style={[styles.screen, local.container]}>
        {!profileId ? (
          <Text style={[styles.username, local.center]}>Logged in, but this account has no profile.</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <ActivityIndicator />
        )}
        {logoutButton}
      </SafeAreaView>
    );
  }

  // ---------- Your profile ----------
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={posts}
        numColumns={3}
        keyExtractor={(post) => String(post.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.profileHeader}>
            <Text style={[styles.username, local.handle]}>@{profile.username}</Text>

            <View style={styles.profileHeaderRow}>
              <Image source={{ uri: profile.profile_image_url }} style={styles.avatarLarge} />
              <Stat value={profile.num_posts} label="posts" />
              <Stat value={profile.num_followers} label="followers" />
              <Stat value={profile.num_following} label="following" />
            </View>

            <Text style={styles.username}>{profile.display_name}</Text>
            {profile.bio_text ? <Text style={styles.bio}>{profile.bio_text}</Text> : null}
            <Text style={styles.secondaryText}>
              Joined {new Date(profile.join_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </Text>

            {logoutButton}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>You haven&apos;t posted anything yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.gridTile}>
            {item.photos[0] ? (
              <Image source={{ uri: fullUrl(item.photos[0].url) }} style={styles.gridImage} />
            ) : (
              // text-only post: show the caption in the tile
              <Text style={styles.gridCaption} numberOfLines={5}>
                {item.caption}
              </Text>
            )}
            {item.photos.length > 1 ? <Text style={local.multiBadge}>❐</Text> : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// One number + label in the profile header, e.g. "4 posts"
function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Styles only used on this screen (shared ones come from @/styles)
const local = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: 32,
    gap: 12,
  },
  center: {
    textAlign: 'center',
    alignSelf: 'center',
  },
  handle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: colors.backgroundButton,
    marginTop: 12,
  },
  logoutText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  multiBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    color: '#ffffff',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowRadius: 3,
  },
});
