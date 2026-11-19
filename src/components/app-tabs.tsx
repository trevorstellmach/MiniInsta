import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';

import { useAuth } from '@/auth';
import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { token, isLoading } = useAuth();
  const loggedIn = !!token;

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="feed">
        <NativeTabs.Trigger.Label>Feed</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="create_post">
        <NativeTabs.Trigger.Label>Create Post</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'plus.square', selected: 'plus.square.fill' }} md="add_box" />
      </NativeTabs.Trigger>

      {/* Only one of these two shows at a time: Login while logged out, Profile while logged in.
          Both stay hidden while the saved session is being read at launch. */}
      <NativeTabs.Trigger name="profile" hidden={isLoading || !loggedIn}>
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle" md="account_circle" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="login" hidden={isLoading || loggedIn}>
        <NativeTabs.Trigger.Label>Login</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.badge.key" md="login" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
