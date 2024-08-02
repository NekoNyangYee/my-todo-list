import { Todo } from '@components/types/todo';
import { create } from 'zustand';

// const [isDday, setIsDday] = useState<boolean[]>([]);옮기기
interface TodoState {
    todos: Todo[];
    inputs: string[];
    showInput: boolean;
    animateOut: boolean;
    showDropdown: string | null;
    uncompletedTodos: Todo[];
    uncompletedShowDropdown: string | null;
    isLoading: boolean;
    isDay: boolean[];
    addInput: () => void;
    removeInput: (index: number) => void;
    setInputs: (index: number, value: string) => void;
    setTodos: (todos: Todo[]) => void;
    resetInputs: () => void;
    setShowInput: (show: boolean) => void;
    setAnimateOut: (animate: boolean) => void;
    setShowDropdown: (dropdown: string | null) => void;
    setUncompletedTodos: (todos: Todo[]) => void;
    setUncompletedShowDropdown: (dropdown: string | null) => void;
    setIsLoading: (loading: boolean) => void;
    setIsDday: (isDday: boolean[]) => void;
};

export const useTodoStore = create<TodoState>((set) => ({
    todos: [],
    inputs: [''],
    showInput: false,
    animateOut: false,
    showDropdown: null,
    uncompletedTodos: [],
    uncompletedShowDropdown: null,
    isLoading: true,
    isDay: [],
    addInput: () => set((state) => ({ inputs: [...state.inputs, ''] })),
    removeInput: (index: number) => set((state) => {
        const newInputs = [...state.inputs];
        newInputs.splice(index, 1);
        if (newInputs.length < 3) {
            newInputs.push('');
        }
        return { inputs: newInputs };
    }),
    setInputs: (index, value) => set((state) => {
        const newInputs = [...state.inputs];
        newInputs[index] = value;
        return { inputs: newInputs };
    }),
    setTodos: (todos) => set({ todos }),
    resetInputs: () => set({ inputs: [''] }),
    setShowInput: (show) => set({ showInput: show }),
    setAnimateOut: (animate) => set({ animateOut: animate }),
    setShowDropdown: (dropdown) => set({ showDropdown: dropdown }),
    setUncompletedTodos: (todos) => set({ uncompletedTodos: todos }),
    setUncompletedShowDropdown: (dropdown) => set({ uncompletedShowDropdown: dropdown }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setIsDday: (isDday) => set({ isDay: isDday })
}));
