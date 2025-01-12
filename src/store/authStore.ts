import { create } from 'zustand';
import { createUser, loginUser, logoutUser, upsertApiKeys, getApiKeys, supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  openaiApiKey?: string;
  heygenApiKey?: string;
}

interface AuthState {
  currentUser: User | null;
  setUser: (email: string, password: string, isSignUp: boolean) => Promise<{ needsEmailConfirmation?: boolean } | undefined>;
  updateApiKeys: (openaiApiKey: string, heygenApiKey: string) => Promise<void>;
  clearCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),

  setUser: async (email: string, password: string, isSignUp: boolean) => {
    try {
      if (isSignUp) {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (existingUser) {
          throw new Error('User already exists');
        }
        
        const { data, needsEmailConfirmation } = await createUser(email, password);
        if (needsEmailConfirmation) {
          return { needsEmailConfirmation: true };
        }
        if (!data.user) throw new Error('Signup failed');

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
        };
        localStorage.setItem('currentUser', JSON.stringify(user)); // Save to localStorage
        set({ currentUser: user });
        return;
      } else {
        const response = await loginUser(email, password);
        if (!response.user) throw new Error('Login failed');

        const user: User = {
          id: response.user.id,
          email: response.user.email || '',
        };

        try {
          const apiKeys = await getApiKeys(user.id);
          if (apiKeys) {
            user.openaiApiKey = apiKeys.openai_key;
            user.heygenApiKey = apiKeys.heygen_key;
          }
        } catch (error) {
          console.error('Failed to fetch API keys:', error);
        }

        localStorage.setItem('currentUser', JSON.stringify(user)); // Save to localStorage
        set({ currentUser: user });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  },

  updateApiKeys: async (openaiApiKey: string, heygenApiKey: string) => {
    const currentUser = get().currentUser;
    if (!currentUser) throw new Error('No user logged in');

    try {
      await upsertApiKeys(currentUser.id, openaiApiKey, heygenApiKey);
      const updatedUser = {
        ...currentUser,
        openaiApiKey,
        heygenApiKey
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser)); // Update localStorage
      set({ currentUser: updatedUser });
    } catch (error) {
      console.error('Failed to update API keys:', error);
      throw error;
    }
  },

  clearCurrentUser: async () => {
    try {
      await logoutUser();
      localStorage.removeItem('currentUser'); // Clear from localStorage
      set({ currentUser: null });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}));
