import { create } from 'zustand';

 export interface Todo {
    id: string;
    content: string;
    is_complete: boolean;
    is_priority: boolean;
    created_at: string;
    original_order: number;
}

interface TodoState {
    todos: Todo[];
    inputs: string[];
    addInput: () => void;
    setInput: (index: number, value: string) => void;
    setTodos: (todos: Todo[]) => void;
    resetInputs: () => void;
}

export const useTodoStore = create<TodoState>((set) => ({
    todos: [],
    inputs: [''],
    addInput: () => set((state) => ({ inputs: [...state.inputs, ''] })),
    setInput: (index, value) => set((state) => {
        const newInputs = [...state.inputs];
        newInputs[index] = value;
        return { inputs: newInputs };
    }),
    setTodos: (todos) => set({ todos }),
    resetInputs: () => set({ inputs: [''] }),
}));
