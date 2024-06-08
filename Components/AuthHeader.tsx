"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AuthForm from "./AuthForm";
import { Session } from "@supabase/supabase-js";
import { styled } from "@pigment-css/react";
import TodoComponent from "./TodoComponent";

const HeaderFlexBox = styled("div")({
    display: 'flex',
    gap: '12px',
})

const ProfileImage = styled('img')({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    margin: 'auto 0'
});

const MainLogoImage = styled('img')({
    width: '120px',
    height: '60px',
    filter: 'drop-shadow(4px 4px 4px #C9C9C9)',

});

const AuthHeaderContainer = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    margin: '0 auto',
    maxWidth: '972px',
    width: '100%',
    padding: '12px',

    '@media (max-width: 1224px)': {
        maxWidth: '90%',
    }
});

const UserInfoText = styled('p')({
    color: '#6A6A6A',
    fontSize: '1rem',
    textAlign: 'center',
    margin: 'auto 0',

    "& strong": {
        color: '#0075FF',
    },

    "@media (max-width: 768px)": {
        display: 'none',
    }
});

const LogOutBtn = styled('button')({
    padding: '8px 12px',
    backgroundColor: '#0075FF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: 'auto 0',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',

    '&:hover': {
        backgroundColor: '#0055CC',
    }
});

const ProfileInfoContainer = styled('div')({
    display: 'flex',
    flexDirection: 'row-reverse',
    gap: '12px',
    borderRadius: '8px',
});

const AuthHeader = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            console.log('Current session:', session);
            if (session) {
                fetchProfile(session.user.id, session);
            }
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                fetchProfile(session.user.id, session);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId: string, session: Session) => {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url')
            .eq('id', userId)
            .single();

        if (error && error.message === 'JSON object requested, multiple (or no) rows returned') {
            console.error('No profile found, creating a new profile');
            // 프로필이 없을 경우 새로 생성
            const { error: insertError } = await supabase.from('users').upsert({
                id: userId,
                email: session?.user?.email || '',
                full_name: session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || '',
                avatar_url: session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture || '',
                provider: session?.user?.app_metadata?.provider || 'email',
                created_at: new Date(),
                updated_at: new Date(),
            });

            if (insertError) {
                console.error('Error inserting new profile:', insertError.message);
            } else {
                // 새로 생성한 프로필을 다시 가져옴
                const { data: newData, error: newError } = await supabase
                    .from('users')
                    .select('id, email, full_name, avatar_url')
                    .eq('id', userId)
                    .single();
                if (newError) {
                    console.error('Error fetching new profile:', newError.message);
                } else {
                    setProfile(newData);
                }
            }
        } else if (error) {
            console.error('Error fetching profile:', error.message);
        } else {
            setProfile(data);
        }
    };

    const handleLogout = async () => {
        alert('로그아웃 되었습니다.');
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error.message);
        } else {
            setSession(null);
            setProfile(null);
            localStorage.removeItem('supabase.auth.token');

            // 모든 쿠키 제거
            document.cookie.split(";").forEach((cookie) => {
                const name = cookie.trim().split("=")[0];
                document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            });
        }
    };

    return (
        <>
            <AuthHeaderContainer>
                <MainLogoImage src="./main-logo.svg" alt="Todo" width={150} height={150} />
                {!session ? (
                    <AuthForm />
                ) : (
                    <ProfileInfoContainer>
                        {profile ? (
                            <HeaderFlexBox>
                                <UserInfoText><strong>{profile.full_name}</strong> 님, 환영합니다.</UserInfoText>
                                {profile.avatar_url ? (
                                    <ProfileImage src={profile.avatar_url} alt="Profile Picture" width={250} height={250} />
                                ) : (
                                    <ProfileImage src="./user.svg" alt="Profile Picture" width={250} height={250} />
                                )}
                            </HeaderFlexBox>
                        ) : (
                            <p>프로필 불러오는 중...</p>
                        )}
                        <LogOutBtn onClick={handleLogout}>로그아웃</LogOutBtn>
                    </ProfileInfoContainer>
                )}
            </AuthHeaderContainer>
            <TodoComponent />
        </>
    );
};

export default AuthHeader;