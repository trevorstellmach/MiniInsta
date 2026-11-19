import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth';
import { colors, styles } from '@/styles';

// The login form. This tab only appears while logged out (see components/app-tabs.tsx);
// after a successful login it disappears and the Profile tab takes its place.
export default function LoginScreen() {
  const { login: authLogin } = useAuth(); // shared with every screen
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!username || !password) {
      setError('Enter your username and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authLogin(username, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed.');
      setLoading(false);
    }
    // on success this screen goes away, so there's nothing else to reset
  };

  return (
    <SafeAreaView style={[styles.screen, local.container]}>
      <Text style={[styles.heading, local.center]}>MiniInsta</Text>

      <TextInput
        style={local.input}
        placeholder="Username"
        placeholderTextColor={colors.textSecondary}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="username"
        returnKeyType="next"
      />
      <TextInput
        style={local.input}
        placeholder="Password"
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={login}
      />

      <Pressable
        onPress={login}
        disabled={loading}
        style={({ pressed }) => [styles.button, local.button, (pressed || loading) && local.pressed]}>
        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Log in</Text>}
      </Pressable>

      {error ? <Text style={[styles.errorText, local.error]}>{error}</Text> : null}
    </SafeAreaView>
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
  button: {
    marginTop: 4,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  error: {
    marginTop: 4,
  },
});
