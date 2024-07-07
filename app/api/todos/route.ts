import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''; // 서비스 역할 키 사용

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
    try {
        // Fetching todos
        const { data, error } = await supabase
            .from('todos')
            .select('*');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            return NextResponse.json({ todos: data }, { status: 200 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Unexpected error fetching todos' }, { status: 500 });
    }
}
