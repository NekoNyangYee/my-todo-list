import { Todo } from '@components/types/todo';
import { create } from 'zustand';

interface TodoState {
    todos: Todo[];  // 할 일 목록
    inputs: string[];  // 입력 필드들
    isDay: boolean[];  // D-Day 상태 배열
    selectedDdayDates: (Date | null)[];  // 선택된 D-Day 날짜들
    addInput: () => void;  // 입력 필드 추가
    removeInput: (index: number) => void;  // 입력 필드 제거
    setInputs: (index: number, value: string) => void;  // 입력 필드 값 설정
    setTodos: (todos: Todo[]) => void;  // 할 일 목록 설정
    resetInputs: (count?: number) => void;  // 입력 필드 리셋
    setIsDday: (isDday: boolean[]) => void;  // D-Day 상태 배열 설정
    setSelectedDdayDate: (index: number, date: Date | null) => void;  // D-Day 날짜 설정
}

export const useTodoStore = create<TodoState>((set) => ({
    todos: [],  // 초기 할 일 목록
    inputs: [''],  // 기본 입력 필드 하나
    isDay: [],  // 초기 D-Day 상태 배열
    selectedDdayDates: [],  // 초기 선택된 D-Day 날짜들
    addInput: () => set((state) => ({
        inputs: [...state.inputs, ''],  // 입력 필드 추가
        isDay: [...state.isDay, false],  // D-Day 상태 추가
        selectedDdayDates: [...state.selectedDdayDates, null],  // D-Day 날짜 추가
    })),
    removeInput: (index: number) => set((state) => {
        const newInputs = [...state.inputs];
        const newIsDday = [...state.isDay];
        const newSelectedDdayDates = [...state.selectedDdayDates];
        newInputs.splice(index, 1);
        newIsDday.splice(index, 1);
        newSelectedDdayDates.splice(index, 1);
        return { inputs: newInputs, isDay: newIsDday, selectedDdayDates: newSelectedDdayDates };
    }),
    setInputs: (index, value) => set((state) => {
        const newInputs = [...state.inputs];
        newInputs[index] = value;
        return { inputs: newInputs };
    }),
    setTodos: (todos) => set({ todos }),  // 할 일 목록 설정
    resetInputs: (count = 3) => set(() => ({
        inputs: Array(count).fill(''),  // 입력 필드를 count 값에 맞춰 리셋
        isDay: Array(count).fill(false),  // D-Day 상태 초기화
        selectedDdayDates: Array(count).fill(null),  // D-Day 날짜 초기화
    })),
    setIsDday: (isDday) => set({ isDay: isDday }),  // D-Day 상태 배열 설정
    setSelectedDdayDate: (index, date) => set((state) => {
        const newSelectedDdayDates = [...state.selectedDdayDates];
        newSelectedDdayDates[index] = date;
        return { selectedDdayDates: newSelectedDdayDates };
    }),
}));
