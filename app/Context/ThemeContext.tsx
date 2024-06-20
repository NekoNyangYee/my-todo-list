"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { lightTheme, darkTheme } from '../styles/style';
import GlobalStyles from '../styles/globalStyle';
import { Theme } from '@components/types/theme';

type ThemeMode = 'light' | 'dark' | 'system'; // ThemeMode 타입 정의

interface ThemeContextProps {
    theme: ThemeMode;
    themeStyles: Theme;
    setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<ThemeMode>('system');
    const [themeStyles, setThemeStyles] = useState<Theme>(lightTheme);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = window.localStorage.getItem('theme') as ThemeMode;
            const initialTheme = savedTheme || 'system';

            const getCurrentThemeStyles = (currentTheme: ThemeMode): Theme => {
                if (currentTheme === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    return prefersDark ? darkTheme : lightTheme;
                }
                return currentTheme === 'dark' ? darkTheme : lightTheme;
            };

            setTheme(initialTheme);
            setThemeStyles(getCurrentThemeStyles(initialTheme));
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

            const applyTheme = (currentTheme: ThemeMode) => {
                if (currentTheme === 'system') {
                    const updateTheme = () => {
                        const newTheme = prefersDark.matches ? darkTheme : lightTheme;
                        setThemeStyles(newTheme);
                        root.classList.toggle('dark', prefersDark.matches);
                    };
                    updateTheme();
                    prefersDark.addEventListener('change', updateTheme);
                    return () => prefersDark.removeEventListener('change', updateTheme);
                } else {
                    const newTheme = currentTheme === 'dark' ? darkTheme : lightTheme;
                    setThemeStyles(newTheme);
                    root.classList.toggle('dark', currentTheme === 'dark');
                }
            };

            applyTheme(theme);
            window.localStorage.setItem('theme', theme);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, themeStyles, setTheme }}>
            <EmotionThemeProvider theme={themeStyles}>
                <GlobalStyles theme={themeStyles} />
                {children}
            </EmotionThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
