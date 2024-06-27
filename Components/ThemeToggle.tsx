"use client";

import styled from "@emotion/styled";
import { useTheme } from "@components/app/Context/ThemeContext";
import DarkModeIcon from "./icons/ToggleTheme/DarkModeIcon";
import LightModeIcon from "./icons/ToggleTheme/LightModeIcon";
import SystemModeIcon from "./icons/ToggleTheme/SystemModeIcon";
import { useEffect, useState } from "react";
import { ThemeMode } from "@components/types/toggleTheme";

const ThemeBtnContainer = styled.div<{ themeStyles: any }>`
  display: flex;
  justify-content: space-between;
  background-color: ${({ themeStyles }) => themeStyles.colors.containerBackground};
  border-radius: 8px;
  border: 1px solid ${({ themeStyles }) => themeStyles.colors.inputBorder};
  transition: background-color 0.2s;
  max-width: 372px;
  margin: 0 auto;
  width: 100%;

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    width: 100%;
    height: 40px;
    border-radius: 8px;
    color: ${({ themeStyles }) => themeStyles.colors.text};
    display: flex;
    justify-content: center;
    align-items: center;

    &.active, &:hover {
      background-color: ${({ themeStyles }) => themeStyles.colors.toggleThemeButtonHoverBackground};
    }

    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const ThemeToggle = () => {
    const { theme, setTheme, themeStyles } = useTheme();
    const [currentTheme, setCurrentTheme] = useState<ThemeMode>(theme);

    useEffect(() => {
        setCurrentTheme(theme);
    }, [theme]);

    const handleThemeChange = (newTheme: ThemeMode) => {
        if (currentTheme !== newTheme) {
            setTheme(newTheme);
        }
    };

    return (
        <ThemeBtnContainer themeStyles={themeStyles}>
            <button
                onClick={() => handleThemeChange('light')}
                className={currentTheme === 'light' ? 'active' : ''}
            >
                <LightModeIcon />
            </button>
            <button
                onClick={() => handleThemeChange('dark')}
                className={currentTheme === 'dark' ? 'active' : ''}
            >
                <DarkModeIcon />
            </button>
            <button
                onClick={() => handleThemeChange('system')}
                className={currentTheme === 'system' ? 'active' : ''}
            >
                <SystemModeIcon />
            </button>
        </ThemeBtnContainer>
    );
};

export default ThemeToggle;
