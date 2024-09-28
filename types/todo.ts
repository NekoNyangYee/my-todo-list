export interface Todo {
    id: string;
    user_id: string;
    content: string;
    is_complete: boolean;
    is_priority: boolean;
    created_at: string;
    original_order: number;
    date: string;
    is_dday: boolean;
    text_color: string;
    dday_date?: string | null;  // D-Day로 선택된 날짜 (optional로 설정)
}
