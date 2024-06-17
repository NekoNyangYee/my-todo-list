"use client"

import React from 'react';
import styled from '@emotion/styled';
import Link from 'next/link';

interface SidebarProps<T> {
    isOpen: boolean;
    toggleSidebar: T;
}

const SidebarContainer = styled.div<{ isOpen: boolean }>`
    width: 250px;
    height: 100vh;
    position: fixed;
    left: ${({ isOpen }) => (isOpen ? '0' : '-300px')};
    top: 0;
    background-color: #F6F8FC;
    display: flex;
    flex-direction: column;
    padding: 20px;
    transition: left 0.2s ease-in-out;
    z-index: 1000;
    border-radius: 0 12px 12px 0;
`;

const SidebarLink = styled(Link)`
    color: #6a6a6a;
    text-decoration: none;
    padding: 10px 0;
    font-size: 1.2rem;
    border-radius: 8px;

    &:hover {
        background-color: #d3d3d3;
        padding-left: 10px;
    }
`;

const ToggleButton = styled.button`
    position: fixed;
    bottom: 20px;
    left: 20px;
    background-color: #0075ff;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    cursor: pointer;
    z-index: 1100;
    transition: background-color 0.2s;

    &:hover {
        background-color: #005bb5;
    }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
    display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 900;
`;

const Sidebar = <T extends () => void>({ isOpen, toggleSidebar }: SidebarProps<T>) => {
    return (
        <>
            <ToggleButton onClick={toggleSidebar}>
                {isOpen ? '닫기' : '메뉴'}
            </ToggleButton>
            <SidebarContainer isOpen={isOpen}>
                <SidebarLink href="/" onClick={toggleSidebar}>홈</SidebarLink>
                <SidebarLink href="/calendar" onClick={toggleSidebar}>캘린더</SidebarLink>
            </SidebarContainer>
            <Overlay isOpen={isOpen} onClick={toggleSidebar} />
        </>
    );
};

export default Sidebar;
