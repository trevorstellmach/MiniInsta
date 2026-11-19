import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_URL, fullUrl, useAuth, type Photo, type Post, type Profile } from '@/auth';
import { styles } from '@/styles';

export default function FeedScreen() {
  const { token, profileId, isLoading, authFetch } = useAuth(); // shared with every screen
  const [postList, setPostList] = useState<Post[]>([]);
  const [avatars, setAvatars] = useState<Record<number, string>>({}); // profile id -> image url
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // The API returns 10 items per page; keep following "next" until every page is loaded
  const fetchAllPages = useCallback(
    async <T,>(url: string): Promise<T[]> => {
      const items: T[] = [];
      let next: string | null = url;
      while (next) {
        const response = await authFetch(next);
        if (!response.ok) throw new Error(`Could not load feed (error ${response.status}).`);
        const data: { results: T[]; next: string | null } = await response.json();
        items.push(...data.results);
        next = data.next;
      }
      return items;
    },
    [authFetch],
  );

  const fetchFeed = useCallback(async () => {
    try {
      const [posts, profiles] = await Promise.all([
        fetchAllPages<Post>(`${API_URL}/profile/${profileId}/feed`),
        fetchAllPages<Profile>(`${API_URL}/profiles`), // only used for the authors' avatars
      ]);

      posts.sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // newest first
      setPostList(posts);
      setAvatars(Object.fromEntries(profiles.map((p) => [p.id, p.profile_image_url])));
      setError('');
    } catch (e) {
      setError(e instanceof Error && e.message.startsWith('Could not') ? e.message : 'Could not reach the server. Is Django running?');
    }
  }, [fetchAllPages, profileId]);

  useEffect(() => {
    // the feed API needs a token and a profile, so wait until the user has logged in
    if (!token || !profileId) {
      setPostList([]);
      return;
    }
    setLoading(true);
    fetchFeed().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, profileId]); // runs again whenever the user logs in or out

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  };

  // ---------- Not ready / not logged in ----------
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }
  if (!token) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <Text style={styles.displayName}>Log in on the Login tab to see your feed.</Text>
      </SafeAreaView>
    );
  }
  if (!profileId) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <Text style={styles.displayName}>This account has no profile, so it has no feed.</Text>
      </SafeAreaView>
    );
  }

  // ---------- Feed ----------
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={postList}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.feedHeader}>
            <Text style={styles.heading}>Feed</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={{ marginTop: 48 }} />
          ) : (
            <Text style={error ? [styles.errorText, styles.emptyText] : styles.emptyText}>
              {error || 'No posts yet. Follow someone to fill your feed.'}
            </Text>
          )
        }
        renderItem={({ item }) => <FeedPost post={item} avatarUrl={avatars[item.profile]} />}
      />
    </SafeAreaView>
  );
}

// One post: header, photo(s), caption, date
function FeedPost({ post, avatarUrl }: { post: Post; avatarUrl?: string }) {
  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.postAvatar} />
        ) : (
          <View style={styles.postAvatarPlaceholder} />
        )}
        <Text style={styles.username}>{post.author}</Text>
      </View>

      {post.photos.length > 0 ? (
        <PhotoPager photos={post.photos} />
      ) : (
        // text-only post: show the caption where the photo would be
        <View style={styles.postNoPhoto}>
          <Text style={styles.postNoPhotoText}>{post.caption}</Text>
        </View>
      )}

      {post.caption && post.photos.length > 0 ? (
        <Text style={styles.postCaption}>
          <Text style={styles.postAuthor}>{post.author} </Text>
          {post.caption}
        </Text>
      ) : null}

      <Text style={styles.postTimestamp}>
        {new Date(post.timestamp).toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </Text>
    </View>
  );
}

// Swipe left/right between photos when a post has more than one
function PhotoPager({ photos }: { photos: Photo[] }) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);

  if (photos.length === 1) {
    return <Image source={{ uri: fullUrl(photos[0].url) }} style={styles.postImage} />;
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}>
        {photos.map((photo) => (
          <Image key={photo.id} source={{ uri: fullUrl(photo.url) }} style={[styles.postImage, { width }]} />
        ))}
      </ScrollView>
      <View style={styles.dotRow}>
        {photos.map((photo, i) => (
          <View key={photo.id} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}
