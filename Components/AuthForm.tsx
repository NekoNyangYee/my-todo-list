"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "../Store/authStore";
import { supabase } from "../lib/supabaseClient";
import { updateProfile } from "../lib/updateProfile";
import { styled } from "@pigment-css/react";

const LoginSiginupContainer = styled("div")({
  width: "100%",
  display: "flex",
  maxWidth: "972px",
  justifyContent: "center",
  alignItems: "center",
  gap: "4rem",
  margin: "0 auto",
  paddingTop: "12rem",

  "@media (max-width: 1224px)": {
    paddingTop: "4rem",
    gap: "2rem",
    maxWidth: "80%",
    flexDirection: "column",
  },
});

const MainLobySectionContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  width: "100%",

  "& p": {
    color: "#6A6A6A",
    fontSize: "1.2rem",
    textAlign: "center",
    fontWeight: "bold",
  },

  "@media (max-width: 768px)": {
    display: "none",
  }
});

const LoginAuthContainer = styled("div")({
  width: "100%",
});

const MainLogoImage = styled("img")({
  width: "200px",
  height: "200px",
  margin: "0 auto",
  filter: "drop-shadow(4px 4px 4px #C9C9C9)",
});

const AuthInputContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "12px",

  "& input": {
    padding: "1rem 46px",
    borderRadius: "8px",
    border: "none",
    backgroundImage: "url('/email.svg')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "1.4rem",
    backgroundPosition: "1rem center",
    zIndex: 10,
    fontSize: "1rem",

    "&:focus": {
      outline: "none",
      border: "1px solid #E7E7E7",
    },

    "&:nth-child(2)": {
      backgroundImage: "url('/password.svg')",
    },
    "&:nth-child(3)": {
      backgroundImage: "url('/password.svg')",
    },
    "&:nth-child(4)": {
      backgroundImage: "url('/user.svg')",
    },
  },
});

const SocialContainer = styled("div")({
  padding: "1rem",

  "& button": {
    width: "100%",
    padding: "0.8rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
    transition: "all 0.3s ease",

    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.15)",
    }
  },

  "& .social-login-flex": {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    alignItems: "center",
  },
});

const LogoImage = styled("img")({
  width: "1.6rem",
  height: "1.6rem",
});

const LoginAndSignUpBtn = styled("button")({
  padding: "1rem",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#0075FF",
  color: "#fff",
  cursor: "pointer",
  fontSize: "1rem",

  "&:hover": {
    backgroundColor: "#0059FF",
  },
});

const SwitchAuthBtn = styled("button")({
  padding: "1rem",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "transparent",
  color: "#0075FF",
  cursor: "pointer",
  fontSize: "1rem",

  "&:hover": {
    textDecoration: "underline",
  },
});

const AuthForm: React.FC = () => {
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
  const router = useRouter();

  const handleAuth = async () => {
    if (authType === "signin") {
      // 먼저 해당 이메일의 프로바이더를 체크
      const { data: user } = await supabase
        .from("users")
        .select("provider")
        .eq("email", email)
        .single();

      if (email == "") {
        alert("이메일을을 입력해주세요.");
        return;
      } else if (password == "") {
        alert("비밀번호를 입력해주세요.");
        return;
      } else if (user && user.provider !== "email") {
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
        console.error("Error signing in:", error.message);
      } else if (data.session) {
        await updateProfile(data.session.user, "email");
        router.refresh();
      }
    } else {
      if (password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      } else if (password == "" || confirmPassword == "") {
        alert("비밀번호를 입력해주세요.");
        return;
      } else if (!fullName) {
        alert("닉네임을 입력해주세요.");
        return;
      } else if (!email) {
        alert("이메일을 입력해주세요.");
        return;
      }

      // 테스트 시 이메일 발송 부분 주석 처리
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
        await updateProfile(data.session.user, "email");
        alert(
          "회원가입이 완료되었습니다. 최초 회원가입 후 자동으로 로그인됩니다."
        );
        router.refresh();
      }
    }
  };

  const handleSocialLogin = async (provider: "google") => {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      console.error(`Error signing in with ${provider}:`, error.message);
    } else {
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        await updateProfile(user.data.user, provider);
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
            autoComplete="new-password"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="new-password"
          />
          {authType === "signup" && (
            <>
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
            </>
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
            <button onClick={() => handleSocialLogin("google")}>
              <div className="social-login-flex">
                <LogoImage
                  src="/google-logo.png"
                  alt="google"
                  width={250}
                  height={250}
                />
                <p style={{ alignItems: 'center', fontSize: "1rem", margin: '0', color: '#6A6A6A' }}>Google로 시작하기</p>
              </div>
            </button>
          </SocialContainer>
        )}
      </LoginAuthContainer>
    </LoginSiginupContainer>
  );
};

export default AuthForm;
