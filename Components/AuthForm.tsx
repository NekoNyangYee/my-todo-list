"use client";

import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../Store/authStore";
import { supabase } from "../lib/supabaseClient";
import { updateProfile } from "../lib/updateProfile";
import { setupMidnightCheck, fetchTodosForDate } from "@components/util/todoUtil";
import { useTodoStore } from "@components/Store/useAuthTodoStore";
import { useTheme } from "@components/app/Context/ThemeContext";
import { useEffect, useState } from "react";

const AuthFormContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem;
  margin: 0 auto;
  max-width: 972px;
  flex-direction: column;

  @media (max-width: 1224px) {
    gap: 2rem;
    max-width: 80%;
  }
`;

const LoginSiginupContainer = styled.div<{ themeStyles: any }>`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem;
  padding-top: 12rem;

  @media (max-width: 1224px) {
    gap: 2rem;
    flex-direction: column;
  }
`;

const MainLobySectionContainer = styled.div<{ themeStyles: any }>`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  & p {
    color: ${({ themeStyles }) => themeStyles.colors.inputPlaceholderColor};
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

const MainLogoImage = styled.img<{ themeStyles: any }>`
  width: 200px;
  height: 200px;
  margin: 0 auto;
  filter: drop-shadow(${({ themeStyles }) => themeStyles.colors.shadow});
`;

const AuthInputContainer = styled.div<{ themeStyles: any }>`
  display: flex;
  flex-direction: column;
  gap: 12px;

  & input {
    padding: 1rem 46px;
    border-radius: 8px;
    border: none;
    background-color: ${({ themeStyles }) => themeStyles.colors.inputBackground};
    background-repeat: no-repeat;
    background-size: 1.6rem;
    background-position: 1rem center;
    z-index: 10;
    font-size: 1.2rem;
    border: 1px solid ${({ themeStyles }) => themeStyles.colors.inputBorder};

    &:focus {
      outline: none;
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

const fadeInSignUp = keyframes`
  from {
    transform: translateX(-20px);
  }
  to {
    transform: translateX(0);
  }
`;

const fadeOutLogin = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0px);
  }
`;

const fadeInLogin = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeOutSignUp = keyframes`
  from {
    transform: translateX(20px);
  }
  to {
    transform: translateX(0px);
  }
`;


interface SignUpInputContainerProps {
  isOpen: boolean;
  themeStyles: any;
}

const SignUpInputContainer = styled.div<SignUpInputContainerProps>`
  display: flex;
  flex-direction: column;
  gap: 12px;

  & input {
    background-color: ${({ themeStyles }) => themeStyles.colors.inputBackground};
    border: 1px solid ${({ themeStyles }) => themeStyles.colors.inputBorder};

    &:nth-of-type(1) {
      background-image: url('/password.svg');
      animation: ${({ isOpen }) => (isOpen ? fadeInModal : fadeOutModal)} 0.2s;
    }
      
    &:nth-of-type(2) {
      background-image: url('/user.svg');
      animation: ${({ isOpen }) => (isOpen ? fadeInModal : fadeOutModal)} 0.4s;
    }
  }
`;

const SocialContainer = styled.div<{ themeStyles: any }>`
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

const GoogleSocialLoginBtn = styled.button<{ themeStyles: any }>`
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

const KaKaoSocialLoginBtn = styled.button<{ themeStyles: any }>`
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

const LoginAndSignUpBtn = styled.button<{ themeStyles: any }>`
  padding: 1rem;
  border-radius: 8px;
  border: none;
  background-color: ${({ themeStyles }) => themeStyles.colors.buttonBackground};
  color: ${({ themeStyles }) => themeStyles.colors.buttonColor};
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: ${({ themeStyles }) => themeStyles.colors.buttonHoverBackground};
  }
`;

const SwitchAuthBtn = styled.button<{ themeStyles: any }>`
  padding: 1rem;
  border-radius: 8px;
  border: none;
  background-color: transparent;
  color: ${({ themeStyles }) => themeStyles.colors.buttonBackground};
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    text-decoration: underline;
  }
`;

const SocialLoginText = styled.p<{ themeStyles: any }>`
  align-items: center;
  font-size: 1rem;
  margin: 0;
  color: #6a6a6a;
`;

const AuthTitle = styled.h2<{ authType: 'signin' | 'signup' }>`
  animation: ${({ authType }) => (authType === 'signin' ? fadeInLogin : fadeInSignUp)} 0.3s forwards,
             ${({ authType }) => (authType === 'signin' ? fadeOutSignUp : fadeOutLogin)} 0.3s forwards;
`;

const SitInfoContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 1rem;
  text-align: center;
  justify-content: space-around;

  & p {
    font-size: 1.2rem;
    color: #6a6a6a;
  }

  & strong {
    font-size: 2.6rem;
    color: #000;
  }

  @media (max-width: 1224px) {
    flex-direction: column;
  }
`;

const AuthForm = () => {
  const { themeStyles } = useTheme();
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

  const [isSignUp, setIsSignUp] = useState<boolean>(authType === "signup");
  const [userCount, setUserCount] = useState<number>(0);
  const [listCount, setListCount] = useState<number>(0);


  useEffect(() => {
    setIsSignUp(authType === "signup");
  }, [authType]);

  const fetchUserCount = async () => {
    try {
      const response = await fetch('/api/userCount');
      const data = await response.json();
      if (response.ok) {
        setUserCount(data.count);
      } else {
        console.error('Error fetching user count:', data.error);
      }
    } catch (error) {
      console.error('Unexpected error fetching user count:', error);
    }
  };

  const fetchTodoListTodos = async () => {
    try {
      const response = await fetch('/api/todos'); // 새로운 엔드포인트
      const data = await response.json();
      if (response.ok) {
        setTodos(data.todos);
        setListCount(data.todos.length);
      } else {
        console.error('Error fetching todos:', data.error);
      }
    } catch (error) {
      console.error('Unexpected error fetching todos:', error);
    }
  };

  useEffect(() => {
    fetchUserCount();
    fetchTodoListTodos();

    const userSubscription = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, payload => {
        fetchUserCount();
      })
      .subscribe();

    const todoSubscription = supabase
      .channel('public:todos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, payload => {
        fetchTodoListTodos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(userSubscription);
      supabase.removeChannel(todoSubscription);
    };
  }, []);


  const handleAuth = async () => {
    const currentDate = new Date(); // 현재 날짜를 가져옴
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
        await fetchTodosForDate(data.session.user.id, currentDate, setTodos); // 해당 날짜의 할 일 목록 불러오기
        router.push('/'); // 메인 페이지로 이동
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
        await fetchTodosForDate(data.session.user.id, currentDate, setTodos); // 해당 날짜의 할 일 목록 불러오기
        router.push('/'); // 메인 페이지로 이동
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
        updateProfile(user.data.user, provider);
        setupMidnightCheck(user.data.user.id, setTodos, setUncompletedTodos);
        fetchTodosForDate(user.data.user.id, new Date(), setTodos);
        router.push('/');
      }
    }
  };


  return (
    <AuthFormContainer>
      <LoginSiginupContainer themeStyles={themeStyles}>
        <MainLobySectionContainer themeStyles={themeStyles}>
          <MainLogoImage src="/web-logo-profile.svg" alt="logo" themeStyles={themeStyles} />
          <p>하루하루를 계획없이 사시나요?<br />투두 리스트에서 하루를 기록해보세요.</p>
        </MainLobySectionContainer>
        <LoginAuthContainer>
          <AuthTitle authType={authType}>
            {authType === "signin" ? "로그인" : "회원가입"}
          </AuthTitle>
          <AuthInputContainer themeStyles={themeStyles}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              style={{ backgroundImage: 'url(/email.svg)' }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoComplete="new-password"
            />
            {authType === "signup" && (
              <SignUpInputContainer isOpen={authType === 'signup'} themeStyles={themeStyles}>
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
            <LoginAndSignUpBtn themeStyles={themeStyles} onClick={handleAuth}>
              {authType === "signin" ? "로그인" : "회원가입"}
            </LoginAndSignUpBtn>
            <SwitchAuthBtn themeStyles={themeStyles}
              onClick={() =>
                setAuthType(authType === "signin" ? "signup" : "signin")
              }
            >
              {authType === "signin" ? "계정이 없는 경우 회원가입하세요." : "계정이 있는 경우 로그인하세요."}
            </SwitchAuthBtn>
          </AuthInputContainer>
          {authType === "signin" && (
            <SocialContainer themeStyles={themeStyles}>
              <GoogleSocialLoginBtn themeStyles={themeStyles} onClick={() => handleSocialLogin("google")}>
                <div className="social-login-flex">
                  <LogoImage
                    src="/google-logo.png"
                    alt="google"
                    width={250}
                    height={250}
                  />
                  <SocialLoginText themeStyles={themeStyles}>Google로 시작하기</SocialLoginText>
                </div>
              </GoogleSocialLoginBtn>
              <KaKaoSocialLoginBtn themeStyles={themeStyles} onClick={() => handleSocialLogin("kakao")}>
                <div className="social-login-flex">
                  <LogoImage
                    src="/kakao-logo.png"
                    alt="kakao"
                    width={250}
                    height={250}
                  />
                  <SocialLoginText themeStyles={themeStyles}>카카오로 시작하기</SocialLoginText>
                </div>
              </KaKaoSocialLoginBtn>
            </SocialContainer>
          )}
        </LoginAuthContainer>
      </LoginSiginupContainer>
      <SitInfoContainer>
        <p>지금까지 가입한 회원 수<br /> <strong>{userCount}</strong>명</p> {/* 추가된 부분 */}
        <p>지금까지 작성된 할 일 목록 수<br /> <strong>{listCount}</strong>개</p> {/* 추가된 부분 */}
      </SitInfoContainer>
    </AuthFormContainer>
  );
};

export default AuthForm;