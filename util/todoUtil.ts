import { supabase } from '@components/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { Todo } from '@components/types/todo';

export const deleteCompletedTodos = async (userId: string, setTodos: (todos: Todo[]) => void): Promise<void> => {
    const { data, error } = await supabase
        .from('todos')
        .delete()
        .eq('user_id', userId)
        .eq('is_complete', true);

    if (error) {
        console.error('Error deleting completed todos:', error);
    } else {
        console.log('Completed todos deleted successfully:', data);
        await fetchTodos(userId, setTodos); // 최신 데이터 다시 가져오기
    }
};

export const fetchTodos = async (userId: string, setTodos: (todos: Todo[]) => void): Promise<void> => {
    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('original_order', { ascending: true });

    if (error) {
        console.error('Error fetching todos:', error);
        return;
    }

    setTodos(data);
};

export const fetchTodosForDate = async (userId: string, date: Date, setTodos: (todos: Todo[]) => void): Promise<void> => {
    const koreanDateString = new Date(date.getTime() + (9 * 60 * 60 * 1000)).toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .eq('date', koreanDateString);

    if (error) {
        console.error('Error fetching todos:', error);
    } else {
        setTodos(data as Todo[]); // 여기 수정됨
    }
};


export const archiveTodos = async (userId: string, setTodos: (todos: Todo[]) => void, setUncompletedTodos: (todos: Todo[]) => void): Promise<void> => {
    const { data: todos, error: fetchError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .eq('is_complete', false);

    if (fetchError) {
        console.error('Error fetching todos:', fetchError);
        return;
    }

    if (!todos || todos.length === 0) {
        console.log('No todos to archive');
        return;
    }

    const uniqueTodos = removeDuplicates(todos, 'id');

    const todosToInsert = uniqueTodos.map(todo => ({
        ...todo,
        archived_id: uuidv4()
    }));

    const { data: archivedTodos, error: archiveError } = await supabase
        .from('archived_todos')
        .insert(todosToInsert);

    if (archiveError) {
        console.error('Error archiving todos:', archiveError);
        return;
    }

    const { data: deleteData, error: deleteError } = await supabase
        .from('todos')
        .delete()
        .in('id', uniqueTodos.map(todo => todo.id));

    if (deleteError) {
        console.error('Error deleting todos:', deleteError);
        return;
    }

    await fetchTodos(userId, setTodos);
    await fetchAndMoveUncompletedTodos(userId, setUncompletedTodos);
};

export const deleteTodo = async (userId: string, id: string, setTodos: (todos: Todo[]) => void, selectedDate: Date): Promise<void> => {
    const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting todo:', error);
        return;
    }

    await fetchTodosForDate(userId, selectedDate, setTodos);
};

export const toggleTodo = async (userId: string, id: string, isComplete: boolean, setTodos: (todos: Todo[]) => void, selectedDate: Date): Promise<void> => {
    const { error } = await supabase
        .from('todos')
        .update({ is_complete: !isComplete })
        .eq('id', id);

    if (error) {
        console.error('Error updating todo:', error);
        return;
    }

    await fetchTodosForDate(userId, selectedDate, setTodos);
};

export const togglePriority = async (userId: string, id: string, isPriority: boolean, setTodos: (todos: Todo[]) => void, selectedDate: Date): Promise<void> => {
    const { error } = await supabase
        .from('todos')
        .update({ is_priority: !isPriority })
        .eq('id', id);

    if (error) {
        console.error('Error updating priority:', error);
        return;
    }

    await fetchTodosForDate(userId, selectedDate, setTodos);
};

export const saveTodos = async (
    userId: string,
    inputs: string[],
    setTodos: (todos: Todo[]) => void,
    resetInputs: () => void,
    setAnimateOut: (animate: boolean) => void,
    setShowInput: (show: boolean) => void,
    selectedDate: Date
) => {
    const nonEmptyInputs = inputs.filter(input => input.trim() !== '');
    if (nonEmptyInputs.length === 0) {
        alert('할 일을 입력해주세요.');
        return;
    } else {
        alert('저장되었습니다.');
    }

    const dateString = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];

    const { data: existingTodos } = await supabase
        .from('todos')
        .select('id')
        .eq('user_id', userId);

    const currentOrder = existingTodos ? existingTodos.length : 0;

    const { data, error } = await supabase
        .from('todos')
        .insert(nonEmptyInputs.map((content, index) => ({
            user_id: userId,
            content,
            is_complete: false,
            is_priority: false,
            created_at: new Date().toISOString(),
            date: dateString,
            original_order: currentOrder + index,
        })));

    if (error) {
        console.error('Error saving todos:', error);
    } else {
        console.log('Todos saved successfully:', data);
        resetInputs();
        setAnimateOut(true);
        setTimeout(() => {
            setShowInput(false);
            setAnimateOut(false);
        }, 100);
        await fetchTodosForDate(userId, selectedDate, setTodos);
    }
};

export const restoreTodo = async (userId: string, id: string, setTodos: (todos: Todo[]) => void): Promise<void> => {
    const { data: archivedTodos, error } = await supabase
        .from('archived_todos')
        .select('*')
        .eq('user_id', userId)
        .eq('id', id);

    if (error) {
        console.error('Error fetching archived todo:', error);
        return;
    }

    if (!archivedTodos || archivedTodos.length === 0) {
        console.log('No archived todo to restore');
        return;
    }

    const archivedTodo = archivedTodos[0];

    const todoToInsert: Todo = {
        user_id: archivedTodo.user_id,
        content: archivedTodo.content,
        is_complete: archivedTodo.is_complete,
        is_priority: archivedTodo.is_priority,
        created_at: archivedTodo.created_at,
        original_order: archivedTodo.original_order,
        date: archivedTodo.date, // date 속성 추가
        id: uuidv4() // 클라이언트 측에서 새로운 UUID 생성
    };


    const { data: restoredTodo, error: restoreError } = await supabase
        .from('todos')
        .insert(todoToInsert);

    if (restoreError) {
        console.error('Error restoring todo:', restoreError);
        return;
    }

    const { data: deleteData, error: deleteError } = await supabase
        .from('archived_todos')
        .delete()
        .eq('id', archivedTodo.id);

    if (deleteError) {
        console.error('Error deleting archived todo:', deleteError);
        return;
    }

    await fetchTodos(userId, setTodos);
};

export const fetchAndMoveUncompletedTodos = async (userId: string, setUncompletedTodos: (todos: Todo[]) => void): Promise<void> => {
    const { data: uncompletedTodos, error } = await supabase
        .from('archived_todos')
        .select('*')
        .eq('user_id', userId)
        .order('original_order', { ascending: true });

    if (error) {
        console.error('Error fetching uncompleted todos:', error);
        return;
    }

    const uniqueUncompletedTodos = removeDuplicates(uncompletedTodos, 'id');
    setUncompletedTodos(uniqueUncompletedTodos);
};

export const removeDuplicates = <T extends Record<string, any>>(array: T[], key: keyof T): T[] => {
    return array.filter((obj, index, self) =>
        index === self.findIndex((el) => (
            el[key] === obj[key]
        ))
    );
};

export const checkSpecificTime = async (userId: string, setTodos: (todos: Todo[]) => void, setUncompletedTodos: (todos: Todo[]) => void): Promise<void> => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const targetHour = 0;
    const targetMinute = 0;
    if (currentHour === targetHour && currentMinute === targetMinute) {
        await deleteCompletedTodos(userId, setTodos);
        await archiveTodos(userId, setTodos, setUncompletedTodos);
    }
};

export const setupMidnightCheck = (userId: string, setTodos: (todos: Todo[]) => void, setUncompletedTodos: (todos: Todo[]) => void): () => void => {
    const checkAndUpdate = async () => {
        await checkSpecificTime(userId, setTodos, setUncompletedTodos);
    };

    checkAndUpdate();
    const interval = setInterval(checkAndUpdate, 60 * 1000);
    return () => clearInterval(interval);
};
