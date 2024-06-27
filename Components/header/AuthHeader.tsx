"use client";

import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@components/lib/supabaseClient";
import Sidebar from "../Sidebar";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@components/app/Context/ThemeContext";
import ThemeToggle from "../ThemeToggle";

const HeaderFlexBox = styled.div`
  display: flex;
  gap: 24px;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: auto 0;
`;

const MainLogoImage = styled(Image)`
  width: 100px;
  cursor: pointer;
`;

const AuthHeaderContainer = styled.div<{ themeStyles: any }>`
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: ${({ themeStyles }) => themeStyles.headerBackground};
  gap: 12px;
  padding: 12px;
  z-index: 100;
  margin: 0 auto;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
`;

const AuthHeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 972px;
  gap: 12px;

  @media (max-width: 1224px) {
    max-width: 90%;
  }
`;

const UserInfoText = styled.div<{ themeStyles: any }>`
  display: flex;
  gap: 24px;
  color: ${({ themeStyles }) => themeStyles.text};
  font-size: 1rem;
  text-align: center;
  margin: auto 0;

  & strong {
    color: ${({ themeStyles }) => themeStyles.link};
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const LogOutBtn = styled.button<{ themeStyles: any }>`
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

const EditProfileBtn = styled.button<{ isEditerOpen: boolean, themeStyles: any }>`
  padding: 1rem 3.2rem 1rem;
  background-color: ${({ isEditerOpen, themeStyles }) => isEditerOpen ? themeStyles.inputBackground : "transparent"};
  color: ${({ themeStyles }) => themeStyles.text};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  transition: background-color 0.2s;
  text-align: left;
  background-image: url("/edit.svg");
  background-repeat: no-repeat;
  background-position: left 20px center;
  background-size: 1.4rem;

  &:hover {
    background-color: ${({ themeStyles }) => themeStyles.inputBackground};
  }

  &:disabled {
    background-color: #d3d3d3;
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const ProfileInfoContainer = styled.div`
  display: flex;
  flex-direction: row-reverse;
  gap: 12px;
  border-radius: 8px;
`;

const fadeInModal = keyframes`
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const fadeOutModal = keyframes`
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(-20px);
    }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);

  @media (max-width: 768px) {
    display: none;
  }
`;

const ModalContent = styled.div<{ isModalOpen: boolean; themeStyles: any }>`
  background-color: ${({ themeStyles }) => themeStyles.colors.background};
  padding: 20px;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: auto;
  position: relative;
  animation: ${({ isModalOpen }) => (isModalOpen ? fadeInModal : fadeOutModal)} 0.2s ease forwards;
  max-height: 80vh;
  overflow-y: auto;
  opacity: 1;
  border: 1px solid ${({ themeStyles }) => themeStyles.colors.inputBorder};

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e1e1e1;
    border-radius: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  @media (max-width: 1224px) {
    max-width: 80%;
  }
`;


const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;

  & img {
    width: 40px;
    height: 40px;
  }
`;

const ProfileModalBtn = styled.button`
  padding: 0;
  border: none;
  background-color: transparent;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const ModalUserInfoText = styled.h2<{ themeStyles: any }>`
  color: ${({ themeStyles }) => themeStyles.text};
  text-align: center;
  margin: auto 0;
`;

const ModalFlexBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModalProfileSection = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ProfileContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ModalProfileImage = styled.img`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  position: relative;
`;

const LoginWIthBadge = styled.img`
  width: 40px;
  height: 40px;
  position: absolute;
  bottom: 30px;
  right: 20px;
  border-radius: 50%;
  transform: translate(50%, 50%);
`;

const ModalInfoSettingContainer = styled.div<{ themeStyles: any }>`
  display: flex;
  flex-direction: column;
  background-color: ${({ themeStyles }) => themeStyles.colors.containerBackground};
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  padding: 20px;
  border-radius: 8px;
`;

const InputContainer = styled.div<{ isEditOpen: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  animation: ${({ isEditOpen }) => (isEditOpen ? fadeInModal : fadeOutModal)}
    0.2s;
`;

const InputField = styled.input<{ themeStyles: any }>`
  padding: 1rem;
  border-radius: 8px;
  border: none;
  width: 100%;
  box-sizing: border-box;
  background-color: ${({ themeStyles }) => themeStyles.inputBackground};
  color: ${({ themeStyles }) => themeStyles.text};
  font-size: 1rem;
  outline: none;

  &:disabled {
    background-color: ${({ themeStyles }) => themeStyles.buttonHoverBackground};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
`;

const SaveButton = styled.button<{ themeStyles: any }>`
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  background-color: #0075FF;
  color: ${({ themeStyles }) => themeStyles.buttonColor};
  cursor: pointer;

  &:hover {
    background-color: ${({ themeStyles }) => themeStyles.buttonHoverBackground};
  }

  &:disabled {
    background-color: ${({ themeStyles }) => themeStyles.buttonBackground};
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const WarningText = styled.p<{ themeStyles: any }>`
  color: ${({ themeStyles }) => themeStyles.buttonBackground};
  font-size: 0.8rem;
  text-align: left;
  margin: 0;
`;

const ToggleButton = styled.button`
  display: none;
  width: 40px;
  height: 40px;
  background-color: transparent;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin: auto 0;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ffffff;
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const LinkTab = styled(Link) <{ themeStyles: any }>`
  text-decoration: none;
  color: ${({ themeStyles }) => themeStyles.colors.text};
  font-size: 1rem;

  &:hover {
    color: ${({ themeStyles }) => themeStyles.linkHover};
    font-weight: bold;
  }
`;

const AuthHeader = () => {
  const { themeStyles } = useTheme();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animateOut, setAnimateOut] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 기존 useEffect 안에 추가
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setAnimateOut(true);
        setTimeout(() => {
          setAnimateOut(false);
          setIsModalOpen(false);
          setIsEditMode(false);
        }, 200);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          fetchProfile(session.user.id, session);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, session: any) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, avatar_url, provider")
      .eq("id", userId)
      .single();

    if (
      error &&
      error.message === "JSON object requested, multiple (or no) rows returned"
    ) {
      console.error("No profile found, creating a new profile");
      // 프로필이 없을 경우 새로 생성
      const { error: insertError } = await supabase.from("users").upsert({
        id: userId,
        email: session?.user?.email || "",
        full_name:
          session?.user?.user_metadata?.full_name ||
          session?.user?.user_metadata?.name ||
          "",
        avatar_url:
          session?.user?.user_metadata?.avatar_url ||
          session?.user?.user_metadata?.picture ||
          "",
        provider: session?.user?.app_metadata?.provider || "email",
        created_at: new Date(),
        updated_at: new Date(),
      });

      if (insertError) {
        console.error("Error inserting new profile:", insertError.message);
      } else {
        // 새로 생성한 프로필을 다시 가져옴
        const { data: newData, error: newError } = await supabase
          .from("users")
          .select("id, email, full_name, avatar_url, provider")
          .eq("id", userId)
          .single();
        if (newError) {
          console.error("Error fetching new profile:", newError.message);
        } else {
          setProfile(newData);
          console.log(
            "New profile inserted and fetched successfully:",
            newData
          ); // 로그 추가
        }
      }
    } else if (error) {
      console.error("Error fetching profile:", error.message);
    } else {
      setProfile(data);
      console.log("Profile fetched successfully:", data); // 로그 추가
    }
  };

  const handleLogout = async () => {
    alert("로그아웃 되었습니다.");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      setSession(null);
      setProfile(null);

      localStorage.removeItem("supabase.auth.token");
      sessionStorage.removeItem("supabase.auth.token");

      const deleteCookie = (name: string) => {
        document.cookie =
          name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      };
      deleteCookie("supabase.auth");
      deleteCookie("another_cookie_name");

      window.location.reload();
    }
  };

  const openModal = () => setIsModalOpen(!isModalOpen);
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
      alert("닉네임을 입력해주세요.");
      return;
    }

    const updates = {
      full_name: editedName,
      updated_at: new Date(),
    };

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", profile.id);

    if (error) {
      console.error("Error updating profile:", error.message);
    } else {
      console.log("Profile updated successfully");
      const { error: metaError } = await supabase.auth.updateUser({
        data: { full_name: editedName },
      });

      if (metaError) {
        console.error("Error updating user metadata:", metaError.message);
      } else {
        console.log("User metadata updated successfully");
        alert("닉네임이 수정되었습니다.");
        setProfile((prevProfile: any) => ({
          ...prevProfile,
          full_name: editedName,
        }));
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
    if (isModalOpen || isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen, isSidebarOpen]);

  return (
    <>
      <AuthHeaderContainer themeStyles={themeStyles}>
        <AuthHeaderContent>
          <MainLogoImage src="./main-logo.svg" width={100} height={50} alt="Todo" />
          {session && (
            <ProfileInfoContainer>
              {profile ? (
                <>
                  <HeaderFlexBox>
                    <UserInfoText themeStyles={themeStyles}>
                      <LinkTab href="/" themeStyles={themeStyles}>홈</LinkTab>
                      <LinkTab href="/calendar" themeStyles={themeStyles}>캘린더</LinkTab>
                    </UserInfoText>
                    <ProfileModalBtn onClick={openModal}>
                      <ProfileImage
                        src={profile.avatar_url || "./user.svg"}
                        alt="Profile Picture"
                      />
                    </ProfileModalBtn>
                    <ToggleButton onClick={toggleSidebar}>
                      <Image src="./menu.svg" width={24} height={24} alt="메뉴" />
                    </ToggleButton>
                  </HeaderFlexBox>
                </>
              ) : (
                <>
                  <ProfileImage src={"./user.svg"} alt="Profile Picture" />
                  <LogOutBtn themeStyles={themeStyles} onClick={handleLogout}>로그아웃</LogOutBtn>
                </>
              )}
            </ProfileInfoContainer>
          )}
        </AuthHeaderContent>
      </AuthHeaderContainer>
      {(isModalOpen || animateOut) && (
        <ModalOverlay onClick={handleOverlayClick}>
          <ModalContent isModalOpen={isModalOpen && !animateOut} ref={modalRef} themeStyles={themeStyles}>
            <CloseButton onClick={closeModal}>
              <img src="./close.svg" alt="Close" />
            </CloseButton>
            {profile ? (
              <ModalFlexBox>
                <ModalProfileSection>
                  <ProfileContainer>
                    <ModalProfileImage
                      src={profile.avatar_url || "./user.svg"}
                      alt="Profile Picture"
                    />
                    {profile.provider === "google" && (
                      <LoginWIthBadge
                        src="./login-with-google.svg"
                        alt="Google Logo"
                      />
                    )}
                    {profile.provider === "email" && (
                      <LoginWIthBadge
                        src="./login-with-email.svg"
                        alt="Email Logo"
                      />
                    )}
                    {profile.provider === "kakao" && (
                      <LoginWIthBadge
                        src="./login-with-kakao.svg"
                        alt="Kakao Logo"
                      />
                    )}
                  </ProfileContainer>
                </ModalProfileSection>
                <ModalUserInfoText themeStyles={themeStyles}>{profile.full_name}</ModalUserInfoText>
              </ModalFlexBox>
            ) : (
              <ModalProfileImage
                src={profile.avatar_url || "./user.svg"}
                alt="Profile Picture"
              />
            )}
            <ModalInfoSettingContainer themeStyles={themeStyles}>
              <EditProfileBtn
                onClick={handleEditProfile}
                isEditerOpen={isEditMode}
                themeStyles={themeStyles}
              >
                프로필 편집
              </EditProfileBtn>
              {isEditMode && (
                <InputContainer isEditOpen={isEditMode}>
                  <label>닉네임</label>
                  <ButtonContainer>
                    <InputField
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      disabled={profile.provider !== "email"}
                      themeStyles={themeStyles}
                    />

                    <SaveButton
                      onClick={handleSaveProfile}
                      disabled={editedName.length === 0 || editedName === profile.full_name}
                      themeStyles={themeStyles}
                    >
                      저장
                    </SaveButton>
                  </ButtonContainer>
                  {profile.provider === "email" || (
                    <WarningText themeStyles={themeStyles}>{`${profile.provider}로 로그인 한 경우 프로필 편집을 할 수 없습니다.`}</WarningText>
                  )}
                  <label>이메일</label>
                  <InputField type="text" value={profile.email} disabled themeStyles={themeStyles} />
                  <label>가입일자</label>
                  <InputField
                    type="text"
                    value={new Date(profile.created_at).toLocaleDateString(
                      "ko-KR",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                    disabled
                    themeStyles={themeStyles}
                  />
                </InputContainer>
              )}
              <ThemeToggle />
              <LogOutBtn themeStyles={themeStyles} onClick={handleLogout}>로그아웃</LogOutBtn>
            </ModalInfoSettingContainer>
          </ModalContent>
        </ModalOverlay>
      )}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        session={session}
      />
    </>
  );
};

export default AuthHeader;
