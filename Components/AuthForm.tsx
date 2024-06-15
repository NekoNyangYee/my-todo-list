"use client";

import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../Store/authStore";
import { supabase } from "../lib/supabaseClient";
import { updateProfile } from "../lib/updateProfile";
import { fetchTodos, setupMidnightCheck } from "@components/util/todoUtil";
import { useTodoStore } from "@components/Store/useAuthTodoStore";
import { set } from "mongoose";

const LoginSiginupContainer = styled.div`
  width: 100%;
  display: flex;
  max-width: 972px;
  justify-content: center;
  align-items: center;
  gap: 4rem;
  margin: 0 auto;
  padding-top: 12rem;

  @media (max-width: 1224px) {
    padding-top: 4rem;
    gap: 2rem;
    max-width: 80%;
    flex-direction: column;
  }
`;

const MainLobySectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  & p {
    color: #6a6a6a;
    font-size: 1.2rem;
    text-align: center;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const LoginAuthContainer = styled.div`
  width: 100%;
`;

const MainLogoImage = styled.img`
  width: 200px;
  height: 200px;
  margin: 0 auto;
  filter: drop-shadow(4px 4px 4px #c9c9c9);
`;

const AuthInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  & input {
    padding: 1rem 46px;
    border-radius: 8px;
    border: none;
    background-image: url('/email.svg');
    background-repeat: no-repeat;
    background-size: 1.4rem;
    background-position: 1rem center;
    z-index: 10;
    font-size: 1rem;

    &:focus {
      outline: none;
      border: 1px solid #e7e7e7;
    }

    &:nth-of-type(2) {
      background-image: url('/password.svg');
    }
  }
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

interface SignUpInputContainerProps {
  isOpen: boolean;
}

const SignUpInputContainer = styled.div<SignUpInputContainerProps>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: ${({ isOpen }) => (isOpen ? fadeInModal : fadeOutModal)} 0.2s;

  & input {
    background-image: url('/password.svg');

    &:nth-of-type(2) {
      background-image: url('/user.svg');
    }
  }
`;

const SocialContainer = styled.div`
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  & button {
    width: 100%;
    padding: 0.8rem;
    border-radius: 8px;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.15);
    }
  }

  & .social-login-flex {
    display: flex;
    gap: 12px;
    justify-content: center;
    align-items: center;
  }
`;

const GoogleSocialLoginBtn = styled.button`
  padding: 0.8rem;
  border-radius: 8px;
  border: none;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.15);
  }
`;

const KaKaoSocialLoginBtn = styled.button`
  padding: 0.8rem;
  border-radius: 8px;
  border: none;
  background-color: #f9e000;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #371c1d;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.15);
  }
`;

const LogoImage = styled.img`
  width: 1.6rem;
  height: 1.6rem;
`;

const LoginAndSignUpBtn = styled.button`
  padding: 1rem;
  border-radius: 8px;
  border: none;
  background-color: #0075ff;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #0059ff;
  }
`;

const SwitchAuthBtn = styled.button`
  padding: 1rem;
  border-radius: 8px;
  border: none;
  background-color: transparent;
  color: #0075ff;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    text-decoration: underline;
  }
`;
const AuthForm = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    authType,
    setAuthType,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
  } = useAuthStore();
  const { setTodos, setUncompletedTodos } = useTodoStore();
  const router = useRouter();

  const handleAuth = async () => {
    if (authType === "signin") {
      console.log('로그인 시도 중...');
      const { data: user } = await supabase
        .from("users")
        .select("provider")
        .eq("email", email)
        .single();

      console.log('User data fetched:', user);

      if (email === "") {
        alert("이메일을 입력해주세요.");
        return;
      } else if (password === "") {
        alert("비밀번호를 입력해주세요.");
        return;
      } else if (user && user.provider !== "email") {
        alert("이 이메일은 소셜 로그인 계정입니다. 소셜 로그인을 사용해주세요.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert("비밀번호나 이메일이 일치하지 않습니다.");
        console.error("로그인 중 오류 발생:", error.message);
      } else if (data.session) {
        console.log('로그인 성공:', data.session.user);
        await updateProfile(data.session.user, 'email');
        router.refresh();
        await fetchTodos(data.session.user.id, setTodos);
        setupMidnightCheck(data.session.user.id, setTodos, setUncompletedTodos);
      }
    } else {
      if (password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      } else if (password === "" || confirmPassword === "") {
        alert("비밀번호를 입력해주세요.");
        return;
      } else if (!fullName) {
        alert("닉네임을 입력해주세요.");
        return;
      } else if (!email) {
        alert("이메일을 입력해주세요.");
        return;
      }

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
        if (error.message === "User already registered") {
          alert("이미 등록된 이메일입니다. 다른 이메일로 입력해주세요.");
          setAuthType("signup");
        } else {
          console.error("Error signing up:", error.message);
        }
      } else if (data.session) {
        await updateProfile(data.session.user, 'email');
        alert("회원가입이 완료되었습니다. 최초 회원가입 후 자동으로 로그인됩니다.");
        router.refresh();
        await fetchTodos(data.session.user.id, setTodos);
        setupMidnightCheck(data.session.user.id, setTodos, setUncompletedTodos);
      }
    }
  };

  const handleSocialLogin = async (provider: "google" | 'kakao') => {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      console.error(`Error signing in with ${provider}:`, error.message);
    } else {
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        await updateProfile(user.data.user, provider);
        await setupMidnightCheck(user.data.user.id, setTodos, setUncompletedTodos);
        router.refresh();
      }
    }
  };


  return (
    <LoginSiginupContainer>
      <MainLobySectionContainer>
        <MainLogoImage src="/web-logo-profile.svg" alt="logo" width={250} height={250} />
        <p>하루하루를 계획없이 사시나요?<br />투두 리스트에서 하루를 기록해보세요.</p>
      </MainLobySectionContainer>
      <LoginAuthContainer>
        <h2>{authType === "signin" ? "로그인" : "회원가입"}</h2>
        <AuthInputContainer>
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
            autoComplete="new-password"
          />
          {authType === "signup" && (
            <SignUpInputContainer isOpen={authType === 'signup'}>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 확인"
                autoComplete="new-password"
              />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="닉네임"
                autoComplete="new-password"
              />
            </SignUpInputContainer>
          )}
          <LoginAndSignUpBtn onClick={handleAuth}>
            {authType === "signin" ? "로그인" : "회원가입"}
          </LoginAndSignUpBtn>
          <SwitchAuthBtn
            onClick={() =>
              setAuthType(authType === "signin" ? "signup" : "signin")
            }
          >
            {authType === "signin" ? "계정이 없는 경우 회원가입하세요." : "계정이 있는 경우 로그인하세요."}
          </SwitchAuthBtn>
        </AuthInputContainer>
        {authType === "signin" && (
          <SocialContainer>
            <GoogleSocialLoginBtn onClick={() => handleSocialLogin("google")}>
              <div className="social-login-flex">
                <LogoImage
                  src="/google-logo.png"
                  alt="google"
                  width={250}
                  height={250}
                />
                <p style={{ alignItems: 'center', fontSize: "1rem", margin: '0', color: '#6A6A6A' }}>Google로 시작하기</p>
              </div>
            </GoogleSocialLoginBtn>
            <KaKaoSocialLoginBtn onClick={() => handleSocialLogin("kakao")}>
              <div className="social-login-flex">
                <LogoImage
                  src="/kakao-logo.png"
                  alt="kakao"
                  width={250}
                  height={250}
                />
                <p style={{ alignItems: 'center', fontSize: "1rem", margin: '0', color: '#6A6A6A' }}>카카오로 시작하기</p>
              </div>
            </KaKaoSocialLoginBtn>
          </SocialContainer>
        )}
      </LoginAuthContainer>
    </LoginSiginupContainer>
  );
};

export default AuthForm;