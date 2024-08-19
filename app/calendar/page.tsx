"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@components/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import CalenderTodoComponent from './CalenderTodoComponent';
import { useRouter } from 'next/navigation';

const Page = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        setTimeout(() => {
            if (!loading && (!session || !session.user || !session.user.email)) {
                alert('로그인이 필요합니다.');
                router.push('/');
            }
        }, 200);
    }, [loading, session]);

    if (loading) {
        return null;
    }

    if (!session || !session.user || !session.user.email) {
        return null;
    }

    const user = {
        id: session.user.id,
        email: session.user.email as string,  // 여기서 email이 string 형식임을 보장
    };

    return <CalenderTodoComponent user={user} />;
};

export default Page;
