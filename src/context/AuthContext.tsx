import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { AuthRepository } from '../repositories/auth.repository';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  currentUser: UserProfile;
  users: UserProfile[];
  login: (userId: string) => void;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  setCurrentUser: (user: UserProfile) => void;
  refreshProfiles: () => Promise<void>;
}

const DEFAULT_ANONYMOUS_USER: UserProfile = {
  id: '',
  name: 'Invitado',
  email: '',
  role: 'cliente',
  roleTitle: 'Cliente / Invitado',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
  assignedBrandIds: [],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('nataraja_current_user');
      return saved ? JSON.parse(saved) : DEFAULT_ANONYMOUS_USER;
    } catch {
      return DEFAULT_ANONYMOUS_USER;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nataraja_is_auth');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);

  // Load profiles from Supabase on mount
  const refreshProfiles = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const dbProfiles = await AuthRepository.fetchProfiles();
      setUsers(dbProfiles || []);
      if (dbProfiles && dbProfiles.length > 0) {
        const matchingCurrent = dbProfiles.find((u) => u.id === currentUser.id || u.email === currentUser.email);
        if (matchingCurrent) {
          setCurrentUserState(matchingCurrent);
        }
      }
    } catch (err) {
      console.warn('Error fetching Supabase profiles:', err);
    }
  };

  useEffect(() => {
    refreshProfiles();
  }, []);

  // Listen to Supabase auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true);
        const dbProfiles = await AuthRepository.fetchProfiles();
        const found = dbProfiles.find((p) => p.id === session.user.id || p.email === session.user.email);
        if (found) {
          setCurrentUserState(found);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setCurrentUserState(DEFAULT_ANONYMOUS_USER);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nataraja_users', JSON.stringify(users));
    } catch {
      // storage full or disabled
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('nataraja_current_user', JSON.stringify(currentUser));
    } catch {
      // storage full or disabled
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('nataraja_is_auth', String(isAuthenticated));
    } catch {
      // storage full or disabled
    }
  }, [isAuthenticated]);

  const loginWithPassword = async (email: string, password: string) => {
    setIsLoadingAuth(true);
    try {
      const profile = await AuthRepository.signIn(email, password);
      if (profile) {
        setCurrentUserState(profile);
        setIsAuthenticated(true);
        await refreshProfiles();
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signUpWithPassword = async (email: string, password: string, name: string, role?: UserRole) => {
    setIsLoadingAuth(true);
    try {
      const profile = await AuthRepository.signUp(email, password, name, role);
      if (profile) {
        setCurrentUserState(profile);
        setIsAuthenticated(true);
        await refreshProfiles();
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUserState(user);
      setIsAuthenticated(true);
    }
  };

  const logout = async () => {
    try {
      await AuthRepository.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setIsAuthenticated(false);
    setCurrentUserState(DEFAULT_ANONYMOUS_USER);
  };

  const setCurrentUser = async (user: UserProfile) => {
    setCurrentUserState(user);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
    if (isSupabaseConfigured && user.id) {
      AuthRepository.updateUserProfile(user.id, user).catch((err) => {
        console.warn('Failed to update user profile in Supabase:', err);
      });
    }
  };

  const contextValue = React.useMemo(
    () => ({
      isAuthenticated,
      isLoadingAuth,
      currentUser,
      users,
      login,
      loginWithPassword,
      signUpWithPassword,
      logout,
      setCurrentUser,
      refreshProfiles,
    }),
    [isAuthenticated, isLoadingAuth, currentUser, users]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
