'use client';

import { useEffect, useState } from 'react';
import { useTodoStore } from '../Store/useAuthTodoStore';
import { supabase } from '../lib/supabaseClient';
import { styled, keyframes } from '@pigment-css/react';

const TodoContainer = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    gap: '12rem',
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
    gap: '12px',
    border: '1px solid #E7E7E7',
    borderRadius: '12px',
    padding: '1rem',
    boxSizing: 'border-box',
});

const ComplecatedTodoContainer = styled('div')({
    flex: 1, // 동일한 flex-grow 값을 설정하여 같은 너비를 갖도록 함
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    border: '1px solid #E7E7E7',
    borderRadius: '12px',
    padding: '1rem',
    boxSizing: 'border-box',
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

    '&:hover': {
        backgroundColor: '#C1C1C1',
        color: '#FFFFFF',
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

const TodoComponent = () => {
    const { todos, inputs, addInput, setInput, setTodos, resetInputs } = useTodoStore();
    const [showInput, setShowInput] = useState<boolean>(false);
    const [animateOut, setAnimateOut] = useState<boolean>(false);

    useEffect(() => {
        if (inputs.length < 3) {
            const additionalInputs = Array(2 - inputs.length).fill('');
            additionalInputs.forEach(() => addInput());
        }
    }, [inputs, addInput]);

    const handleInputChange = (index: number, value: string) => {
        setInput(index, value);
    };

    const saveTodos = async () => {
        const nonEmptyInputs: Array<string> = inputs.filter(input => input.trim() !== '');
        if (nonEmptyInputs.length === 0) {
            alert('할 일을 입력해주세요.');
            return;
        } else {
            alert('저장되었습니다.');
        }

        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        const { data, error } = await supabase
            .from('todos')
            .insert(nonEmptyInputs.map(content => ({
                user_id: user.id,
                content,
                is_complete: false,
                created_at: new Date().toISOString(),
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
            fetchTodos();
        }
    };

    const deleteTodo = async (id: string) => {
        const { data, error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting todo:', error);
        } else {
            console.log('할 일을 성공적으로 제거했어요.:', data);
            fetchTodos();
        }
    };

    const fetchTodos = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching todos:', error);
        } else {
            setTodos(data);
        }
    };

    const toggleTodo = async (id: string, isComplete: boolean) => {
        const { data, error } = await supabase
            .from('todos')
            .update({ is_complete: !isComplete })
            .eq('id', id);

        if (error) {
            console.error('Error updating todo:', error);
        } else {
            console.log('Todo updated successfully:', data);
            fetchTodos();
        }
    };

    const closeModal = () => {
        setAnimateOut(true); // 시작 애니메이션
        setTimeout(() => {
            setShowInput(false); // 애니메이션 완료 후 모달 닫기
            setAnimateOut(false); // 애니메이션 상태 초기화
        }, 100); // 애니메이션 시간과 맞추기
    };

    useEffect(() => {
        fetchTodos();
    }, []);


    return (
        <TodoContainer>
            <ProgressTodoContainer>
                <h2>진행 중인 일정</h2>
                {todos.filter(todo => !todo.is_complete).length === 0 ? (
                    <p>현재 진행 중인 일정이 없어요.</p>
                ) : (
                    <ul>
                        {todos.filter(todo => !todo.is_complete).map((todo) => (
                            <li key={todo.id}>
                                <input
                                    type="checkbox"
                                    checked={todo.is_complete}
                                    onChange={() => toggleTodo(todo.id, todo.is_complete)}
                                />
                                {todo.content}
                                <button onClick={() => deleteTodo(todo.id)}>삭제</button>
                            </li>
                        ))}
                    </ul>
                )}
                <AddToDoBtnContainer>
                    <AddToDoBtn onClick={() => setShowInput(!showInput)} isOpen={showInput}>
                        <img src="/add.svg" alt="Add Todo" />
                    </AddToDoBtn>
                    {(showInput || animateOut) && (
                        <ModalOverlay>
                            <ModalContent isOpen={showInput && !animateOut}>
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
                                <AddTodoBtn onClick={() => {
                                    if (inputs.length >= 20) {
                                        alert('한번에 최대 20개까지 추가할 수 있어요.');
                                    } else {
                                        addInput();
                                    }
                                }}>
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
                    <p>완료된 할 일이 없어요.</p>
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
        </TodoContainer>
    );
};

export default TodoComponent;
