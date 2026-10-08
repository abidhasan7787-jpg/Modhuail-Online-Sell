import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { auth } from '../services/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => { success: boolean; user?: UserProfile; error?: string };
  register: (fullName: string, email: string, phone: string, password?: string) => { success: boolean; user?: UserProfile; error?: string };
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => UserProfile;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(auth.getCurrentUser());

  useEffect(() => {
    const unsubscribe = auth.subscribe((updatedUser) => {
      setUser(updatedUser);
    });
    return unsubscribe;
  }, []);

  const login = (email: string, password: string) => {
    return auth.login(email, password);
  };

  const register = (fullName: string, email: string, phone: string, password?: string) => {
    return auth.register(fullName, email, phone, password);
  };

  const logout = () => {
    auth.logout();
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    return auth.updateProfile(updates);
  };

  const changePassword = (oldPassword: string, newPassword: string) => {
    return auth.changePassword(oldPassword, newPassword);
  };

  const isAdmin = user ? ['super_admin', 'admin', 'manager', 'editor', 'order_manager'].includes(user.role) : false;
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isSuperAdmin,
        login,
        register,
        changePassword,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
