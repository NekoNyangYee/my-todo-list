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
    padding: '12px 16px',
    backgroundColor: '#FFB8B8',
    color: '#C33C3C',
    border: 'none',
    borderRadius: '8px',
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

const EditProfileBtn = styled('button')<{ isEditerOpen: boolean }>({
    padding: '1rem 3.2rem 1rem',
    backgroundColor: (props) => props.isEditerOpen ? '#E7E7E7' : 'transparent',
    color: '#6A6A6A',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
    textAlign: 'left',
    backgroundImage: 'url("/edit.svg")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left 20px center',
    backgroundSize: '1.4rem',

    '&:hover': {
        backgroundColor: '#E7E7E7',
    },

    '&:disabled': {
        backgroundColor: '#D3D3D3', // 얕은 회색 배경
        cursor: 'not-allowed',
        opacity: 0.5, // 불투명도 조정
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
    position: 'relative', // 자식 요소인 CloseButton의 위치 설정을 위해 relative로 변경
    animation: (props) => props.isModalOpen ? `${fadeInModal} 0.2s ease forwards` : `${fadeOutModal} 0.2s ease forwards`,
    maxHeight: '80vh', // 최대 높이를 뷰포트 높이의 80%로 설정
    overflowY: 'auto', // 수직 스크롤 설정

    "&::-webkit-scrollbar": {
        width: '8px',
    },

    "&::-webkit-scrollbar-thumb": {
        backgroundColor: '#E1E1E1',
        borderRadius: '8px',
    },

    "&::-webkit-scrollbar-track": {
        background: 'transparent',
    },

    '@media (max-width: 1224px)': {
        maxWidth: '100%',
        flex: 1,
    },

    "@media (max-width: 1224px)": {
        maxWidth: '80%',
    },
});


const CloseButton = styled('button')({
    background: 'none',
    border: 'none',
    cursor: 'pointer',

    "& img": {
        width: '40px',
        height: '40px',
    }
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

const ModalProfileSection = styled('div')({
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',

    '@media (max-width: 768px)': {
        flexDirection: 'column',
    },
});

const ProfileContainer = styled('div')({
    position: 'relative',
    display: 'inline-block',
});

const ModalProfileImage = styled('img')({
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    position: 'relative',
});

const LoginWIthBadge = styled('img')({
    width: '40px',
    height: '40px',
    position: 'absolute',
    bottom: '30px', // 프로필 이미지의 아래쪽에 배치
    right: '20px', // 프로필 이미지의 오른쪽에 배치
    borderRadius: '50%',
    transform: 'translate(50%, 50%)', // 정확한 위치 조정을 위해 변환 적용
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

const InputContainer = styled('div')<{ isEditOpen: boolean }>({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '12px',
    animation: (props) => (props.isEditOpen ? fadeInModal : fadeOutModal) + " 0.2s",
});

const InputField = styled('input')({
    padding: '1rem',
    borderRadius: '8px',
    border: 'none',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#F6F8FC',
    fontSize: '1rem',
    outline: 'none',
});

const ButtonContainer = styled('div')({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '10px',
});

const SaveButton = styled('button')({
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#0075FF',
    color: '#FFFFFF',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: '#005BB5',
    },
});

const WarningText = styled('p')({
    color: '#FF4949',
    fontSize: '0.8rem',
    textAlign: 'left',
    margin: '0',
});

const AuthHeader = () => {
    const [session, setSession] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [animateOut, setAnimateOut] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedName, setEditedName] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setAnimateOut(true);
                setTimeout(() => {
                    setAnimateOut(false);
                    setIsModalOpen(false);
                    setIsEditMode(false);
                }, 200);
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
            if (session) {
                fetchProfile(session.user.id);
            }
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                fetchProfile(session.user.id);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url, provider, created_at')
            .eq('id', userId)
            .single();

        if (error) {
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
            setIsEditMode(false);
        }, 100);
    };

    const handleOverlayClick = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
            closeModal();
            setTimeout(() => {
                setIsEditMode(false);
            }, 100);
        }
    };

    const handleEditProfile = () => {
        setEditedName(profile.full_name);
        setIsEditMode(!isEditMode);
    };

    const handleSaveProfile = async () => {
        if (editedName.length === 0) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        const updates = {
            full_name: editedName,
            updated_at: new Date(),
        };

        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', profile.id);

        if (error) {
            console.error('Error updating profile:', error.message);
        } else {
            // 세션의 user_metadata도 업데이트하여 최신 상태를 유지
            const { error: metaError } = await supabase.auth.updateUser({
                data: { full_name: editedName },
            });

            if (metaError) {
                console.error('Error updating user metadata:', metaError.message);
            } else {
                alert('닉네임이 수정되었습니다.');
                setProfile((prevProfile: any) => ({ ...prevProfile, full_name: editedName }));
                setSession((prevSession: any) => ({
                    ...prevSession,
                    user: {
                        ...prevSession.user,
                        user_metadata: {
                            ...prevSession.user.user_metadata,
                            full_name: editedName,
                        },
                    },
                }));
                setIsEditMode(false);
            }
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isModalOpen]);

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
                                <UserInfoText><strong>{profile.full_name}</strong>님, 환영해요.</UserInfoText>
                                <ProfileModalBtn onClick={openModal}>
                                    <ProfileImage src={profile.avatar_url || "./user.svg"} alt="Profile Picture" width={250} height={250} />
                                </ProfileModalBtn>
                            </HeaderFlexBox>
                        ) : (
                            <ProfileImage src={"./user.svg"} alt="Profile Picture" width={250} height={250} />
                        )}
                    </ProfileInfoContainer>
                )}
            </AuthHeaderContainer>
            {(isModalOpen || animateOut) && (
                <ModalOverlay onClick={handleOverlayClick}>
                    <ModalContent isModalOpen={isModalOpen && !animateOut} ref={modalRef}>
                        <CloseButton onClick={closeModal}>
                            <img src="./close.svg" alt="Close" />
                        </CloseButton>
                        {profile ? (
                            <ModalFlexBox>
                                <ModalProfileSection>
                                    <ProfileContainer>
                                        <ModalProfileImage src={profile.avatar_url || "./user.svg"} alt="Profile Picture" />
                                        {profile.provider === 'google' && (
                                            <LoginWIthBadge src="./login-with-google.svg" alt="Google Logo" />
                                        )}
                                        {profile.provider === 'email' && (
                                            <LoginWIthBadge src="./login-with-email.svg" alt="Email Logo" />
                                        )}
                                        {profile.provider === 'kakao' && (
                                            <LoginWIthBadge src="./login-with-kakao.svg" alt="Kakao Logo" />
                                        )}
                                    </ProfileContainer>
                                </ModalProfileSection>
                                <ModalUserInfoText>{profile.full_name}</ModalUserInfoText>
                            </ModalFlexBox>
                        ) : (
                            <ModalProfileImage src={profile.avatar_url || "./user.svg"} alt="Profile Picture" />
                        )}
                        <ModalInfoSettingContainer>
                            <EditProfileBtn onClick={handleEditProfile} isEditerOpen={isEditMode}>
                                프로필 편집
                            </EditProfileBtn>
                            {isEditMode && (
                                <InputContainer isEditOpen={isEditMode}>
                                    <label>닉네임</label>
                                    <InputField
                                        type="text"
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        disabled={profile.provider !== 'email'}
                                    />
                                    {profile.provider === 'email' || (
                                        <WarningText>{`${profile.provider}로 로그인 한 경우 프로필 편집을 할 수 없습니다.`}</WarningText>
                                    )}
                                    <label>이메일</label>
                                    <InputField
                                        type="text"
                                        value={profile.email}
                                        disabled
                                    />
                                    <label>가입일자</label>
                                    <InputField
                                        type="text"
                                        value={new Date(profile.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        disabled
                                    />
                                    <ButtonContainer>
                                        <SaveButton onClick={handleSaveProfile} disabled={editedName.length === 0}>저장</SaveButton>
                                    </ButtonContainer>
                                </InputContainer>
                            )}
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