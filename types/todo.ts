export interface Todo {
    id: string;
    user_id: string;
    content: string;
    is_complete: boolean;
    is_priority: boolean;
    created_at: string;
    original_order: number;
    date: string;
}