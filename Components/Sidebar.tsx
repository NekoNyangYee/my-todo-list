"use client";

import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    session: Session | null;
}

const SidebarContainer = styled.div<{ isOpen: boolean }>`
    width: 250px;
    height: 100vh;
    position: fixed;
    right: ${({ isOpen }) => (isOpen ? '0' : '-300px')};
    top: 0;
    background-color: #F6F8FC;
    display: flex;
    flex-direction: column;
    padding: 20px;
    transition: right 0.2s cubic-bezier(0.8, 0.5, 0.52, 1.0);
    z-index: 1000;
`;

const SidebarLink = styled(Link)`
    color: #6a6a6a;
    text-decoration: none;
    padding: 10px 0;
    font-size: 1.2rem;
    border-radius: 8px;

    &:hover {
        background-color: #d3d3d3;
        padding-left: 10px;
    }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
    display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 101;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    margin-left: auto;

    & img {
        width: 40px;
        height: 40px;
    }
`;

const ProfileContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
`;

const ProfileImage = styled.img`
    width: 140px;
    height: 140px;
    border-radius: 50%;
    margin-bottom: 10px;
`;

const UserInfoText = styled.h2`
    color: #6a6a6a;
    text-align: center;
`;

const EditProfileBtn = styled.button<{ isEditerOpen: boolean }>`
    padding: 1rem 3.2rem 1rem;
    background-color: ${({ isEditerOpen }) => (isEditerOpen ? '#e7e7e7' : 'transparent')};
    color: #6a6a6a;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: bold;
    transition: background-color 0.2s;
    text-align: left;
    background-image: url('/edit.svg');
    background-repeat: no-repeat;
    background-position: left 20px center;
    background-size: 1.4rem;

    &:hover {
        background-color: #e7e7e7;
    }

    &:disabled {
        background-color: #d3d3d3;
        cursor: not-allowed;
        opacity: 0.5;
    }
`;

const InputContainer = styled.div<{ isEditOpen: boolean }>`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 8px;
    margin-top: 12px;
`;

const InputField = styled.input`
    padding: 1rem;
    border-radius: 8px;
    border: none;
    width: 100%;
    box-sizing: border-box;
    background-color: #FFFFFF;
    font-size: 1rem;
    outline: none;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 10px;
`;

const SaveButton = styled.button`
    padding: 10px 20px;
    border-radius: 4px;
    border: none;
    background-color: #0075ff;
    color: #ffffff;
    cursor: pointer;

    &:hover {
        background-color: #005bb5;
    }
`;

const LogOutBtn = styled.button`
    padding: 12px 16px;
    background-color: #ffb8b8;
    color: #c33c3c;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin: auto 0;
    font-size: 0.8rem;
    font-weight: bold;
    transition: background-color 0.2s;

    &:hover {
        background-color: #ff4949;
        color: #ffffff;
    }
`;

const WarningText = styled.p`
    color: #ff4949;
    font-size: 0.8rem;
    text-align: left;
    margin: 0;
`;

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, session }) => {
    const [profile, setProfile] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedName, setEditedName] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (session) {
            fetchProfile(session.user.id);
        }
    }, [session]);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url, provider')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error.message);
        } else {
            setProfile(data);
            console.log('Profile fetched successfully:', data);
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
            console.log('Profile updated successfully');
            const { error: metaError } = await supabase.auth.updateUser({
                data: { full_name: editedName },
            });

            if (metaError) {
                console.error('Error updating user metadata:', metaError.message);
            } else {
                console.log('User metadata updated successfully');
                alert('닉네임이 수정되었습니다.');
                setProfile((prevProfile: any) => ({ ...prevProfile, full_name: editedName }));
                setIsEditMode(false);
            }
        }
    };

    const handleLogout = async () => {
        alert('로그아웃 되었습니다.');
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error.message);
        } else {
            window.location.reload();
        }
    };
    return (
        <>
            <SidebarContainer isOpen={isOpen}>
                <CloseButton onClick={toggleSidebar}>
                    <img src="./close.svg" alt="Close" />
                </CloseButton>
                {profile ? (
                    <ProfileContainer>
                        <ProfileImage src={profile.avatar_url || "./user.svg"} alt="Profile Picture" />
                        <UserInfoText>{profile.full_name}</UserInfoText>
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
                    </ProfileContainer>
                ) : (
                    <SidebarLink href="/">홈</SidebarLink>
                )}
                <SidebarLink href="/" onClick={toggleSidebar}>홈</SidebarLink>
                <SidebarLink href="/calendar" onClick={toggleSidebar}>캘린더</SidebarLink>
                <LogOutBtn onClick={handleLogout}>로그아웃</LogOutBtn>
            </SidebarContainer>
            <Overlay isOpen={isOpen} onClick={toggleSidebar} />
        </>
    );
};

export default Sidebar;