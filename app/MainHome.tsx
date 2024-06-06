"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@components/lib/supabaseClient';
import AuthForm from '@components/Components/AuthForm';
import TodoComponent from '@components/Components/TodoComponent';
import { Session } from '@supabase/supabase-js';

const MainHome = () => {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        // Clean up the subscription on unmount
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return (
        <div>
            {!session ? <AuthForm /> : <TodoComponent />}
        </div>
    );
};

export default MainHome;

