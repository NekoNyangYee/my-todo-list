import { create } from 'zustand';

interface AuthStore {
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    authType: 'signin' | 'signup';
    setAuthType: (authType: 'signin' | 'signup') => void;
    confirmPassword: string;
    setConfirmPassword: (confirmPassword: string) => void;
    fullName: string;
    setFullName: (fullName: string) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    email: '',
    setEmail: (email) => set({ email }),
    password: '',
    setPassword: (password) => set({ password }),
    authType: 'signin',
    setAuthType: (authType) => set({ authType }),
    confirmPassword: '',
    setConfirmPassword: (confirmPassword) => set({ confirmPassword }),
    fullName: '',
    setFullName: (fullName) => set({ fullName }),
}));
