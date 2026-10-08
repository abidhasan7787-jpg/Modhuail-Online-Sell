import { UserProfile, UserRole } from '../types';

const AUTH_USER_KEY = 'mj_auth_user_v1';
const REGISTERED_USERS_KEY = 'mj_registered_users_v1';
const PASSWORDS_KEY = 'mj_passwords_v1';

// Initial pre-configured accounts
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'admin-santo-01',
    email: 'admin@mj.com',
    full_name: 'Santo Admin',
    phone: '+880 1711-998877',
    role: 'super_admin',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-001',
    email: 'sabrina.rahman@example.com',
    full_name: 'Sabrina Rahman',
    phone: '01711223344',
    role: 'customer',
    created_at: new Date('2026-02-15').toISOString(),
    updated_at: new Date().toISOString(),
    default_address: {
      id: 'addr-001',
      full_name: 'Sabrina Rahman',
      phone: '01711223344',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Dhanmondi',
      street_address: 'House 14/A, Road 8, Dhanmondi',
      postal_code: '1205',
    }
  },
  {
    id: 'user-002',
    email: 'tanvir.hossain@example.com',
    full_name: 'Tanvir Hossain',
    phone: '01812345678',
    role: 'customer',
    created_at: new Date('2026-03-01').toISOString(),
    updated_at: new Date().toISOString(),
  }
];

function getStoredUsers(): UserProfile[] {
  if (typeof window === 'undefined') return INITIAL_USERS;
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

function saveStoredUsers(users: UserProfile[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

function getStoredPasswords(): Record<string, string> {
  if (typeof window === 'undefined') return { 'admin@mj.com': 'admin123' };
  try {
    const raw = localStorage.getItem(PASSWORDS_KEY);
    if (!raw) {
      const initial = { 'admin@mj.com': 'admin123' };
      localStorage.setItem(PASSWORDS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return { 'admin@mj.com': 'admin123' };
  }
}

function savePassword(email: string, pass: string) {
  if (typeof window === 'undefined') return;
  const passwords = getStoredPasswords();
  passwords[email.trim().toLowerCase()] = pass;
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
}

class AuthService {
  private currentUser: UserProfile | null = null;
  private listeners: Array<(user: UserProfile | null) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(AUTH_USER_KEY);
        if (raw) {
          this.currentUser = JSON.parse(raw);
        }
      } catch (e) {
        console.error('Failed to parse active user session', e);
      }
    }
  }

  public subscribe(callback: (user: UserProfile | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public isAdmin(): boolean {
    if (!this.currentUser) return false;
    return ['super_admin', 'admin', 'manager', 'editor', 'order_manager'].includes(this.currentUser.role);
  }

  public isSuperAdmin(): boolean {
    return this.currentUser?.role === 'super_admin';
  }

  public loginAsAdminDirectly(): { success: boolean; user: UserProfile } {
    const users = getStoredUsers();
    let admin = users.find(u => u.role === 'super_admin' || u.email.toLowerCase() === 'admin@mj.com');
    if (!admin) {
      admin = INITIAL_USERS[0];
      users.unshift(admin);
      saveStoredUsers(users);
    }
    this.currentUser = admin;
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(admin));
    }
    this.notify();
    return { success: true, user: admin };
  }

  public getAdminPassword(): string {
    const passwords = getStoredPasswords();
    return passwords['admin@mj.com'] || 'admin123';
  }

  public resetAdminPassword(newPassword: string = 'admin123'): { success: boolean; message: string } {
    const cleanPass = newPassword.trim() || 'admin123';
    savePassword('admin@mj.com', cleanPass);
    return { success: true, message: `Admin password updated successfully to: ${cleanPass}` };
  }

  public login(email: string, password?: string): { success: boolean; user?: UserProfile; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const users = getStoredUsers();

    // Check if matching user exists
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }

    // Administrative accounts validation
    if (user.role !== 'customer') {
      const storedPasswords = getStoredPasswords();
      const expectedPassword = storedPasswords[cleanEmail] || 'admin123';
      
      // Allow current custom password OR master recovery password 'admin123'
      if (password && password !== expectedPassword && password !== 'admin123') {
        return { success: false, error: 'Incorrect password. Please verify or use the Reset Password option below.' };
      }
    }

    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
    this.notify();
    return { success: true, user };
  }

  public changePassword(oldPassword: string, newPassword: string): { success: boolean; error?: string } {
    if (!this.currentUser) {
      return { success: false, error: 'User is not logged in.' };
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const email = this.currentUser.email.trim().toLowerCase();
    const storedPasswords = getStoredPasswords();
    const currentStored = storedPasswords[email] || 'admin123';

    if (oldPassword !== currentStored) {
      return { success: false, error: 'Current password is incorrect. Please verify and try again.' };
    }

    savePassword(email, newPassword.trim());
    return { success: true };
  }

  public register(fullName: string, email: string, phone: string, password?: string): { success: boolean; user?: UserProfile; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const users = getStoredUsers();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      full_name: fullName.trim(),
      phone: phone.trim(),
      role: 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.push(newUser);
    saveStoredUsers(users);

    this.currentUser = newUser;
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    }
    this.notify();
    return { success: true, user: newUser };
  }

  public updateProfile(updates: Partial<UserProfile>): UserProfile {
    if (!this.currentUser) throw new Error('Not authenticated');

    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === this.currentUser!.id);
    const updated = {
      ...this.currentUser,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (idx !== -1) {
      users[idx] = updated;
      saveStoredUsers(users);
    }

    this.currentUser = updated;
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    }
    this.notify();
    return updated;
  }

  public logout(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_USER_KEY);
    }
    this.notify();
  }

  public getAllUsers(): UserProfile[] {
    return getStoredUsers();
  }
}

export const auth = new AuthService();
