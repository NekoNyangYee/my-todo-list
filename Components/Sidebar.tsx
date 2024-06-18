"use client";

import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import Image from 'next/image';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    session: Session | null;
}

const SidebarContainer = styled.div<{ isOpen: boolean }>`
    width: 250px;
    height: 100%;
    position: fixed;
    right: ${({ isOpen }) => (isOpen ? '0' : '-300px')};
    top: 0;
    background-color: #F6F8FC;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20px;
    gap: 20px;
    transition: right 0.2s cubic-bezier(0.8, 0.5, 0.52, 1.0);
    z-index: 1000;
    overflow-y: auto;
    box-sizing: border-box;

    &::-webkit-scrollbar {
        width: 0;
    }

    &::-webkit-scrollbar-thumb {
        background-color: transparent;
        border-radius: 8px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }
`;


const SidebarLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: 12px;
    color: #6a6a6a;
    text-decoration: none;
    font-size: 1.2rem;
    border-radius: 8px;

    &:hover {
        background-color: #d3d3d3;
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

const ProfileImage = styled.img`
    width: 60px;
    height: 60px;
    border-radius: 50%;
`;

const UserInfoText = styled.h2`
    color: #6a6a6a;
    text-align: center;
    font-size: 1.2rem;
    margin: 0;
    word-break: break-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const EditProfileBtn = styled.button<{ isEditerOpen: boolean }>`
    background-color: ${({ isEditerOpen }) => (isEditerOpen ? '#e7e7e7' : 'transparent')};
    color: #6a6a6a;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: bold;
    transition: background-color 0.2s;
    text-align: left;
    padding: 8px 16px;
    background-color: #e7e7e7;

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
    padding: 1rem 0;
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
    margin-top: auto;
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

const ProfileSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
`;

const TabImage = styled(Image)`
    cursor: pointer;
    transition: transform 0.2s;
`;

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, session }) => {
    const [profile, setProfile] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedName, setEditedName] = useState('');

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
        toggleSidebar();
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
                {profile ? (
                    <>
                        <ProfileSection>
                            <ProfileImage src={profile.avatar_url || "./user.svg"} alt="Profile Picture" />
                            <UserInfoText>{profile.full_name}</UserInfoText>
                            <EditProfileBtn onClick={handleEditProfile} isEditerOpen={isEditMode}>
                                프로필 편집
                            </EditProfileBtn>
                        </ProfileSection>
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
                    </>
                ) : (
                    <SidebarLink href="/">홈</SidebarLink>
                )}
                <SidebarLink href="/" onClick={toggleSidebar}>
                    <TabImage src="./home.svg" width={24} height={24} alt="Home" />
                    <span>홈 (대시보드)</span>
                </SidebarLink>
                <SidebarLink href="/calendar" onClick={toggleSidebar}>
                    <TabImage src="./tab-calendar.svg" width={24} height={24} alt="Home" />
                    <span>캘린더</span>
                </SidebarLink>
                <LogOutBtn onClick={handleLogout}>로그아웃</LogOutBtn>
            </SidebarContainer>
            <Overlay isOpen={isOpen} onClick={toggleSidebar} />
        </>
    );
};

export default Sidebar;