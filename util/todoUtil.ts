// todoUtils.ts
import { supabase } from "@components/lib/supabaseClient"; // supabase 클라이언트 경로에 맞게 수정

export const fetchTodos = async (userId: string, setTodos: (todos: any) => void) => {
    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('original_order', { ascending: true });

    if (error) {
        console.error('Error fetching todos:', error);
    } else {
        setTodos(data);
    }
};