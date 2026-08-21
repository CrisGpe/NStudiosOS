import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { authService } from '../services/supabaseService';
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    if (isSupabaseConfigured) return [];
    try {
      const saved = localStorage.getItem('nataraja_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => {
    if (isSupabaseConfigured) {
      return {
        id: '',
        name: 'Cargando...',
        email: '',
        role: 'webadmin',
        roleTitle: 'WebAdmin Global',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        assignedBrandIds: [],
      };
    }
    try {
      const saved = localStorage.getItem('nataraja_current_user');
      return saved ? JSON.parse(saved) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (isSupabaseConfigured) {
      try {
        const saved = localStorage.getItem('nataraja_is_auth');
        return saved === 'true';
      } catch {
        return false;
      }
    }
    return true;
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);

  // Load profiles from Supabase on mount
  const refreshProfiles = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const dbProfiles = await authService.fetchAllProfiles();
      setUsers(dbProfiles || []);
      if (dbProfiles && dbProfiles.length > 0) {
        const matchingCurrent = dbProfiles.find((u) => u.id === currentUser.id || u.email === currentUser.email);
        if (matchingCurrent) {
          setCurrentUserState(matchingCurrent);
        } else if (!currentUser.id) {
          setCurrentUserState(dbProfiles[0]);
        }
      }
    } catch (err) {
      console.warn('Could not fetch Supabase profiles:', err);
    }
  };

  useEffect(() => {
    refreshProfiles();
  }, []);

  // Listen to Supabase Auth State Change
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsLoadingAuth(true);
        try {
          const profile = await authService.fetchUserProfile(session.user.id);
          if (profile) {
            setCurrentUserState(profile);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error('Error fetching user profile on auth change:', err);
        } finally {
          setIsLoadingAuth(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('nataraja_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('nataraja_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('nataraja_is_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  const loginWithPassword = async (email: string, password: string) => {
    setIsLoadingAuth(true);
    try {
      const data = await authService.signIn(email, password);
      if (data?.user) {
        let profile = await authService.fetchUserProfile(data.user.id);
        if (!profile) {
          // Create default profile for authenticated user
          profile = {
            id: data.user.id,
            name: data.user.user_metadata?.name || email.split('@')[0],
            email,
            role: (data.user.user_metadata?.role as UserRole) || 'webadmin',
            roleTitle: 'WebAdmin Global',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
            assignedBrandIds: [],
            schedule: {
              workDays: [1, 2, 3, 4, 5],
              startHour: '09:00',
              endHour: '18:00',
              isOnVacation: false,
              alertsEnabled: true,
            },
            preferences: {
              navPosition: 'topbar',
              theme: 'light-density',
              compactCards: false,
              enableNotifications: true,
            },
          };
          await authService.upsertProfile(profile);
        }
        setCurrentUserState(profile);
        setIsAuthenticated(true);
        await refreshProfiles();
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signUpWithPassword = async (email: string, password: string, name: string, role: UserRole = 'webadmin') => {
    setIsLoadingAuth(true);
    try {
      const result = await authService.signUp(email, password, name, role);
      if (result.profile) {
        setCurrentUserState(result.profile);
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
      await authService.signOut();
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
  };

  const setCurrentUser = async (user: UserProfile) => {
    setCurrentUserState(user);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
    try {
      await authService.upsertProfile(user);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
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
