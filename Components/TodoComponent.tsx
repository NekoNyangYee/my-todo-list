'use client';

import { useEffect, useState } from 'react';
import { useTodoStore } from '../Store/useAuthTodoStore';
import { supabase } from '../lib/supabaseClient';
import { styled, keyframes } from '@pigment-css/react';

const TodoContainer = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    width: '100%',
    maxWidth: '972px',
    margin: '0 auto',
    padding: '12px',

    "& ul": {
        padding: 0,
        margin: 0,
    },

    "& li": {
        listStyle: 'none',
    },

    '@media (max-width: 1224px)': {
        maxWidth: '90%',
        flexDirection: 'column',
    }
});

const ProgressTodoContainer = styled('div')({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
});

const ComplecatedTodoContainer = styled('div')({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',

    '& img': {
        width: '28px',
        height: '28px',
        animation: (props) => props.isOpen ? `${rotateAdd} 0.1s ease forwards` : `${rotateCancel} 0.1s ease forwards`,
    },
});


const TodoComponent = () => {
    const { todos, inputs, addInput, setInput, setTodos, resetInputs } = useTodoStore();
    const [showInput, setShowInput] = useState<boolean>(false);

    const handleInputChange = (index: number, value: string) => {
        setInput(index, value);
    };

    const saveTodos = async () => {
        alert('저장되었습니다.')
        const nonEmptyInputs: Array<string> = inputs.filter(input => input.trim() !== '');
        if (nonEmptyInputs.length === 0) {
            alert('할 일을 입력해주세요.');
            return;
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
            resetInputs(); // Reset inputs after saving
            setShowInput(false); // Hide input after saving
            fetchTodos(); // Refresh the todo list
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
            fetchTodos(); // Refresh the todo list
        }
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
                            </li>
                        ))}
                    </ul>
                )}
                <div>
                    <AddToDoBtn onClick={() => setShowInput(!showInput)} isOpen={showInput}>
                        <img src="/add.svg" alt="Add Todo" />
                    </AddToDoBtn>
                    {showInput && (
                        <>
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
                            <button onClick={addInput}>일정 추가</button>
                            <button onClick={saveTodos}>저장</button>
                        </>
                    )}
                </div>
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
