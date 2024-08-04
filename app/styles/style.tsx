import { Theme } from '@components/types/theme';

export const lightTheme: Theme = {
    mode: 'light',
    isChanging: true,
    colors: {
        background: '#F6F8FC',
        text: '#000000',
        containerBackground: '#FFFFFF',
        buttonBackground: '#0075ff',
        buttonColor: '#FFFFFF',
        buttonHoverBackground: '#0059ff',
        inputBackground: '#FFFFFF',
        inputBorder: '#e7e7e7',
        inputPlaceholderColor: '#6a6a6a',
        shadow: '0px 0px 20px #E0E0E0',
        toggleThemeButtonHoverBackground: '#D4D4D4',
    }
};

export const darkTheme: Theme = {
    mode: 'dark',
    isChanging: true,
    colors: {
        background: '#1a1a1a',
        text: '#FFFFFF',
        containerBackground: '#333333',
        buttonBackground: '#1E90FF',
        buttonColor: '#FFFFFF',
        buttonHoverBackground: '#1C86EE',
        inputBackground: '#333333',
        inputBorder: '#555555',
        inputPlaceholderColor: '#BBBBBB',  // 여기 추가
        shadow: '0px 0px 0px none',
        toggleThemeButtonHoverBackground: '#202020',
    }
};
