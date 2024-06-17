"use client"

import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import styled from '@emotion/styled';
import { supabase } from '@components/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

const LayoutContainer = styled.div`
    display: flex;
    min-height: 100vh;
    position: relative;
    overflow: hidden;
`;

const ContentContainer = styled.div`
    width: 100%;
    padding: 20px;
`;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isSidebarOpen]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <LayoutContainer>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} session={session} />
            <ContentContainer>
                {children}
            </ContentContainer>
        </LayoutContainer>
    );
};

export default MainLayout;
