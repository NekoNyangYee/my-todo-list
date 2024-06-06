'use client';

import { useRouter } from 'next/navigation';
import useAuthStore from '@components/Store/authStore';
import { supabase } from '../lib/supabaseClient';
import { updateProfile } from '../lib/updateProfile';

const AuthForm: React.FC = () => {
    const {
        email, setEmail, password, setPassword,
        authType, setAuthType, confirmPassword,
        setConfirmPassword, fullName, setFullName
    } = useAuthStore();
    const router = useRouter();

    const handleAuth = async () => {
        if (authType === 'signin') {
            // 먼저 해당 이메일의 프로바이더를 체크
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('provider')
                .eq('email', email)
                .single();

            if (userError) {
                alert('사용자를 찾을 수 없습니다.');
                console.error('Error fetching user provider:', userError.message);
                return;
            }

            if (user && user.provider !== 'email') {
                alert('이 이메일은 소셜 로그인 계정입니다. 소셜 로그인을 사용해주세요.');
                return;
            }

            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                alert('비밀번호나 이메일이 일치하지 않습니다.');
                console.error('Error signing in:', error.message);
            } else if (data.session) {
                await updateProfile(data.session.user, 'email');
                router.refresh();
            }
        } else {
            if (password !== confirmPassword) {
                alert('비밀번호가 일치하지 않습니다.');
                return;
            } else if (!fullName) {
                alert('닉네임을 입력해주세요.');
                return;
            }

            // 테스트 시 이메일 발송 부분 주석 처리
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) {
                if (error.message === 'User already registered') {
                    alert('이미 등록된 이메일입니다. 로그인 페이지로 이동합니다.');
                    setAuthType('signin');
                } else {
                    console.error('Error signing up:', error.message);
                }
            } else if (data.session) {
                await updateProfile(data.session.user, 'email');
                alert('회원가입이 완료되었습니다. 최초 회원가입 후 자동으로 로그인됩니다.');
                router.refresh();
            }
        }
    };

    const handleSocialLogin = async (provider: 'google') => {
        const { data, error } = await supabase.auth.signInWithOAuth({ provider });
        if (error) {
            console.error(`Error signing in with ${provider}:`, error.message);
        } else {
            const user = await supabase.auth.getUser();
            if (user.data.user) {
                await updateProfile(user.data.user, provider);
                router.refresh();
            }
        }
    };

    return (
        <div>
            <h2>{authType === 'signin' ? '로그인' : '회원가입'}</h2>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
            />
            {authType === 'signup' && (
                <>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="비밀번호 확인"
                    />
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="닉네임"
                    />
                </>
            )}
            <button onClick={handleAuth}>
                {authType === 'signin' ? '로그인' : '회원가입'}
            </button>
            <button onClick={() => setAuthType(authType === 'signin' ? 'signup' : 'signin')}>
                {authType === 'signin' ? '회원가입으로 전환' : '로그인으로 전환'}
            </button>
            <div>
                <button onClick={() => handleSocialLogin('google')}>Sign in with Google</button>
            </div>
        </div>
    );
};

export default AuthForm;
