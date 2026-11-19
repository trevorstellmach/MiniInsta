import { FlatList, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';

import { API_URL, useAuth, type Profile } from '@/auth';
import { styles } from '@/styles';

export default function HomeScreen() {
  const { token } = useAuth();
  const [profileList, setProfileList] = useState<Profile[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // the profiles API needs a token, so wait until the user has logged in
    if (!token) {
      setProfileList([]);
      return;
    }

    const fetchProfiles = async () => {
      try {
        const response = await fetch(`${API_URL}/profiles`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!response.ok) {
          setError(`Could not load profiles (error ${response.status}).`);
          return;
        }
        const data = await response.json();
        setProfileList(data.results);
        setError('');
      } catch {
        setError('Could not reach the server. Is Django running?');
      }
    };

    fetchProfiles();
  }, [token]); // runs again whenever the user logs in or out

  if (!token) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <Text style={styles.displayName}>Log in on the Login tab to see profiles.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={profileList}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>Profiles</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.profileCard}>
            <Image source={{ uri: item.profile_image_url }} style={styles.avatarSmall} />
            <View style={styles.profileCardText}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.displayName}>{item.display_name}</Text>
              <Text style={styles.bio} numberOfLines={1}>
                {item.bio_text}
              </Text>
              <Text style={styles.secondaryText}>
                {item.num_posts} posts · {item.num_followers} followers
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
