// app/types/supabase.ts
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
    public: {
        Tables: {
            todos: {
                Row: {
                    id: string;
                    user_id: string;
                    content: string;
                    is_complete: boolean;
                    is_priority: boolean;
                    created_at: string;
                    date: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    content: string;
                    is_complete?: boolean;
                    is_priority?: boolean;
                    created_at?: string;
                    date: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    content?: string;
                    is_complete?: boolean;
                    is_priority?: boolean;
                    created_at?: string;
                    date?: string;
                };
            };
        };
    };
}
