"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@components/lib/supabaseClient';
import AuthForm from '@components/Components/AuthForm';
import { Session } from '@supabase/supabase-js';
import TodoComponent from '@components/Components/TodoComponent';

const MainHome = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

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

        // Clean up the subscription on unmount
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // 로딩 중일 때 아무 것도 렌더링하지 않음
    if (loading) {
        return null;
    }

    return (
        <>
            {!session ? (
                <AuthForm />
            ) : (
                <TodoComponent user={session.user.email ? { id: session.user.id, email: session.user.email } : null} selectedDate={selectedDate} />
            )}
        </>
    );
};

export default MainHome;