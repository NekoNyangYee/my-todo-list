"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@components/lib/supabaseClient";
import AuthForm from "./AuthForm";
import { Session } from "@supabase/supabase-js";
import { styled } from "@pigment-css/react";

const HeaderFlexBox = styled("div")({
    display: 'flex',
    gap: '12px',
})

const ProfileImage = styled('img')({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    margin: 'auto 0'
})
const TodoComponent = () => {
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
            console.log('Auth state changed, new session:', session);
            if (session) {
                fetchProfile(session.user.id, session);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId: string, session: Session) => {
        console.log('Fetching profile for userId:', userId);
        console.log('Session data:', session);  // Add this line to log session data
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
            console.log('Fetched profile:', data);
            setProfile(data);
        }
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error.message);
        } else {
            setSession(null);
            setProfile(null);
        }
    };

    return (
        <div>
            {!session ? (
                <AuthForm />
            ) : (
                <div>
                    {profile ? (
                        <HeaderFlexBox>
                            <p><strong>{profile.full_name}</strong> 님, 환영합니다.</p>
                            {profile.avatar_url ? (
                                <ProfileImage src={profile.avatar_url} alt="Profile Picture" width={250} height={250} />
                            ) : (
                                <ProfileImage src="./profile.svg" alt="Profile Picture" width={250} height={250} />
                            )}
                        </HeaderFlexBox>
                    ) : (
                        <p>프로필 불러오는 중...</p>
                    )}
                    <button onClick={handleLogout}>로그아웃</button>
                </div>
            )}
        </div>
    );
};

export default TodoComponent;