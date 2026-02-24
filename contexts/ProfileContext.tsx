import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { Profile } from '@/lib/types';
import { loadProfile, saveProfile, loadAuth, saveAuth, clearAuth, clearAllData } from '@/lib/storage';

interface ProfileContextValue {
  profile: Profile;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
  resetAllData: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>({ name: '', avatar: null });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const authName = await loadAuth();
      if (authName) {
        setIsAuthenticated(true);
        const p = await loadProfile();
        setProfile(p.name ? p : { name: authName, avatar: null });
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (name: string) => {
    await saveAuth(name);
    const p = { name, avatar: null };
    await saveProfile(p);
    setProfile(p);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
    setIsAuthenticated(false);
    setProfile({ name: '', avatar: null });
  }, []);

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      saveProfile(next);
      return next;
    });
  }, []);

  const resetAllData = useCallback(async () => {
    await clearAllData();
    setProfile({ name: '', avatar: null });
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(() => ({
    profile,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateProfile,
    resetAllData,
  }), [profile, isAuthenticated, isLoading, login, logout, updateProfile, resetAllData]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
