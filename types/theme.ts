export type ThemeColors = {
    background: string;
    text: string;
    containerBackground: string;
    buttonBackground: string;
    buttonColor: string;
    buttonHoverBackground: string;
    inputBackground: string;
    inputBorder: string;
    inputPlaceholderColor: string;  // 여기 추가
    shadow: string;
    toggleThemeButtonHoverBackground: string;
};

export type Theme = {
    mode: 'light' | 'dark';
    isChanging: boolean;
    colors: ThemeColors;
};
