import { supabase } from '@components/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { Todo } from '@components/types/todo';
import dayjs from 'dayjs';

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
        await fetchTodos(userId, setTodos);
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

export const updateTodo = async (userId: string, todoId: string, content: string, isDday: boolean, color: string, setTodos: any, selectedDate: Date) => {
    // 현재 todo의 original_order 값을 가져옵니다.
    const { data: currentTodo, error: fetchError } = await supabase
        .from('todos')
        .select('original_order')
        .eq('id', todoId)
        .eq('user_id', userId)
        .single();

    if (fetchError) {
        console.error('Error fetching todo original order:', fetchError);
        return;
    }

    const { original_order } = currentTodo;

    // original_order 값을 유지하면서 content, is_dday, color 값을 업데이트합니다.
    const { data, error } = await supabase
        .from('todos')
        .update({ content, is_dday: isDday, text_color: color, original_order })
        .eq('id', todoId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating todo:', error);
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
    isDday: boolean[],
    colors: string[],
    setTodos: (todos: Todo[]) => void,
    resetInputs: () => void,
    setAnimateOut: (animate: boolean) => void,
    setShowInput: (show: boolean) => void,
    selectedDate: Date
) => {
    const nonEmptyInputs = inputs.filter(input => input.trim() !== '');
    const filteredIsDday = isDday.filter((_, index) => inputs[index].trim() !== '');
    const filteredColors = colors.filter((_, index) => inputs[index].trim() !== '');

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
            is_dday: filteredIsDday[index],
            text_color: filteredColors[index],
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

export const fetchDdayTodos = async (userId: string, setDdayTodos: (todos: Todo[]) => void) => {
    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .eq('is_dday', true);

    if (error) {
        console.error('Error fetching D-day todos:', error);
    } else {
        const filteredDdayTodos = data.filter((todo: Todo) => {
            const todoDate = dayjs(todo.date).startOf('day'); // KST로 변환
            return isWithinRange(todoDate.toDate());
        }).sort((a: Todo, b: Todo) => {
            const aDate = dayjs(a.date).startOf('day'); // KST로 변환
            const bDate = dayjs(b.date).startOf('day'); // KST로 변환
            return aDate.diff(dayjs(), 'day') - bDate.diff(dayjs(), 'day');
        });
        setDdayTodos(filteredDdayTodos);
    }
};

const isWithinRange = (date: Date): boolean => {
    const hundredYearsLater = dayjs().add(100, 'year').startOf('day').toDate();
    return date <= hundredYearsLater;
};

export const updateTodoColor = async (userId: string, todoId: string, color: string, setTodos: (todos: Todo[]) => void, selectedDate: Date) => {
    try {
        const { data, error } = await supabase
            .from('todos')
            .update({ text_color: color })
            .eq('id', todoId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating todo color:', error);
            return;
        }

        console.log('Todo color updated successfully:', data);

        await fetchTodosForDate(userId, selectedDate, setTodos);
    } catch (error) {
        console.error('Unexpected error updating todo color:', error);
    }
};
