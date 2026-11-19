import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_URL, useAuth, type Post } from '@/auth';
import { colors, styles } from '@/styles';

// Form for the logged-in user to share a new post (a caption and/or one image URL).
// Sends POST /api/profile/create_post; Django sets the post's owner from the token.
export default function CreatePostScreen() {
  const { token, profileId, authFetch } = useAuth();
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  // only try to preview something that looks like a web address
  const showPreview = /^https?:\/\/\S+$/i.test(imageUrl.trim()) && !previewFailed;

  const createPost = async (): Promise<Post> => {
    let response: Response;
    try {
      response = await authFetch(`${API_URL}/profile/create_post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // leave image_url out when it's empty: Django rejects "" as an invalid URL
        body: JSON.stringify({ caption: caption.trim(), image_url: imageUrl.trim() || undefined }),
      });
    } catch {
      // fetch throws when the server can't be reached (e.g. Django isn't running)
      throw new Error('Could not reach the server. Is Django running?');
    }

    const data = await response.json();
    if (response.status !== 201) {
      // DRF sends field errors like {"image_url": ["Enter a valid URL."]}
      if (data.image_url) throw new Error(`Image URL: ${data.image_url[0]}`);
      if (data.caption) throw new Error(`Caption: ${data.caption[0]}`);
      throw new Error(data.detail ?? `Could not create post (error ${response.status}).`);
    }
    return data;
  };

  const handleSubmit = async () => {
    if (!caption.trim() && !imageUrl.trim()) {
      setError('Add a caption or an image URL.');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createPost();
      setCaption('');
      setImageUrl('');
      setPreviewFailed(false);
      setSuccess('Posted! Pull down on your Profile to see it.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create post.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Not logged in / no profile ----------
  if (!token) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <Text style={styles.displayName}>Log in on the Login tab to create a post.</Text>
      </SafeAreaView>
    );
  }
  if (!profileId) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <Text style={styles.displayName}>This account has no profile, so it can&apos;t post.</Text>
      </SafeAreaView>
    );
  }

  // ---------- Form ----------
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* "handled" lets the Share button work while the keyboard is open */}
      <ScrollView contentContainerStyle={local.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.heading, local.heading]}>New post</Text>

        {/* image preview, or a placeholder square */}
        <View style={local.preview}>
          {showPreview ? (
            <Image
              source={{ uri: imageUrl.trim() }}
              style={styles.gridImage}
              onError={() => setPreviewFailed(true)}
            />
          ) : (
            <Text style={local.previewText}>
              {previewFailed ? "Couldn't load that image" : 'Paste an image URL to see a preview'}
            </Text>
          )}
        </View>

        <TextInput
          style={local.input}
          placeholder="Image URL (optional)"
          placeholderTextColor={colors.textSecondary}
          value={imageUrl}
          onChangeText={(text) => {
            setImageUrl(text);
            setPreviewFailed(false);
            setError('');
          }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          textContentType="URL"
        />
        <TextInput
          style={[local.input, local.captionInput]}
          placeholder="Write a caption…"
          placeholderTextColor={colors.textSecondary}
          value={caption}
          onChangeText={(text) => {
            setCaption(text);
            setError('');
          }}
          multiline
          maxLength={2200}
        />

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={({ pressed }) => [styles.button, local.button, (pressed || loading) && local.pressed]}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Share</Text>}
        </Pressable>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={local.success}>{success}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles only used on this screen (shared ones come from @/styles)
const local = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 120, // room for the tab bar
    gap: 12,
  },
  heading: {
    paddingHorizontal: 0,
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  captionInput: {
    minHeight: 90,
    textAlignVertical: 'top', // Android: start typing at the top of the box
  },
  button: {
    marginTop: 4,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  success: {
    color: '#2e9e44',
    fontSize: 14,
    textAlign: 'center',
  },
});
