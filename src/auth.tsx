// File: src/auth.tsx
// Description: keeps track of who is logged in and shares it with every screen.
// The token and profile id are saved to AsyncStorage, so the user stays
// logged in after the app is closed and reopened.
//
// Usage in a screen:
//   const { token, profileId, isLoading, login, logout, authFetch } = useAuth();
//   const res = await authFetch(`${API_URL}/profiles`);  // adds the token header for you

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// no trailing slash: screens add their own, e.g. `${API_URL}/login`
export const API_URL = 'https://cs-webapps.bu.edu/tstell/mini_insta/api';

// Just the origin, e.g. "https://cs-webapps.bu.edu". Uploaded photos come back as a path
// ("/tstell/media/..." on the server, "/media/..." locally) that already has the rest in it.
const SERVER = API_URL.match(/^https?:\/\/[^/]+/)![0];

export function fullUrl(url: string) {
  return url.startsWith('/') ? SERVER + url : url;
}

// Keys used to save the session on the device
const TOKEN_KEY = 'auth_token';
const PROFILE_ID_KEY = 'profile_id';

// ---------- Types that match the Django serializers ----------

export type Profile = {
  id: number;
  username: string;
  display_name: string;
  profile_image_url: string;
  bio_text: string;
  join_date: string;
  num_followers: number;
  num_following: number;
  num_posts: number;
};

export type Photo = {
  id: number;
  url: string; // can be a full URL, or a server path like "/media/mini_insta/images-8.jpeg"
  timestamp: string;
};

export type Post = {
  id: number;
  profile: number;
  author: string;
  caption: string;
  timestamp: string;
  photos: Photo[]; // a post can have zero, one or many photos
};

// ---------- The context ----------

type AuthContextValue = {
  token: string | null;     // null when logged out
  profileId: string | null; // AsyncStorage only stores strings; null if logged out or no profile
  isLoading: boolean;       // true while the saved session is being read at launch
  login: (username: string, password: string) => Promise<void>; // throws an Error with a message on failure
  logout: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore a saved session when the app launches
  useEffect(() => {
    (async () => {
      try {
        setToken(await AsyncStorage.getItem(TOKEN_KEY));
        setProfileId(await AsyncStorage.getItem(PROFILE_ID_KEY));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // POST username + password to the API, then save token + profile.id
  // to state (so screens update now) AND AsyncStorage (so it survives a restart)
  const login = async (username: string, password: string) => {
    let response: Response;
    try {
      response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
    } catch {
      // fetch throws when the server can't be reached (e.g. Django isn't running)
      throw new Error('Could not reach the server. Is Django running?');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? 'Login failed.');
    }

    const newProfileId = data.profile ? String(data.profile.id) : null; // null if the account has no profile

    setToken(data.token);
    setProfileId(newProfileId);

    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    if (newProfileId) {
      await AsyncStorage.setItem(PROFILE_ID_KEY, newProfileId);
    } else {
      await AsyncStorage.removeItem(PROFILE_ID_KEY);
    }
  };

  // Tell the server to delete the token, then clear state AND AsyncStorage
  const logout = async () => {
    if (token) {
      try {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: { Authorization: `Token ${token}` },
        });
      } catch {
        // even if the server can't be reached, still log out on this device
      }
    }

    setToken(null);
    setProfileId(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, PROFILE_ID_KEY]);
  };

  // fetch() that adds the token header automatically
  const authFetch = (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Token ${token}`,
      },
    });
  };

  return (
    <AuthContext.Provider value={{ token, profileId, isLoading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook every screen uses to read the auth state
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
