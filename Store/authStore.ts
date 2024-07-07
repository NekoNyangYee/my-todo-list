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
    user: any; // 사용자 정보를 저장할 타입
    setUser: (user: any) => void; // 사용자 정보를 설정하는 함수
    logout: () => void; // 로그아웃 함수
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
    user: null, // 초기 사용자 상태는 null로 설정
    setUser: (user) => set({ user }), // 사용자 정보를 설정하는 함수
    logout: () => set({ user: null, email: '', password: '', confirmPassword: '', fullName: '' }) // 로그아웃 시 모든 정보 초기화
}));
