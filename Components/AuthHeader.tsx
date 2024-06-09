"use client";

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AuthForm from "./AuthForm";
import { Session } from "@supabase/supabase-js";
import { keyframes, styled } from "@pigment-css/react";
import TodoComponent from "./TodoComponent";

const HeaderFlexBox = styled("div")({
    display: 'flex',
    gap: '12px',
});

const ProfileImage = styled('img')({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    margin: 'auto 0'
});

const MainLogoImage = styled('img')({
    width: '120px',
    height: '60px',
    cursor: 'pointer',
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
    backgroundColor: '#FFB8B8',
    color: '#C33C3C',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: 'auto 0',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',

    '&:hover': {
        backgroundColor: '#FF4949',
        color: '#FFFFFF',
    }
});

const ProfileInfoContainer = styled('div')({
    display: 'flex',
    flexDirection: 'row-reverse',
    gap: '12px',
    borderRadius: '8px',
});

const fadeInModal = keyframes({
    'from': {
        opacity: 0,
        transform: 'translateY(-20px)'
    },
    'to': {
        opacity: 1,
        transform: 'translateY(0)'
    }
});

const fadeOutModal = keyframes({
    'from': {
        opacity: 1,
        transform: 'translateY(0)'
    },
    'to': {
        opacity: 0,
        transform: 'translateY(-20px)'
    }
});

const ModalOverlay = styled('div')({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
});

const ModalContent = styled('div')<{ isModalOpen: boolean }>({
    background: '#F6F8FC',
    padding: '20px',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    cursor: 'auto',  // 모달 내용 클릭 시 이벤트 전파 막기 위해 포인터 설정 해제
    position: 'relative',
    animation: (props) => props.isModalOpen ? `${fadeInModal} 0.2s ease forwards` : `${fadeOutModal} 0.2s ease forwards`,

    "@media (max-width: 1224px)": {
        maxWidth: '80%',
    }
});

const CloseButton = styled('button')({
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    position: 'absolute',
    top: '10px',
    right: '10px',
});

const ProfileModalBtn = styled('button')({
    padding: '0',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'transform 0.2s',

    '&:hover': {
        transform: 'scale(1.1)',
    }
});

const ModalUserInfoText = styled('h2')({
    color: '#6A6A6A',
    textAlign: 'center',
    margin: 'auto 0',
});

const ModalFlexBox = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
});

const ModalProfileImage = styled('img')({
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    margin: 'auto',
});

const ModalInfoSettingContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '20px',
    padding: '20px',
    borderRadius: '8px',
});

const AuthHeader = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [animateOut, setAnimateOut] = useState<boolean>(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsModalOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
            sessionStorage.removeItem('supabase.auth.token');

            const deleteCookie = (name: string) => {
                document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            };
            deleteCookie('supabase.auth');
            deleteCookie('another_cookie_name');

            window.location.reload();
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setAnimateOut(true);
        setTimeout(() => {
            setAnimateOut(false);
            setIsModalOpen(false);
        }, 100);
    };

    const handleOverlayClick = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    };

    return (
        <>
            <AuthHeaderContainer>
                <MainLogoImage src="./main-logo.svg" alt="Todo" />
                {!session ? (
                    <AuthForm />
                ) : (
                    <ProfileInfoContainer>
                        {profile ? (
                            <HeaderFlexBox>
                                <UserInfoText><strong>{profile.full_name}</strong> 님, 환영합니다.</UserInfoText>
                                <ProfileModalBtn onClick={openModal}>
                                    <ProfileImage src={profile.avatar_url || "./user.svg"} alt="Profile Picture" width={250} height={250} />
                                </ProfileModalBtn>
                            </HeaderFlexBox>
                        ) : (
                            <p>프로필 불러오는 중...</p>
                        )}
                    </ProfileInfoContainer>
                )}
            </AuthHeaderContainer>
            {(isModalOpen || animateOut) && (
                <ModalOverlay onClick={handleOverlayClick}>
                    <ModalContent isModalOpen={isModalOpen && !animateOut}>
                        <CloseButton onClick={closeModal}>&times;</CloseButton>
                        {profile ? (
                            <ModalFlexBox>
                                <ModalProfileImage src={profile.avatar_url || "./user.svg"} alt="Profile Picture" width={250} height={250} />
                                <ModalUserInfoText>{profile.full_name}</ModalUserInfoText>
                            </ModalFlexBox>
                        ) : (
                            <p>프로필 불러오는 중...</p>
                        )}
                        <ModalInfoSettingContainer>
                            <LogOutBtn onClick={handleLogout}>로그아웃</LogOutBtn>
                        </ModalInfoSettingContainer>
                    </ModalContent>
                </ModalOverlay>
            )}

            <TodoComponent />
        </>
    );
};

export default AuthHeader;
