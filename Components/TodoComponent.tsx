'use client';

import { useEffect, useRef, useState } from 'react';
import { useTodoStore } from '../Store/useAuthTodoStore';
import { supabase } from '../lib/supabaseClient';
import { styled, keyframes } from '@pigment-css/react';
import { fetchTodos, setupMidnightCheck, restoreTodo, fetchAndMoveUncompletedTodos } from '@components/util/todoUtil';
import { Todo } from '@components/types/todo';

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

const MainTodoListContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    width: '100%',
    maxWidth: '972px',
    margin: '0 auto',
    padding: '2rem 0',

    '@media (max-width: 1224px)': {
        maxWidth: '90%',
        flexDirection: 'column',
        gap: '2rem',
    }
});

const TodoContainer = styled('div')({
    display: 'flex',
    flexDirection: 'row', // 모바일에서 세로로 정렬
    gap: '2rem',
    width: '100%',
    maxWidth: '972px',
    margin: '0 auto',

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
        maxWidth: '100%',
        flexDirection: 'column',
        gap: '2rem',
    }
});

const commonContainerStyles = {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
    gap: '12px',
    borderRadius: '12px',
    padding: '1rem',
    boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
    overflowY: 'auto',
    height: 'calc(100vh - 20rem)', // 화면 높이에 따라 동적으로 설정

    "& h2": {
        margin: 0,
        color: '#333333',
        fontSize: '1.5rem',
    },

    "& ul": {
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },

    "& li": {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: 'auto 0',
    },

    "&::-webkit-scrollbar": {
        width: '8px',
    },

    "&::-webkit-scrollbar-thumb": {
        backgroundColor: '#E1E1E1',
        borderRadius: '8px',
    },

    "&::-webkit-scrollbar-track": {
        background: 'transparent',
    },

    '@media (max-width: 1224px)': {
        maxWidth: '100%',
        flex: 1,
    }
};

const ProgressTodoContainer = styled('div')(commonContainerStyles);
const ComplecatedTodoContainer = styled('div')(commonContainerStyles);

const CompleteInfoContainer = styled('div')({
    display: 'flex',
    gap: '12px',
    color: '#7E7CDE',
    fontSize: '1rem',
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: '#F3F4FF',

    '& img': {
        width: '24px',
        height: '24px',
        margin: 'auto 0',
    }
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
    position: 'sticky',
    bottom: 0,
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
    position: 'relative', // position 설정 추가
    background: '#F6F8FC',
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
        border: 'none',
        outline: 'none',
        boxSizing: 'border-box',
        fontSize: '1rem',
        backgroundColor: '#FFFFFF',

        "&:focus": {
            outline: "none",
            border: "1px solid #E7E7E7",
        },
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
    background: '#F6F8FC',
});

const CancelBtn = styled('button')({
    padding: '12px 1.6rem',
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
    padding: '12px 1.6rem',
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
    position: 'relative',  // 부모 요소를 상대적으로 위치시키기 위해 추가

    '& li': {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: 'auto 0',
    }
});

const TodoListIncompleteContentContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'space-between',

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
    position: 'relative',  // 상대적으로 위치시키기 위해 추가

    '& img': {
        width: '24px',
        height: '24px',
    }
});

const DropdownMenu = styled('div')<{ isDropDownOpen: boolean }>({
    position: 'absolute',
    width: '160px',
    top: '100%',  // 버튼 바로 아래로 설정
    right: '10px',     // 왼쪽 정렬
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    zIndex: 1,
    animation: (props) => props.isDropDownOpen ? `${fadeInDropDownModal} 0.2s ease forwards` : `${fadeOutDropDownModal} 0.2s ease forwards`,
});

const DropdownItem = styled('button')({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 8px',
    width: '100%',
    textAlign: 'left',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontSize: '0.9rem',

    '& img': {
        width: '20px',
        height: '20px',
    },

    '&:hover': {
        backgroundColor: '#F7F7F7',
    }
});

const CompleteItem = styled(DropdownItem)({
    color: '#333333',
});

const DeleteItem = styled(DropdownItem)({
    display: 'flex',
    alignItems: 'center',
    color: '#FF5A5A',
});

const UncompletedTodoContainer = styled('div')(commonContainerStyles);

const UncompletedDotMenuContainer = styled('div')<{ isOpen: boolean }>({
    position: (props) => props.isOpen ? 'static' : 'relative',  // 상대적으로 위치시키기 위해 추가
});

const UncompletedDotMenuBtn = styled('button')<{ isDropDownOpen: boolean }>({
    width: '40px',
    height: '40px',
    padding: '8px',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '50%',
    backgroundColor: (props) => props.isDropDownOpen ? '#F7F7F7' : 'transparent',

    '& img': {
        width: '24px',
        height: '24px',
    }
});

const UncompletedDropdownMenu = styled('div')<{ isDropDownOpen: boolean }>({
    position: 'absolute',
    width: '160px',
    top: '100%',  // 버튼 바로 아래로 설정
    right: '10px',     // 왼쪽 정렬
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    zIndex: 1,
    animation: (props) => props.isDropDownOpen ? `${fadeInDropDownModal} 0.2s ease forwards` : `${fadeOutDropDownModal} 0.2s ease forwards`,
});

const UncompletedDeleteItem = styled(DeleteItem)({
    width: '100%',
});

const UncompletedRestoreItem = styled(DropdownItem)({
    color: '#333333',
});

const TodoComponent = () => {
    const { todos, inputs, addInput, setInput, setTodos, resetInputs } = useTodoStore();
    const [showInput, setShowInput] = useState<boolean>(false);
    const [animateOut, setAnimateOut] = useState<boolean>(false);
    const [showDropdown, setShowDropdown] = useState<string | null>(null);
    const [uncompletedTodos, setUncompletedTodos] = useState<Todo[]>([]);
    const [uncompletedShowDropdown, setUncompletedShowDropdown] = useState<string | null>(null);
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

    useEffect(() => {
        const initializeTodos = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            if (!user) return;

            await fetchTodos(user.id, setTodos);
            await fetchAndMoveUncompletedTodos(user.id, setUncompletedTodos);
        };

        initializeTodos();
    }, []);

    useEffect(() => {
        const setupCheck = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            if (!user) return;

            const intervalCleanup = setupMidnightCheck(user.id, setTodos, setUncompletedTodos);

            return () => intervalCleanup();
        };

        setupCheck();
    }, []);

    const handleInputChange = (index: number, value: string) => {
        setInput(index, value);
    };

    const handleDotMenuClick = (todoId: string) => {
        setShowDropdown(prev => (prev === todoId ? null : todoId));
    };

    const handleUncompletedDotMenuClick = (todoId: string) => {
        setUncompletedShowDropdown(prev => (prev === todoId ? null : todoId));
    };

    const restoreTodoHandler = async (id: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        await restoreTodo(user.id, id, setTodos);

        setUncompletedTodos(prev => prev.filter(todo => todo.id !== id));
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
                is_priority: false,
                created_at: new Date().toISOString(),
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
            await fetchTodos(user.id, setTodos);
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
                await fetchTodos(user.id, setTodos);
                setShowDropdown(null);
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
            await fetchTodos(user.id, setTodos);
            setShowDropdown(null);
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
            await fetchTodos(user.id, setTodos);
        }
    };

    const closeModal = () => {
        setAnimateOut(true);
        setTimeout(() => {
            setShowInput(false);
            setAnimateOut(false);
            resetInputs();
        }, 100);
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
        <MainTodoListContainer>
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
                                                        <img src="/delete.svg" alt="Delete" />
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
                                        {showDropdown === todo.id && (
                                            <DropdownMenu ref={dropdownRef} isDropDownOpen={!!showDropdown}>
                                                <CompleteItem onClick={() => { toggleTodo(todo.id, todo.is_complete); setShowDropdown(null); }}>
                                                    일정 완료
                                                </CompleteItem>
                                                <DeleteItem onClick={() => { deleteTodo(todo.id); setShowDropdown(null); }}>
                                                    <img src="/delete.svg" alt="Delete" />
                                                    삭제
                                                </DeleteItem>
                                            </DropdownMenu>
                                        )}
                                    </DotMenuBtn>
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
                    <CompleteInfoContainer>
                        <img src="/info.svg" alt="Info" />
                        완료된 일정은 매일 자정이 되면 쌓이는 것을 방지하기 위해 자동 삭제 처리가 됩니다.
                    </CompleteInfoContainer>
                </ComplecatedTodoContainer>
            </TodoContainer>
            <UncompletedTodoContainer>
                <h2>완료하지 못한 일정</h2>
                {uncompletedTodos.length === 0 ? (
                    <NoTodoListText>완료하지 못한 할 일이 없어요.</NoTodoListText>
                ) : (
                    <ul>
                        {uncompletedTodos.map((todo) => (
                            <TodoListIncompleteContentContainer key={todo.id}>
                                <li>
                                    {todo.content}
                                </li>
                                <UncompletedDotMenuContainer isOpen={showInput}>
                                    <UncompletedDotMenuBtn onClick={() => handleUncompletedDotMenuClick(todo.id)} isDropDownOpen={uncompletedShowDropdown === todo.id}>
                                        <img src="/dot-menu.svg" alt="Dot Menu" />
                                    </UncompletedDotMenuBtn>
                                    {uncompletedShowDropdown === todo.id && (
                                        <UncompletedDropdownMenu ref={dropdownRef} isDropDownOpen={!!uncompletedShowDropdown}>
                                            <UncompletedRestoreItem onClick={() => restoreTodoHandler(todo.id)}>
                                                <img src="/arrow-up.svg" alt="ArrowUp" />
                                                끌어올리기
                                            </UncompletedRestoreItem>
                                            <UncompletedDeleteItem onClick={() => { deleteTodo(todo.id); setUncompletedShowDropdown(null); }}>
                                                <img src="/delete.svg" alt="Delete" />
                                                삭제
                                            </UncompletedDeleteItem>
                                        </UncompletedDropdownMenu>
                                    )}
                                </UncompletedDotMenuContainer>
                            </TodoListIncompleteContentContainer>
                        ))}
                    </ul>
                )}
            </UncompletedTodoContainer>
        </MainTodoListContainer>

    );
};

export default TodoComponent;
