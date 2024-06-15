"use client";

import React, { useState, useRef, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from '@components/lib/supabaseClient';
import styled from '@emotion/styled';
import { fetchTodosForDate, saveTodos, deleteTodo, toggleTodo, togglePriority } from '@components/util/todoUtil';
import { Todo } from '@components/types/todo';
import { useTodoStore } from '@components/Store/useAuthTodoStore';
import moment from 'moment';
import '/style.css'

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface User {
    id: string;
    email: string;
}

interface CalenderTodoComponentProps {
    user: User;
}

const AddToDoBtnContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const AddToDoBtn = styled.button<{ isOpen: boolean }>`
  background-color: #0070f3;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #005bb5;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div<{ isOpen: boolean }>`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 100%;
`;

const ModalTitleContainer = styled.div`
  margin-bottom: 20px;
  h2 {
    margin: 0;
  }
`;

const ToDoInputContainer = styled.div`
  margin-bottom: 20px;
`;

const InputField = styled.input`
  width: calc(100% - 20px);
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const AddTodoBtn = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 10px;
  &:hover {
    background-color: #218838;
  }
`;

const TodoSaveAndCancelBtnContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CancelBtn = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: #dc3545;
  color: white;
  &:hover {
    background-color: #c82333;
  }
`;

const SaveTodoBtn = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: #0070f3;
  color: white;
  &:hover {
    background-color: #005bb5;
  }
`;

const MainTodoListContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 972px;
  margin: 0 auto;
  padding: 2rem 0;

  & ul {
    list-style: none;
    padding: 0;
  }

  @media (max-width: 1224px) {
    max-width: 90%;
    flex-direction: column;
    gap: 2rem;
}
`;

const TodoContainer = styled.div`
  width: 100%;
  margin: 20px 0;
`;

const ProgressTodoContainer = styled.div`
  margin-bottom: 20px;
`;

const NoTodoListText = styled.p`
  text-align: center;
  color: #777;
`;

const ImportantTodoContainer = styled.div`
  margin-bottom: 20px;
`;

const TodoListContentContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;

  & img {
    width: 24px;
    height: 24px;
  }
`;

const PriorityButton = styled.button<{ isPriority: boolean }>`
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

const DotMenuBtnWrapper = styled.div`
  position: relative;
`;

const DotMenuBtn = styled.button<{ isDropDownOpen: boolean }>`
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

const DropdownMenu = styled.div<{ isDropDownOpen: boolean }>`
  position: absolute;
  right: 0;
  top: 30px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  display: ${(props) => (props.isDropDownOpen ? 'block' : 'none')};
`;

const CompleteItem = styled.div`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const DeleteItem = styled.div`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const ComplecatedTodoContainer = styled.div`
  margin-bottom: 20px;
`;

const CompleteInfoContainer = styled.div`
  display: flex;
  align-items: center;
  color: #777;
`;

const CalenderTodoComponent: React.FC<CalenderTodoComponentProps> = ({ user }) => {
    const { addInput, inputs } = useTodoStore();
    const [value, onChange] = useState<Value>(new Date());
    const [showInput, setShowInput] = useState<boolean>(false);
    const [todoInputs, setTodoInputs] = useState<string[]>(['']);
    const [animateOut, setAnimateOut] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [showDropdown, setShowDropdown] = useState<string | null>(null);
    const modalContentRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (inputs.length < 3) {
            const additionalInputs = Array(3 - inputs.length).fill('');
            additionalInputs.forEach(() => addInput());
        }
    }, [inputs, addInput, todoInputs]);

    useEffect(() => {
        if (modalContentRef.current) {
            modalContentRef.current.scrollTop = modalContentRef.current.scrollHeight;
        }
    }, [inputs]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(null);
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
        const fetchData = async () => {
            if (user && selectedDate) {
                const koreanDateString = selectedDate.toISOString().split('T')[0];
                const { data, error } = await supabase
                    .from('todos')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('date', koreanDateString);

                if (error) {
                    console.error('Error fetching todos:', error);
                } else {
                    setTodos(data);
                }
            }
        };

        fetchData();
    }, [user, selectedDate]);

    const handleInputChange = (index: number, value: string) => {
        const newInputs = [...inputs];
        newInputs[index] = value;
        setTodoInputs(newInputs);
    };

    const handleAddInput = () => {
        setTodoInputs([...inputs, '']);
    };

    const resetInputs = () => {
        setTodoInputs(['']);
    };

    const closeModal = () => {
        setAnimateOut(true);
        setTimeout(() => {
            setShowInput(false);
            setAnimateOut(false);
            resetInputs();
        }, 100);
    };

    const saveTodosHandler = async () => {
        if (!selectedDate || !user) {
            return;
        }

        const nonEmptyInputs = inputs.filter(input => input.trim() !== '');
        if (nonEmptyInputs.length === 0) {
            alert('할 일을 입력해주세요.');
            return;
        }

        const koreanDate = new Date(selectedDate.getTime() + (9 * 60 * 60 * 1000));
        const koreanDateString = koreanDate.toISOString().split('T')[0];

        console.log('Saving todos for date:', koreanDateString);  // Debugging log

        const { data, error } = await supabase
            .from('todos')
            .insert(nonEmptyInputs.map((content) => ({
                user_id: user.id,
                content,
                is_complete: false,
                is_priority: false,
                created_at: new Date().toISOString(),
                date: koreanDateString,
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
            await fetchTodosForDate(user.id, selectedDate, setTodos); // 새로 추가된 할 일을 다시 가져옴
        }
    };

    const handleDateClick = (value: Date | Date[]) => {
        let selected;
        if (Array.isArray(value)) {
            selected = new Date(value[0].getTime() + (9 * 60 * 60 * 1000));
        } else {
            selected = new Date(value.getTime() + (9 * 60 * 60 * 1000));
        }
        setSelectedDate(selected);
        setShowInput(false);
    };

    const handleDotMenuClick = (todoId: string) => {
        setShowDropdown(prev => (prev === todoId ? null : todoId));
    };

    const deleteTodoHandler = async (id: string) => {
        if (user && selectedDate) {
            await deleteTodo(user.id, id, setTodos, selectedDate);
        }
    };

    const toggleTodoHandler = async (id: string, isComplete: boolean) => {
        if (user && selectedDate) {
            await toggleTodo(user.id, id, isComplete, setTodos, selectedDate);
        }
    };

    const togglePriorityHandler = async (id: string, isPriority: boolean) => {
        if (user && selectedDate) {
            await togglePriority(user.id, id, isPriority, setTodos, selectedDate);
        }
    };

    const importantTodos = todos.filter(todo => todo.is_priority && !todo.is_complete);
    const nonImportantTodos = todos.filter(todo => !todo.is_priority && !todo.is_complete);

    return (
        <MainTodoListContainer>
            <Calendar onClickDay={handleDateClick} value={value} formatDay={(locale, date) => moment(date).format("DD")} />
            {selectedDate && (
                <TodoContainer>
                    <ProgressTodoContainer>
                        <h2>진행 중인 일정 - {selectedDate.toDateString()}</h2>
                        {todos.filter(todo => !todo.is_complete).length === 0 ? (
                            <NoTodoListText>현재 진행 중인 일정이 없어요.</NoTodoListText>
                        ) : (
                            <ul>
                                {importantTodos.length > 0 && (
                                    <ImportantTodoContainer>
                                        {importantTodos.map((todo) => (
                                            <TodoListContentContainer key={todo.id}>
                                                <li>
                                                    {todo.content}
                                                </li>
                                                <DotMenuBtnWrapper>
                                                    <DotMenuBtn onClick={() => handleDotMenuClick(todo.id)} isDropDownOpen={showDropdown === todo.id}>
                                                        <img src="/dot-menu.svg" alt="Dot Menu" />
                                                    </DotMenuBtn>
                                                    {showDropdown === todo.id && (
                                                        <DropdownMenu ref={dropdownRef} isDropDownOpen={!!showDropdown}>
                                                            <CompleteItem onClick={() => toggleTodoHandler(todo.id, todo.is_complete)}>
                                                                <img src="/check.svg" alt="Check" />
                                                                일정 완료
                                                            </CompleteItem>
                                                            <DeleteItem onClick={() => deleteTodoHandler(todo.id)}>
                                                                <img src="/delete.svg" alt="Delete" />
                                                                삭제
                                                            </DeleteItem>
                                                        </DropdownMenu>
                                                    )}
                                                </DotMenuBtnWrapper>
                                            </TodoListContentContainer>
                                        ))}
                                    </ImportantTodoContainer>
                                )}
                                {nonImportantTodos.map((todo) => (
                                    <TodoListContentContainer key={todo.id}>
                                        <li>
                                            {todo.content}
                                        </li>
                                        <DotMenuBtnWrapper>
                                            <DotMenuBtn onClick={() => handleDotMenuClick(todo.id)} isDropDownOpen={showDropdown === todo.id}>
                                                <img src="/dot-menu.svg" alt="Dot Menu" />
                                            </DotMenuBtn>
                                            {showDropdown === todo.id && (
                                                <DropdownMenu ref={dropdownRef} isDropDownOpen={!!showDropdown}>
                                                    <CompleteItem onClick={() => { toggleTodoHandler(todo.id, todo.is_complete); setShowDropdown(null); }}>
                                                        <img src="/check.svg" alt="Check" />
                                                        일정 완료
                                                    </CompleteItem>
                                                    <DeleteItem onClick={() => deleteTodoHandler(todo.id)}>
                                                        <img src="/delete.svg" alt="Delete" />
                                                        삭제
                                                    </DeleteItem>
                                                </DropdownMenu>
                                            )}
                                        </DotMenuBtnWrapper>
                                    </TodoListContentContainer>
                                ))}
                            </ul>
                        )}
                    </ProgressTodoContainer>

                    <AddToDoBtnContainer>
                        <AddToDoBtn onClick={() => setShowInput(!showInput)} isOpen={showInput}>
                            <img src="/add.svg" alt="Add Todo" />
                        </AddToDoBtn>
                        {(showInput || animateOut) && (
                            <ModalOverlay>
                                <ModalContent isOpen={showInput && !animateOut} ref={modalContentRef}>
                                    <ModalTitleContainer>
                                        <h2>할 일 추가 - {selectedDate?.toDateString()}</h2>
                                        <p>선택한 날짜의 할 일을 추가해 보세요.<br />한번에 최대 20개까지 추가 가능해요.</p>
                                    </ModalTitleContainer>
                                    <ToDoInputContainer>
                                        {inputs.map((input, index) => (
                                            <div key={index}>
                                                <InputField
                                                    type="text"
                                                    value={input}
                                                    placeholder='할 일을 입력해주세요.'
                                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </ToDoInputContainer>
                                    <AddTodoBtn onClick={handleAddInput}>
                                        할 일 항목 추가
                                    </AddTodoBtn>
                                    <TodoSaveAndCancelBtnContainer>
                                        <CancelBtn onClick={closeModal}>취소</CancelBtn>
                                        <SaveTodoBtn onClick={saveTodosHandler}>저장</SaveTodoBtn>
                                    </TodoSaveAndCancelBtnContainer>
                                </ModalContent>
                            </ModalOverlay>
                        )}
                    </AddToDoBtnContainer>
                </TodoContainer>
            )}
        </MainTodoListContainer>
    );
};

export default CalenderTodoComponent;