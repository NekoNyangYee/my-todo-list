"use client";

import { createGlobalStyle, ThemeProvider as StyledThemeProvider } from 'styled-components';
import { Theme } from '@components/types/theme';

const GlobalStyle = createGlobalStyle<{ theme: Theme }>`
  :root {
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 14px;
    background-color: ${({ theme }) => theme.colors.background};
    ${({ theme }) => theme.isChanging ? `
      transition: background-color 0.3s, color 0.3s;
      will-change: background-color, color;
    ` : ''}
    color: ${({ theme }) => theme.colors.text};
    color-scheme: ${({ theme }) => theme.mode};
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    word-break: keep-all;
    box-sizing: border-box;
  }

  input, button, select {
    font-family: 'Noto Sans KR', sans-serif;
    box-sizing: border-box;
    &:focus-visible {
      outline: none;
      outline-offset: 4px;
    }
  }

  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
  }

  #root, #__next {
    overflow: hidden;
    height: 100%;
  }

  & rect {
    fill: ${({ theme }) => theme.colors.text};
  }

  & path {
    stroke: ${({ theme }) => theme.colors.text};
    fill: ${({ theme }) => theme.colors.text};
  }
`;

export default GlobalStyle;
