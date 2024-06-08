'use client';

import { useEffect, useState } from 'react';
import { useTodoStore } from '@components/Store/useAuthTodoStore';
import { supabase } from '@components/lib/supabaseClient';

const TodoComponent = () => {
    const { todos, inputs, addInput, setInput, setTodos, resetInputs } = useTodoStore();
    const [showInput, setShowInput] = useState(false);

    const handleInputChange = (index: number, value: string) => {
        setInput(index, value);
    };

    const saveTodos = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        const { data, error } = await supabase
            .from('todos')
            .insert(inputs.map(content => ({
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
        <div>
            <h1>Todo List</h1>
            <h2>In Progress</h2>
            {todos.filter(todo => !todo.is_complete).length === 0 ? (
                <p>No todos in progress.</p>
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
            <h2>Completed</h2>
            {todos.filter(todo => todo.is_complete).length === 0 ? (
                <p>No completed todos.</p>
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
            <div>
                {!showInput && (
                    <button onClick={() => setShowInput(true)}>+</button>
                )}
                {showInput && (
                    <>
                        {inputs.map((input, index) => (
                            <div key={index}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                />
                            </div>
                        ))}
                        <button onClick={addInput}>Add Todo</button>
                        <button onClick={saveTodos}>Save Todos</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default TodoComponent;
