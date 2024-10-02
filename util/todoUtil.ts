import { supabase } from '@components/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { Todo } from '@components/types/todo';
import dayjs, { extend } from 'dayjs';

export const deleteCompletedTodos = async <T extends Todo>(userId: string, setTodos: (todos: Array<T>) => void): Promise<void> => {
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

export const fetchTodos = async <T extends Todo>(userId: string, setTodos: (todos: Array<T>) => void): Promise<void> => {
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

export const fetchTodosForDate = async <T extends Todo>(
    userId: string,
    date: Date,
    setTodos: (todos: Array<T>) => void
): Promise<void> => {
    // 한국 시간으로 변환하여 날짜를 문자열로 변환
    const koreanDateString = new Date(date.getTime() + (9 * 60 * 60 * 1000)).toISOString().split('T')[0];

    // supabase에서 데이터를 가져오는 부분
    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .eq('date', koreanDateString);

    if (error) {
        console.error('Error fetching todos:', error);
    } else {
        // 데이터를 Array<T>로 캐스팅하여 setTodos에 전달
        setTodos(data as Array<T>);
    }
};


export const archiveTodos = async <T extends Todo>(userId: string, setTodos: (todos: Array<T>) => void, setUncompletedTodos: (todos: Array<T>) => void): Promise<void> => {
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
        console.error('투두 일정 삭제하는데 오류 발생했어요.:', deleteError);
        return;
    }

    await fetchTodos(userId, setTodos);
    await fetchAndMoveUncompletedTodos(userId, setUncompletedTodos);
};

export const deleteTodo = async <T extends Todo>(userId: string, id: string, setTodos: (todos: Array<T>) => void, selectedDate: Date): Promise<void> => {
    const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('투두 일정 삭제하는데 오류 발생했어요.:', error);
        return;
    }

    await fetchTodosForDate(userId, selectedDate, setTodos);
};

export const updateTodo = async (
    userId: string,
    todoId: string,
    content: string,
    isDday: boolean,
    color: string,
    ddayDate: Date | null,  // 선택된 D-Day 날짜
    setTodos: (todos: Todo[]) => void,  // Todo[] 타입을 받는 함수
    selectedDate: Date
) => {
    // ddayDate가 Date 객체인지 확인 후 처리
    const formattedDdayDate = ddayDate instanceof Date ? ddayDate.toISOString().split('T')[0] : null;

    const { data, error } = await supabase
        .from('todos')
        .update({
            content: content,
            is_dday: isDday,  // is_dday 업데이트
            text_color: color,
            dday_date: formattedDdayDate  // dday_date 업데이트
        })
        .eq('id', todoId)
        .eq('user_id', userId);

    if (error) {
        console.error('할 일 업데이트 중 오류 발생:', error);
    } else {
        await fetchTodosForDate(userId, selectedDate, setTodos);  // setTodos 호출
    }
};

export const toggleTodo = async <T extends Todo>(userId: string, id: string, isComplete: boolean, setTodos: (todos: Array<T>) => void, selectedDate: Date): Promise<void> => {
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

export const togglePriority = async <T extends Todo>(userId: string, id: string, isPriority: boolean, setTodos: (todos: Array<T>) => void, selectedDate: Date): Promise<void> => {
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

export const saveTodos = async <T extends Todo>(
    userId: string,
    inputs: string[],
    isDday: boolean[],
    colors: string[],
    setTodos: (todos: Array<T>) => void,
    resetInputs: () => void,
    setAnimateOut: (animate: boolean) => void,
    setShowInput: (show: boolean) => void,
    selectedDate: Date
): Promise<string | null> => {  // ID 반환을 위해 반환 타입을 string으로 설정
    const nonEmptyInputs = inputs.filter(input => input.trim() !== '');
    const filteredIsDday = isDday.filter((_, index) => inputs[index].trim() !== '');
    const filteredColors = colors.filter((_, index) => inputs[index].trim() !== '');

    if (nonEmptyInputs.length === 0) {
        alert('할 일을 입력해주세요.');
        return null;  // 할 일이 없으면 null 반환
    } else {
        alert('저장되었습니다.');
    }

    const dateString = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];

    const { data: existingTodos } = await supabase
        .from('todos')
        .select('id')  // 반환 타입을 명시적으로 설정
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
        })))
        .select('id');  // 'id' 필드만 선택

    if (error) {
        console.error('Error saving todos:', error);
        return null;
    }

    // 마지막으로 추가된 할 일의 ID만 반환 (객체에서 id 값 추출)
    const lastTodoId = data?.[0]?.id || null;  // ID 반환 또는 null 반환
    return lastTodoId;
};


export const fetchAndMoveUncompletedTodos = async <T extends Todo>(userId: string, setUncompletedTodos: (todos: Array<T>) => void): Promise<void> => {
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

export const removeDuplicates = <T extends Record<string, any>>(array: Array<T>, key: keyof T): Array<T> => {
    return array.filter((obj, index, self) =>
        index === self.findIndex((el) => (
            el[key] === obj[key]
        ))
    );
};

export const fetchDdayTodos = async (userId: string, setDdayTodos: (todos: Todo[]) => void) => {
    try {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', userId)
            .eq('is_dday', true);

        if (error) {
            console.error('Error fetching D-Day todos:', error);
        } else {
            console.log('Fetched D-Day todos:', data);  // 데이터 로그로 확인
            setDdayTodos(data);  // 데이터를 상태로 설정
        }
    } catch (error) {
        console.error('Error fetching D-Day todos:', error);
    }
};

export const updateTodoColor = async <T extends Todo>(userId: string, todoId: string, color: string, setTodos: (todos: Array<T>) => void, selectedDate: Date) => {
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

export const saveDday = async (todoId: string, selectedDate: Date) => {
    const formattedDate = dayjs(selectedDate).tz("Asia/Seoul").format('YYYY-MM-DD');
    try {
        const { data, error } = await supabase
            .from('todos')
            .update({ dday_date: formattedDate, is_dday: true, date: formattedDate })
            .eq('id', todoId);

        if (error) {
            console.error('Supabase 업데이트 중 오류 발생:', error);
            return { success: false, error };
        }

        console.log('D-Day 날짜가 성공적으로 저장되었습니다:', data);
        return { success: true, data };
    } catch (error) {
        console.error('D-Day 날짜 저장 중 오류 발생:', error);
        return { success: false, error };
    }
};

export const fetchDdayDate = async (todoId: string): Promise<string | null> => {
    const { data, error } = await supabase
        .from('todos')
        .select('dday_date')  // 'dday_date'만 선택
        .eq('id', todoId)
        .single();  // 단일 결과를 기대

    if (error || !data) {
        console.error('Error fetching dday_date:', error || 'No data found');
        return null;
    }

    console.log('Fetched D-Day date:', data.dday_date);  // 반환된 D-Day 날짜 확인
    return data.dday_date;  // 'YYYY-MM-DD' 형식의 D-Day 날짜 반환
};


export const calculateDday = (ddayString: string): string => {
    if (!ddayString) {
        return 'D-Day 정보 없음';
    }

    const ddayDate = dayjs(ddayString, 'YYYY-MM-DD');
    const today = dayjs();

    const differenceInDays = ddayDate.diff(today, 'day');

    if (differenceInDays > 0) {
        return `D-${differenceInDays}`;
    } else if (differenceInDays < 0) {
        return `D+${Math.abs(differenceInDays)}`;
    } else {
        return 'D-Day';
    }
};

export const getLastInsertedTodoId = async (userId: string) => {
    const { data, error } = await supabase
        .from('todos')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

    if (error || !data || data.length === 0) {
        console.error('Error fetching last inserted todo ID:', error);
        return null;
    }

    return data[0].id;
};

export const updateTodoDate = async (userId: string, todoId: string, newDate: string) => {
    try {
        const { error } = await supabase
            .from('todos')
            .update({ date: newDate })
            .eq('user_id', userId)
            .eq('id', todoId);

        if (error) {
            console.error('Error updating todo date:', error);
        } else {
            console.log('Todo date updated successfully.');
        }
    } catch (error) {
        console.error('Unexpected error updating todo date:', error);
    }
};


