'use client';

import { useEffect, useRef, useState } from 'react';
import { useTodoStore } from '../Store/useAuthTodoStore';
import { supabase } from '../lib/supabaseClient';
import { styled, keyframes } from '@pigment-css/react';
import { fetchTodos } from '@components/util/todoUtil';
import { v4 as uuidv4 } from 'uuid';

const fadeInDropDownModal = keyframes({
    'from': {
        opacity: 0,
        transform: 'scale(0.9)',
    },
    'to': {
        opacity: 1,
        transform: 'scale(1)',
    }
});

const fadeOutDropDownModal = keyframes({
    'from': {
        opacity: 1,
        transform: 'scale(1)',
    },
    'to': {
        opacity: 0,
        transform: 'scale(0.9)',
    }
});

const fadeInModal = keyframes({
    'from': {
        opacity: 0,
        transform: 'scale(0.9)',
    },
    'to': {
        opacity: 1,
        transform: 'scale(1)',
    }
});

const fadeOutModal = keyframes({
    'from': {
        opacity: 1,
        transform: 'scale(1)',
    },
    'to': {
        opacity: 0,
        transform: 'scale(0.9)',
    }
});

const rotateAdd = keyframes({
    'from': {
        transform: 'rotate(0deg)',
    },
    'to': {
        transform: 'rotate(135deg)',
    }
});

const rotateCancel = keyframes({
    'from': {
        transform: 'rotate(135deg)',
    },
    'to': {
        transform: 'rotate(0deg)',
    }
});

const TodoContainer = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    width: '100%',
    maxWidth: '972px',
    margin: '0 auto',
    padding: '12px',

    "& ul": {
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },

    "& li": {
        listStyle: 'none',
    },

    '@media (max-width: 1224px)': {
        maxWidth: '90%',
        flexDirection: 'column',
        gap: '2rem',
    }
});

const ProgressTodoContainer = styled('div')({
    flex: 1, // 동일한 flex-grow 값을 설정하여 같은 너비를 갖도록 함
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '12px',
    borderRadius: '12px',
    padding: '1rem',
    boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
});

const ComplecatedTodoContainer = styled('div')({
    flex: 1, // 동일한 flex-grow 값을 설정하여 같은 너비를 갖도록 함
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderRadius: '12px',
    padding: '1rem',
    boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
});

const AddToDoBtn = styled('button')<{ isOpen: boolean }>({
    padding: '12px',
    backgroundColor: '#0075FF',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '50%',
    display: 'flex',
    gap: '8px',
    marginLeft: 'auto',

    '& img': {
        width: '28px',
        height: '28px',
        animation: (props) => props.isOpen ? `${rotateAdd} 0.1s ease forwards` : `${rotateCancel} 0.1s ease forwards`,
    },
});

const AddToDoBtnContainer = styled('div')({
    position: 'relative',
    justifyContent: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
});

const ModalOverlay = styled('div')({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
});

const ModalContent = styled('div')<{ isOpen: boolean }>({
    background: 'white',
    padding: '1rem 1rem 0',
    borderRadius: '12px',
    maxWidth: '572px',
    width: '100%',
    maxHeight: '80vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    animation: (props) => props.isOpen ? `${fadeInModal} 0.2s ease forwards` : `${fadeOutModal} 0.2s ease forwards`,

    "&::-webkit-scrollbar": {
        width: '8px',
    },

    "&::-webkit-scrollbar-thumb": {
        backgroundColor: '#A9A9A9',
        borderRadius: '8px',
    },

    "&::-webkit-scrollbar-track": {
        background: 'transparent',
    },

    "@media (max-width: 1224px)": {
        maxWidth: '80%',
    }
});


const ToDoInputContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',

    '& input': {
        width: '100%',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #E7E7E7',
        outline: 'none',
        boxSizing: 'border-box',
        fontSize: '1rem',
    },
});

const TodoSaveAndCancelBtnContainer = styled('div')({
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '1rem',
    padding: '1rem 0',
    boxSizing: 'border-box',
    width: '100%',
    position: 'sticky',
    bottom: 0,
    background: 'white',
});

const CancelBtn = styled('button')({
    padding: '12px 18px',
    backgroundColor: '#E7E7E7',
    color: '#AEAEAE',
    fontSize: '0.8rem',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
    outline: 'none',
    transition: 'background-color 0.2s, color 0.2s',
    fontWeight: 'bold',

    '&:hover': {
        backgroundColor: '#D7D7D7',
    }
});

const SaveTodoBtn = styled('button')({
    padding: '12px 18px',
    backgroundColor: '#0075FF',
    color: '#FFFFFF',
    fontSize: '0.8rem',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
    outline: 'none',
    transition: 'background-color 0.2s, color 0.2s',
    fontWeight: 'bold',

    '&:hover': {
        backgroundColor: '#0055CC',
    }
});

const ModalTitleContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '1rem',

    '& h2, & p': {
        margin: '0'
    },

    '& p': {
        color: '#6A6A6A',
        fontSize: '0.9rem',
    }
});

const AddTodoBtn = styled('button')({
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    padding: '12px',
    backgroundColor: '#0075FF',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
    outline: 'none',
    transition: 'background-color 0.2s',
    margin: '1rem 0',

    '& img': {
        width: '20px',
        height: '20px',
    },

    '& p': {
        margin: 'auto 0',
    },

    '&:hover': {
        backgroundColor: '#0055CC',
    }
});

const TodoListContentContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'space-between',
    position: 'relative',

    '& li': {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: 'auto 0',
    }
});

const NoTodoListText = styled('p')({
    color: '#A7A7A7',
    fontSize: '1rem',
    margin: 'auto',
    textAlign: 'center',
});

const PriorityButton = styled('button')<{ isPriority: boolean }>({
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '50%',
    width: '40px',
    height: '40px',

    '& svg': {
        width: '24px',
        height: '24px',
        fill: (props) => props.isPriority ? '#F9E000' : '#D3D3D3',
        stroke: (props) => props.isPriority ? '#F9E000' : '#D3D3D3',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
    }
});

const ImportantTodoContainer = styled('div')({
    padding: '1rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderBottom: '4px dotted #E7E7E7',
});

const DotMenuBtn = styled('button')<{ isDropDownOpen: boolean }>({
    width: '40px',
    height: '40px',
    padding: '8px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: (props) => props.isDropDownOpen ? '#F7F7F7' : 'transparent',
    borderRadius: '50%',

    '& img': {
        width: '24px',
        height: '24px',
    }
});

const DropdownMenu = styled('div')<{ isDropDownOpen: boolean }>({
    position: 'absolute',
    top: '40px',
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    zIndex: 1,
    animation: (props) => props.isDropDownOpen ? `${fadeInDropDownModal} 0.2s ease forwards` : `${fadeOutDropDownModal} 0.2s ease forwards`,
});

const DropdownItem = styled('button')({
    padding: '12px 1rem',
    width: '100%',
    textAlign: 'left',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontSize: '0.9rem',

    '&:hover': {
        backgroundColor: '#F7F7F7',
    }
});

const CompleteItem = styled(DropdownItem)({
    color: '#0075FF',
});

const DeleteItem = styled(DropdownItem)({
    color: '#FF0000',
});

const UncompletedTodoContainer = styled('div')({
    flex: 1, // 동일한 flex-grow 값을 설정하여 같은 너비를 갖도록 함
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderRadius: '12px',
    padding: '1rem',
    boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
});

const UncompletedDotMenuBtn = styled(DotMenuBtn)({
    backgroundColor: 'transparent',

});

const UncompletedDropdownMenu = styled(DropdownMenu)({
    top: '40px',
    right: 0,
});

const UncompletedDeleteItem = styled(DeleteItem)({
    width: '100%',
});

const UncompletedCompleteItem = styled(CompleteItem)({
    width: '100%',
});

const UncompletedRestoreItem = styled(DropdownItem)({
    color: '#0075FF',
});

interface Todo {
    id: string;
    user_id: string;
    content: string;
    is_complete: boolean;
    is_priority: boolean;
    created_at: string;
    original_order: number;
}

type Keyable = {
    [key: string]: any;
};

const TodoComponent = () => {
    const { todos, inputs, addInput, setInput, setTodos, resetInputs } = useTodoStore();
    const [showInput, setShowInput] = useState<boolean>(false);
    const [animateOut, setAnimateOut] = useState<boolean>(false);
    const [showDropdown, setShowDropdown] = useState<string | null>(null);
    const [uncompletedTodos, setUncompletedTodos] = useState<Todo[]>([]);
    const [uncompletedShowDropdown, setUncompletedShowDropdown] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const modalContentRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (inputs.length < 3) {
            const additionalInputs = Array(3 - inputs.length).fill('');
            additionalInputs.forEach(() => addInput());
        }
    }, [inputs, addInput]);

    useEffect(() => {
        if (modalContentRef.current) {
            modalContentRef.current.scrollTop = modalContentRef.current.scrollHeight;
        }
    }, [inputs]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(null);
                setUncompletedShowDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    useEffect(() => {
        if (showInput) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [showInput]);

    const deleteCompletedTodos = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        const { data, error } = await supabase
            .from('todos')
            .delete()
            .eq('user_id', user.id)
            .eq('is_complete', true);

        if (error) {
            console.error('Error deleting completed todos:', error);
        } else {
            console.log('Completed todos deleted successfully:', data);
            await fetchTodos(user.id, setTodos); // 삭제 후 최신 데이터 다시 가져오기
        }
    };

    const archiveTodos = async () => {
        console.log('archiveTodos 함수 호출됨');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.error('세션을 가져오는 중 오류 발생:', sessionError);
            return;
        }

        const user = session?.user;
        if (!user) {
            console.error('사용자를 찾을 수 없음');
            return;
        }

        const { data: todos, error: fetchError } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_complete', false);

        if (fetchError) {
            console.error('일정을 가져오는 중 오류 발생:', fetchError);
            return;
        }

        if (!todos || todos.length === 0) {
            console.log('아카이브할 일정이 없습니다');
            return;
        }

        console.log('가져온 일정:', todos);

        const uniqueTodos = removeDuplicates(todos, 'id'); // 중복 제거

        const todosToInsert = uniqueTodos.map(todo => {
            const originalOrder = todo.original_order !== null ? parseInt(todo.original_order, 10) : null;
            console.log(`Original order for todo ${todo.id}:`, originalOrder);
            return {
                id: todo.id,
                user_id: todo.user_id,
                content: todo.content,
                is_complete: todo.is_complete,
                is_priority: todo.is_priority,
                created_at: todo.created_at,
                original_order: originalOrder,
                archived_id: uuidv4() // UUID 필드로 변환 후 적절한 값을 할당
            };
        });

        const { data: archivedTodos, error: archiveError } = await supabase
            .from('archived_todos')
            .insert(todosToInsert);

        if (archiveError) {
            console.error('일정을 아카이브하는 중 오류 발생:', archiveError);
            return;
        }

        console.log('아카이브된 일정:', archivedTodos);

        const { data: deleteData, error: deleteError } = await supabase
            .from('todos')
            .delete()
            .in('id', uniqueTodos.map(todo => todo.id));

        if (deleteError) {
            console.error('일정을 삭제하는 중 오류 발생:', deleteError);
            return;
        }

        console.log('삭제된 일정:', deleteData);
        fetchAndMoveUncompletedTodos();
    };

    const updateTodos = (newTodo: Todo) => {
        setTodos([...todos, newTodo]);
    };

    const restoreTodo = async (id: string) => {
        console.log('restoreTodo 함수 호출됨');
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        const { data: archivedTodos, error } = await supabase
            .from('archived_todos')
            .select('*')
            .eq('user_id', user.id)
            .eq('id', id);

        if (error) {
            console.error('아카이브된 일정을 가져오는 중 오류 발생:', error);
            return;
        }

        if (!archivedTodos || archivedTodos.length === 0) {
            console.log('복원할 아카이브된 일정이 없습니다');
            return;
        }

        const archivedTodo = archivedTodos[0];
        console.log('가져온 아카이브된 일정:', archivedTodo);

        const todoToInsert: Todo = {
            user_id: archivedTodo.user_id,
            content: archivedTodo.content,
            is_complete: archivedTodo.is_complete,
            is_priority: archivedTodo.is_priority,
            created_at: archivedTodo.created_at,
            original_order: archivedTodo.original_order,
            id: uuidv4() // 클라이언트 측에서 새로운 UUID 생성
        };

        const { data: restoredTodo, error: restoreError } = await supabase
            .from('todos')
            .insert(todoToInsert);

        if (restoreError) {
            console.error('일정을 복원하는 중 오류 발생:', restoreError);
            return;
        }

        const { data: deleteData, error: deleteError } = await supabase
            .from('archived_todos')
            .delete()
            .eq('id', archivedTodo.id);

        if (deleteError) {
            console.error('아카이브된 일정을 삭제하는 중 오류 발생:', deleteError);
            return;
        }

        console.log('일정이 성공적으로 복원되었습니다:', restoredTodo);

        // Zustand 상태 업데이트
        updateTodos(todoToInsert);

        setUncompletedTodos((prevUncompleted) => {
            const newUncompleted = prevUncompleted.filter(todo => todo.id !== id);
            return newUncompleted;
        });
    };



    const fetchAndMoveUncompletedTodos = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        const { data: uncompletedTodos, error } = await supabase
            .from('archived_todos')
            .select('*')
            .eq('user_id', user.id)
            .order('original_order', { ascending: true });

        if (error) {
            console.error('Error fetching uncompleted todos:', error);
        } else {
            // 중복 제거
            const uniqueUncompletedTodos = removeDuplicates(uncompletedTodos, 'id');
            setUncompletedTodos(uniqueUncompletedTodos);
        }
    };

    const removeDuplicates = <T extends Keyable>(array: T[], key: keyof T): T[] => {
        return array.filter((obj, index, self) =>
            index === self.findIndex((el) => (
                el[key] === obj[key]
            ))
        );
    };


    const fetchInitialTodos = async () => {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        const { data: allTodos, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user.id)
            .order('original_order', { ascending: true });

        if (error) {
            console.error('Error fetching todos:', error);
            return;
        }

        setTodos(allTodos);
        setIsLoading(false);
    };

    useEffect(() => {
        const initializeTodos = async () => {
            await fetchInitialTodos();
            await fetchAndMoveUncompletedTodos();
        };

        initializeTodos();
    }, []);

    useEffect(() => {
        const checkSpecificTime = () => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            const targetHour = 0;
            const targetMinute = 0;

            console.log(`현재 시간: ${currentHour}:${currentMinute}`);

            if (currentHour === targetHour && currentMinute === targetMinute) {
                console.log('특정 시간이 되어 archiveTodos 함수를 호출합니다.');
                deleteCompletedTodos();
                archiveTodos();
            }
        };

        checkSpecificTime(); // 초기 체크
        const interval = setInterval(checkSpecificTime, 60 * 1000); // 매 분마다 체크

        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return <div>Loading...</div>; // 로딩 상태일 때 표시할 내용
    }

    const handleInputChange = (index: number, value: string) => {
        setInput(index, value);
    };

    const handleDotMenuClick = (todoId: string) => {
        setShowDropdown(prev => (prev === todoId ? null : todoId));
    };

    const handleUncompletedDotMenuClick = (todoId: string) => {
        setUncompletedShowDropdown(prev => (prev === todoId ? null : todoId));
    };

    const restoreTodoHandler = (id: string) => {
        restoreTodo(id);
        setUncompletedShowDropdown(null);
    };

    const saveTodos = async () => {
        const nonEmptyInputs = inputs.filter(input => input.trim() !== '');
        if (nonEmptyInputs.length === 0) {
            alert('할 일을 입력해주세요.');
            return;
        } else {
            alert('저장되었습니다.');
        }

        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        // 기존 할 일의 개수를 가져와서 original_order 값을 설정합니다.
        const { data: existingTodos } = await supabase
            .from('todos')
            .select('id')
            .eq('user_id', user.id);

        const currentOrder = existingTodos ? existingTodos.length : 0;

        const { data, error } = await supabase
            .from('todos')
            .insert(nonEmptyInputs.map((content, index) => ({
                user_id: user.id,
                content,
                is_complete: false,
                is_priority: false, // 기본값으로 설정
                created_at: new Date().toISOString(),
                original_order: currentOrder + index, // original_order 값 설정
            })));

        if (error) {
            console.error('Error saving todos:', error);
        } else {
            console.log('Todos saved successfully:', data);
            resetInputs();
            setAnimateOut(true); // 시작 애니메이션
            setTimeout(() => {
                setShowInput(false); // 애니메이션 완료 후 모달 닫기
                setAnimateOut(false); // 애니메이션 상태 초기화
            }, 100); // 애니메이션 시간과 맞추기
            await fetchTodos(user.id, setTodos); // 데이터를 정렬하여 다시 가져옴
        }
    };

    const deleteTodo = async (id: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        if (confirm('할 일을 삭제하시겠습니까?')) {
            const { data, error } = await supabase
                .from('todos')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting todo:', error);
            } else {
                alert('할 일을 성공적으로 제거했어요.');
                console.log('할 일을 성공적으로 제거했어요.', data);
                await fetchTodos(user.id, setTodos); // 최신 데이터 다시 가져오기
                setShowDropdown(null); // 드롭다운 메뉴 닫기
            }
        }
    };

    const toggleTodo = async (id: string, isComplete: boolean) => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        const { data, error } = await supabase
            .from('todos')
            .update({ is_complete: !isComplete })
            .eq('id', id);

        if (error) {
            console.error('Error updating todo:', error);
        } else {
            await fetchTodos(user.id, setTodos); // 최신 데이터 다시 가져오기
            setShowDropdown(null); // 드롭다운 메뉴 닫기
        }
    };

    const togglePriority = async (id: string, isPriority: boolean) => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        const { data, error } = await supabase
            .from('todos')
            .update({ is_priority: !isPriority })
            .eq('id', id);

        if (error) {
            console.error('Error updating priority:', error);
        } else {
            console.log('Priority updated successfully:', data);
            await fetchTodos(user.id, setTodos); // 최신 데이터 다시 가져오기
        }
    };

    const closeModal = () => {
        setAnimateOut(true); // 시작 애니메이션
        setTimeout(() => {
            setShowInput(false); // 애니메이션 완료 후 모달 닫기
            setAnimateOut(false); // 애니메이션 상태 초기화
            resetInputs();
        }, 100); // 애니메이션 시간과 맞추기
    };

    const handleAddInput = () => {
        if (inputs.length >= 20) {
            alert('한번에 최대 20개까지 추가할 수 있어요.');
        } else {
            addInput();
            setTimeout(() => {
                if (modalContentRef.current) {
                    modalContentRef.current.scrollTo({
                        top: modalContentRef.current.scrollHeight,
                        behavior: 'smooth',
                    });
                }
            }, 100);
        }
    };

    const importantTodos = todos.filter(todo => todo.is_priority && !todo.is_complete);
    const nonImportantTodos = todos.filter(todo => !todo.is_priority && !todo.is_complete);

    return (
        <TodoContainer>
            <ProgressTodoContainer>
                <h2>진행 중인 일정</h2>
                {todos.filter(todo => !todo.is_complete).length === 0 ? (
                    <NoTodoListText>현재 진행 중인 일정이 없어요.</NoTodoListText>
                ) : (
                    <ul>
                        {importantTodos.length > 0 && (
                            <ImportantTodoContainer>
                                {importantTodos.map((todo) => (
                                    <TodoListContentContainer key={todo.id}>
                                        <li>
                                            <PriorityButton
                                                isPriority={todo.is_priority}
                                                onClick={() => togglePriority(todo.id, todo.is_priority)}
                                            >
                                                <svg
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill={todo.is_priority ? "#F9E000" : "none"}
                                                    stroke="#F9E000"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                                </svg>
                                            </PriorityButton>
                                            {todo.content}
                                        </li>
                                        <DotMenuBtn onClick={() => handleDotMenuClick(todo.id)} isDropDownOpen={showDropdown === todo.id}>
                                            <img src="/dot-menu.svg" alt="Dot Menu" />
                                        </DotMenuBtn>
                                        {showDropdown === todo.id && (
                                            <DropdownMenu ref={dropdownRef} isDropDownOpen={!!showDropdown}>
                                                <CompleteItem onClick={() => { toggleTodo(todo.id, todo.is_complete); setShowDropdown(null); }}>
                                                    일정 완료
                                                </CompleteItem>
                                                <DeleteItem onClick={() => { deleteTodo(todo.id); setShowDropdown(null); }}>
                                                    삭제
                                                </DeleteItem>
                                            </DropdownMenu>
                                        )}
                                    </TodoListContentContainer>
                                ))}
                            </ImportantTodoContainer>
                        )}
                        {nonImportantTodos.map((todo) => (
                            <TodoListContentContainer key={todo.id}>
                                <li>
                                    <PriorityButton
                                        isPriority={todo.is_priority}
                                        onClick={() => togglePriority(todo.id, todo.is_priority)}
                                    >
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill={todo.is_priority ? "#F9E000" : "none"}
                                            stroke="#F9E000"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                        </svg>
                                    </PriorityButton>
                                    {todo.content}
                                </li>
                                <DotMenuBtn onClick={() => handleDotMenuClick(todo.id)} isDropDownOpen={showDropdown === todo.id}>
                                    <img src="/dot-menu.svg" alt="Dot Menu" />
                                </DotMenuBtn>
                                {showDropdown === todo.id && (
                                    <DropdownMenu ref={dropdownRef} isDropDownOpen={!!showDropdown}>
                                        <CompleteItem onClick={() => { toggleTodo(todo.id, todo.is_complete); setShowDropdown(null); }}>
                                            일정 완료
                                        </CompleteItem>
                                        <DeleteItem onClick={() => { deleteTodo(todo.id); setShowDropdown(null); }}>
                                            삭제
                                        </DeleteItem>
                                    </DropdownMenu>
                                )}
                            </TodoListContentContainer>
                        ))}
                    </ul>
                )}
                <AddToDoBtnContainer>
                    <AddToDoBtn onClick={() => setShowInput(!showInput)} isOpen={showInput}>
                        <img src="/add.svg" alt="Add Todo" />
                    </AddToDoBtn>
                    {(showInput || animateOut) && (
                        <ModalOverlay>
                            <ModalContent isOpen={showInput && !animateOut} ref={modalContentRef}>
                                <ModalTitleContainer>
                                    <h2>할 일 추가</h2>
                                    <p>오늘 해야 할 일을 추가해 보세요.<br />한번에 최대 20개까지 추가 가능해요.</p>
                                </ModalTitleContainer>
                                <ToDoInputContainer>
                                    {inputs.map((input, index) => (
                                        <div key={index}>
                                            <input
                                                type="text"
                                                value={input}
                                                placeholder='할 일을 입력해주세요.'
                                                onChange={(e) => handleInputChange(index, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </ToDoInputContainer>
                                <AddTodoBtn onClick={handleAddInput}>
                                    <img src="/add.svg" alt="Add Todo" />
                                    <p>할 일 항목 추가</p>
                                </AddTodoBtn>
                                <TodoSaveAndCancelBtnContainer>
                                    <CancelBtn onClick={closeModal}>취소</CancelBtn>
                                    <SaveTodoBtn onClick={saveTodos}>저장</SaveTodoBtn>
                                </TodoSaveAndCancelBtnContainer>
                            </ModalContent>
                        </ModalOverlay>
                    )}
                </AddToDoBtnContainer>
            </ProgressTodoContainer>

            <ComplecatedTodoContainer>
                <h2>완료된 일정</h2>
                {todos.filter(todo => todo.is_complete).length === 0 ? (
                    <NoTodoListText>완료된 할 일이 없어요.</NoTodoListText>
                ) : (
                    <ul>
                        {todos.filter(todo => todo.is_complete).map((todo) => (
                            <li key={todo.id}>
                                <input
                                    type="checkbox"
                                    checked={todo.is_complete}
                                    onChange={() => toggleTodo(todo.id, todo.is_complete)}
                                />
                                {todo.content}
                            </li>
                        ))}
                    </ul>
                )}
            </ComplecatedTodoContainer>
            <UncompletedTodoContainer>
                <h2>완료하지 못한 일정</h2>
                {uncompletedTodos.length === 0 ? (
                    <NoTodoListText>완료하지 못한 할 일이 없어요.</NoTodoListText>
                ) : (
                    <ul>
                        {uncompletedTodos.map((todo) => (
                            <TodoListContentContainer key={todo.id}>
                                <li>
                                    {todo.content}
                                </li>
                                <UncompletedDotMenuBtn onClick={() => handleUncompletedDotMenuClick(todo.id)} isDropDownOpen={uncompletedShowDropdown === todo.id}>
                                    <img src="/dot-menu.svg" alt="Dot Menu" />
                                </UncompletedDotMenuBtn>
                                {uncompletedShowDropdown === todo.id && (
                                    <UncompletedDropdownMenu ref={dropdownRef} isDropDownOpen={!!uncompletedShowDropdown}>
                                        <UncompletedRestoreItem onClick={() => restoreTodoHandler(todo.id)}>
                                            끌어올리기
                                        </UncompletedRestoreItem>
                                        <UncompletedDeleteItem onClick={() => { deleteTodo(todo.id); setUncompletedShowDropdown(null); }}>
                                            삭제
                                        </UncompletedDeleteItem>
                                    </UncompletedDropdownMenu>
                                )}
                            </TodoListContentContainer>
                        ))}
                    </ul>
                )}
            </UncompletedTodoContainer>
        </TodoContainer>
    );
};

export default TodoComponent;
