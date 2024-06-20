"use client";

import { useTheme } from "@components/app/Context/ThemeContext";

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        if (theme !== newTheme) {
            setTheme(newTheme);
        }
    };

    return (
        <div>
            <button onClick={() => handleThemeChange('light')}>
                라이트 모드
            </button>
            <button onClick={() => handleThemeChange('dark')}>
                다크 모드
            </button>
            <button onClick={() => handleThemeChange('system')}>
                시스템 모드
            </button>
        </div>
    );
};

export default ThemeToggle;
