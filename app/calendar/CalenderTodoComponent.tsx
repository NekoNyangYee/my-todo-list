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
import { keyframes } from '@emotion/react';
import css from 'styled-jsx/css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface User {
    id: string;
    email: string;
}

interface CalenderTodoComponentProps {
    user: User;
}

const rotateAdd = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(135deg);
  }
`;

const rotateCancel = keyframes`
  from {
    transform: rotate(135deg);
  }
  to {
    transform: rotate(0deg);
  }
`;

const fadeInModal = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const fadeOutModal = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
`;

const fadeInDropDownModal = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const fadeOutDropDownModal = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
`;

const AddToDoBtn = styled.button<{ isOpen: boolean }>`
  padding: 12px;
  background-color: #0075ff;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  gap: 8px;
  margin-left: auto;

  & img {
    width: 28px;
    height: 28px;
    animation: ${({ isOpen }) => (isOpen ? rotateAdd : rotateCancel)} 0.1s ease forwards;
  }
`;

const AddToDoBtnContainer = styled.div`
  position: sticky;
  bottom: 0;
  justify-content: flex-end;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div<{ isOpen: boolean }>`
  position: relative;
  background: #f6f8fc;
  padding: 1rem 1rem 0;
  border-radius: 12px;
  max-width: 572px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  animation: ${({ isOpen }) => (isOpen ? fadeInModal : fadeOutModal)} 0.2s ease forwards;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #a9a9a9;
    border-radius: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  @media (max-width: 1224px) {
    max-width: 80%;
  }
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
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 12px;
  background-color: #0075ff;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  outline: none;
  transition: background-color 0.2s;
  margin: 1rem 0;

  & img {
    width: 20px;
    height: 20px;
  }

  & p {
    margin: auto 0;
  }

  &:hover {
    background-color: #0055cc;
  }
`;

const TodoSaveAndCancelBtnContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 1rem;
  padding: 1rem 0;
  box-sizing: border-box;
  width: 100%;
  position: sticky;
  bottom: 0;
  background: #f6f8fc;
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
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  width: 100%;
  height: 100vh;
  max-width: 972px;
  margin: 0 auto;

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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: calc(100vh - 40px); /* Fixed height */
  padding: 1rem;
  background-color: #FFFFFF;
  border-radius: 12px;
  width: 100%;
  box-sizing: border-box;
`;

const ProgressTodoContainer = styled.div`
  height: 50vh;
  flex: 1;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  border-radius: 12px;
  padding: 1rem;
  box-sizing: border-box;
  background-color: #ffffff;
  overflow-y: auto;

  & h2 {
    margin: 0;
    color: #333333;
    font-size: 1.5rem;
  }

  & ul {
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  & li {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: auto 0;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e1e1e1;
    border-radius: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  @media (max-width: 1224px) {
    max-width: 100%;
    flex: 1;
  }
`;
const CalendarWrapper = styled.div`
  width: 100%;
  max-width: 480px; /* Fixed width */
  margin: 0 auto;
`;

const CalendarStyled = styled(Calendar)`
  width: 100%;
  height: auto;
  max-height: calc(100vh - 40px); /* Fixed height */
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

    & img {
        width: 24px;
        height: 24px;
    }
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
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e7e7e7;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 150px;
  animation: ${({ isDropDownOpen }) => (isDropDownOpen ? fadeInDropDownModal : fadeOutDropDownModal)} 0.2s ease forwards;
  z-index: 1;

  & > * {
    padding: 12px 8px;
    cursor: pointer;
    &:hover {
      background-color: #f5f5f5;
    }
  }
`;

const CompleteItem = styled.div`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const DeleteItem = styled.button`
    display: flex;
    gap: 10px;
    align-items: center;
    box-sizing: border-box;
    width: 150px;
    background-color: #FFFFFF;
    padding: 10px;
    cursor: pointer;
    border: none;
    border-radius: 8px;
    z-index: 10;

    &:hover {
        background-color: #f0f0f0;
    }
`;

const WantSelectListText = styled.div`
    width: 50%;
    height: 50%;
    text-align: center;
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
            <CalendarWrapper>
                <CalendarStyled onClickDay={handleDateClick} value={value} formatDay={(locale, date) => moment(date).format("DD")} />
            </CalendarWrapper>
            {selectedDate ? (
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
                                                <li>{todo.content}</li>
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
                                        <li>{todo.content}</li>
                                        <DotMenuBtnWrapper>
                                            <DotMenuBtn onClick={() => handleDotMenuClick(todo.id)} isDropDownOpen={showDropdown === todo.id}>
                                                <img src="/dot-menu.svg" alt="Dot Menu" />
                                            </DotMenuBtn>
                                            {showDropdown === todo.id && (
                                                <DropdownMenu ref={dropdownRef} isDropDownOpen={!!showDropdown}>
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
                        <AddToDoBtnContainer>
                            <AddToDoBtn onClick={() => setShowInput(!showInput)} isOpen={showInput}>
                                <img src="/add.svg" alt="Add Todo" />
                            </AddToDoBtn>
                        </AddToDoBtnContainer>
                    </ProgressTodoContainer>
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
                                    <img src="/add.svg" alt="Add Todo" />
                                    <p>할 일 항목 추가</p>
                                </AddTodoBtn>
                                <TodoSaveAndCancelBtnContainer>
                                    <CancelBtn onClick={closeModal}>취소</CancelBtn>
                                    <SaveTodoBtn onClick={saveTodosHandler}>저장</SaveTodoBtn>
                                </TodoSaveAndCancelBtnContainer>
                            </ModalContent>
                        </ModalOverlay>
                    )}
                </TodoContainer>
            ) : (
                <WantSelectListText>원하는 날짜를 선택해 주세요.</WantSelectListText>
            )}
        </MainTodoListContainer>
    );
};

export default CalenderTodoComponent;
