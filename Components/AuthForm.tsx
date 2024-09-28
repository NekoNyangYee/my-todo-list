"use client";

import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../Store/authStore";
import { supabase } from "../lib/supabaseClient";
import { updateProfile } from "../lib/updateProfile";
import { fetchTodosForDate } from "@components/util/todoUtil";
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
  padding: 12rem 0;

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
    width: 100%;
    padding: 1rem 0 1rem 46px;
    border-radius: 8px;
    border: none;
    background-color: ${({ themeStyles }) =>
    themeStyles.colors.inputBackground};
    background-repeat: no-repeat;
    background-size: 1.6rem;
    background-position: 1rem center;
    z-index: 10;
    font-size: 1.2rem;
    border: 1px solid ${({ themeStyles }) => themeStyles.colors.inputBorder};

    &:focus {
      outline: none;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:nth-of-type(1) {
      background-image: url("/password.svg");
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
    background-color: ${({ themeStyles }) =>
    themeStyles.colors.inputBackground};
    border: 1px solid ${({ themeStyles }) => themeStyles.colors.inputBorder};

    &:nth-of-type(1) {
      background-image: url("/password.svg");
      animation: ${({ isOpen }) => (isOpen ? fadeInModal : fadeOutModal)} 0.2s;
    }

    &:nth-of-type(2) {
      background-image: url("/user.svg");
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
    background-color: ${({ themeStyles }) =>
    themeStyles.colors.buttonHoverBackground};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

const AuthTitle = styled.h2<{ authType: "signin" | "signup" }>`
  animation: ${({ authType }) =>
    authType === "signin" ? fadeInLogin : fadeInSignUp}
      0.3s forwards,
    ${({ authType }) => (authType === "signin" ? fadeOutSignUp : fadeOutLogin)}
      0.3s forwards;
`;

const MessageText = styled.span`
  font-size: 1rem;
  color: #6a6a6a;
`;

const InvaildEmailButton = styled.button`
  background-color: #0075FF;
  color: #FFFFFF;
  border: none;
  cursor: pointer;
  border-radius: 8px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MailContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 12px;
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
    setUser,
  } = useAuthStore();
  const { setTodos } = useTodoStore();
  const [emailMessage, setEmailMessage] = useState<string>(
    "실제로 쓰이는 이메일로 등록해주세요. 나중에 아이디 찾기에 쓰입니다. 이메일 끝부분에는 .net, .com만 올 수 있습니다."
  );
  const [passwordMessage, setPasswordMessage] = useState<string>(
    "비밀번호는 6자 이상이어야 하며, 숫자와 문자를 포함해야 합니다."
  );
  const [confirmPasswordMessage, setConfirmPasswordMessage] =
    useState<string>("");
  const [isEmailChecked, setIsEmailChecked] = useState<boolean>(false);
  const [nameMessage, setNameMessage] = useState<string>("");
  const router = useRouter();

  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.(com|net)$/;
  const passwordRegex: RegExp =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{6,}$/;

  const handleAuth = async () => {
    const currentDate = new Date();
    if (authType === "signup") {
      setEmail('');
      setPassword('');
    }
    if (authType === "signin") {
      if (email === "" || password === "") {
        alert("이메일과 비밀번호를 입력해주세요.");
        return;
      }
      const { data: user } = await supabase
        .from("users")
        .select("provider")
        .eq("email", email)
        .single();

      if (user && user.provider !== "email") {
        alert(
          "이 이메일은 소셜 로그인 계정입니다. 소셜 로그인을 사용해주세요."
        );
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
        setUser(data.session.user);
        await updateProfile(data.session.user, "email");
        await fetchTodosForDate(data.session.user.id, currentDate, setTodos);
        router.push("/");
      }
    } else {
      if (!emailRegex.test(email)) {
        alert("유효한 이메일 주소를 입력해주세요.");
        return;
      }
      if (!passwordRegex.test(password)) {
        alert("비밀번호를 입력해주세요.");
        return;
      }
      if (password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }
      if (fullName === "") {
        alert("닉네임을 입력해주세요.");
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
      } else if (data.user) {
        alert("회원가입이 완료되었습니다. 첫 회원가입 후 자동로그인 됩니다.");
        setAuthType("signin");
      }
    }
  };

  const handleSocialLogin = async (provider: "google" | "kakao") => {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      console.error(`Error signing in with ${provider}:`, error.message);
    } else {
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        updateProfile(user.data.user, provider);
        fetchTodosForDate(user.data.user.id, new Date(), setTodos);
        router.push("/");
      }
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        router.push("/");
      }
    };

    checkSession();
  }, []);

  const handleEmailValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (!emailRegex.test(value)) {
      setEmailMessage("이메일 형식이 올바르지 않습니다.");
    } else {
      setEmailMessage(
        "실제로 쓰이는 이메일로 등록해주세요. 나중에 아이디 찾기에 쓰입니다. 이메일 끝부분에는 .net, .com만 올 수 있습니다."
      );
    }
  };

  const handlePasswordValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordRegex.test(value) && value.length > 6) {
      setPasswordMessage("좋아요! 이정도면 사용가능한 비밀번호에요!");
    } else if (!passwordRegex.test(value)) {
      setPasswordMessage("숫자와 문자를 섞어서 사용해야 해요.");
    } else if (value === "") {
      setPasswordMessage("");
    }
  };

  const handleConfirmPasswordValidation = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value !== password) {
      setConfirmPasswordMessage("비밀번호가 일치하지 않습니다.");
    } else if (value.length === 0) {
      setConfirmPasswordMessage("");
    }
  };

  const handleEmailCheck = async () => {
    if (email === "") {
      setEmailMessage("이메일을 입력해주세요.");
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (error && error.code === "PGRST116") {
      // PGRST116: row not found error
      alert("사용 가능한 이메일입니다.");
      setIsEmailChecked(true);
      setEmailMessage("");
    } else {
      alert("이미 사용 중인 이메일입니다.");
    }
  };

  return (
    <AuthFormContainer>
      <LoginSiginupContainer themeStyles={themeStyles}>
        <MainLobySectionContainer themeStyles={themeStyles}>
          <MainLogoImage
            src="/web-logo-profile.svg"
            alt="logo"
            themeStyles={themeStyles}
          />
          <p>
            하루하루를 계획없이 사시나요?
            <br />
            투두 리스트에서 하루를 기록해보세요.
          </p>
        </MainLobySectionContainer>
        <LoginAuthContainer>
          <AuthTitle authType={authType}>
            {authType === "signin" ? "로그인" : "회원가입"}
          </AuthTitle>
          <AuthInputContainer themeStyles={themeStyles}>
            <MailContainer>
              <input
                type="email"
                value={email}
                onChange={handleEmailValidation}
                placeholder="이메일"
                style={{ backgroundImage: "url(/email.svg)" }}
                autoComplete="new-password"
              />
              {authType === "signup" && (
                <InvaildEmailButton onClick={handleEmailCheck} disabled={!emailRegex.test(email)}>중복 확인</InvaildEmailButton>
              )}
            </MailContainer>
            {authType === "signup" && (
              <MessageText>{emailMessage}</MessageText>
            )}
            <input
              type="password"
              value={password}
              onChange={handlePasswordValidation}
              placeholder="비밀번호"
              autoComplete="new-password"
              disabled={authType === 'signup' && !isEmailChecked}
            />
            {authType === "signup" && (
              <MessageText>{passwordMessage}</MessageText>
            )}
            {authType === "signup" && (
              <SignUpInputContainer
                isOpen={authType === "signup"}
                themeStyles={themeStyles}
              >
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordValidation}
                  placeholder="비밀번호 확인"
                  disabled={!isEmailChecked}
                />
                {authType === "signup" && (
                  <MessageText style={{ color: "red" }}>
                    {confirmPasswordMessage}
                  </MessageText>
                )}
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="닉네임"
                  autoComplete="new-password"
                  disabled={!isEmailChecked}
                />
                {authType === "signup" && (
                  <MessageText>{nameMessage}</MessageText>
                )}
              </SignUpInputContainer>
            )}
            <LoginAndSignUpBtn themeStyles={themeStyles} onClick={handleAuth} disabled={authType === 'signup' && !isEmailChecked}>
              {authType === "signin" ? "로그인" : "회원가입" || authType === 'signup' && !isEmailChecked}
            </LoginAndSignUpBtn>
            <SwitchAuthBtn
              themeStyles={themeStyles}
              onClick={() =>
                setAuthType(authType === "signin" ? "signup" : "signin")
              }
            >
              {authType === "signin"
                ? "계정이 없는 경우 회원가입하세요."
                : "계정이 있는 경우 로그인하세요."}
            </SwitchAuthBtn>
          </AuthInputContainer>
          {authType === "signin" && (
            <SocialContainer themeStyles={themeStyles}>
              <GoogleSocialLoginBtn
                themeStyles={themeStyles}
                onClick={() => handleSocialLogin("google")}
              >
                <div className="social-login-flex">
                  <LogoImage
                    src="/google-logo.png"
                    alt="google"
                    width={250}
                    height={250}
                  />
                  <SocialLoginText themeStyles={themeStyles}>
                    Google로 시작하기
                  </SocialLoginText>
                </div>
              </GoogleSocialLoginBtn>
              <KaKaoSocialLoginBtn
                themeStyles={themeStyles}
                onClick={() => handleSocialLogin("kakao")}
              >
                <div className="social-login-flex">
                  <LogoImage
                    src="/kakao-logo.png"
                    alt="kakao"
                    width={250}
                    height={250}
                  />
                  <SocialLoginText themeStyles={themeStyles}>
                    카카오로 시작하기
                  </SocialLoginText>
                </div>
              </KaKaoSocialLoginBtn>
            </SocialContainer>
          )}
        </LoginAuthContainer>
      </LoginSiginupContainer>
    </AuthFormContainer>
  );
};

export default AuthForm;
