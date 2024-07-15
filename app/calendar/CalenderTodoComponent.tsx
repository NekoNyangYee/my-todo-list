"use client";

import React, { useState, useRef, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from '@components/lib/supabaseClient';
import styled from '@emotion/styled';
import { fetchTodosForDate, deleteTodo } from '@components/util/todoUtil';
import { Todo } from '@components/types/todo';
import { useTodoStore } from '@components/Store/useAuthTodoStore';
import moment from 'moment';
import { keyframes } from '@emotion/react';
import { useTheme } from '@components/app/Context/ThemeContext';
import AddIcon from '@components/Components/icons/Utils/AddIcon';
import DeleteIcon from '@components/Components/icons/Utils/DeleteIcon';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface User {
  id: string;
  email: string;
}

interface CalenderTodoComponentProps {
  user: User;
}

const fadeInOutModal = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const fadeOutInModal = keyframes`
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

// 스타일링 컴포넌트
const AddToDoBtn = styled.button<{ isOpen: boolean, themeStyles: any }>`
  padding: 12px;
  background-color: ${({ themeStyles }) => themeStyles.colors.buttonBackground};
  color: ${({ themeStyles }) => themeStyles.colors.buttonColor};
  border: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  gap: 8px;
  margin-left: auto;

  & img {
    width: 28px;
    height: 28px;
  }
`;

const AddToDoBtnContainer = styled.div`
  position: sticky;
  bottom: 10px;
  justify-content: flex-end;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModalOverlay = styled.div<ModalProps>`
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
  z-index: 1000;
`;

const ModalContent = styled.div<{ isOpen: boolean, isFadingOut: boolean, themeStyles: any }>`
  position: relative;
  background: ${({ themeStyles }) => themeStyles.colors.background};
  padding: 1rem 1rem 0;
  border-radius: 12px;
  max-width: 572px;
  width: 100%;
  min-height: 30vh;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid ${({ themeStyles }) => themeStyles.colors.inputBorder};
  animation: ${({ isFadingOut }) => (isFadingOut ? fadeOutInModal : fadeInOutModal)} 0.2s ease forwards;

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
  h2 {
    margin: 0;
  }
`;

const ToDoInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputField = styled.input<{ themeStyles: any }>`
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  border: none;
  outline: none;
  box-sizing: border-box;
  font-size: 1.2rem;
  background-color: ${({ themeStyles }) => themeStyles.colors.inputBackground};
  color: ${({ themeStyles }) => themeStyles.colors.text};
  border: 1px solid ${({ themeStyles }) => themeStyles.colors.inputBorder};

  &:focus {
    outline: none;
    border: 1px solid ${({ themeStyles }) => themeStyles.colors.inputBorder};
  }

  &::placeholder {
    color: ${({ themeStyles }) => themeStyles.colors.inputPlaceholderColor};
  }
`;

const AddTodoBtn = styled.button<{ themeStyles: any }>`
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 12px;
  background-color: ${({ themeStyles }) => themeStyles.colors.buttonBackground};
  color: ${({ themeStyles }) => themeStyles.colors.buttonColor};
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
    background-color: ${({ themeStyles }) => themeStyles.colors.buttonHoverBackground};
  }
`;

const TodoSaveAndCancelBtnContainer = styled.div<{ themeStyles: any }>`
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-top: 1rem;
  padding: 1rem 0;
  box-sizing: border-box;
  width: 100%;
  position: sticky;
  bottom: 0;
  background: ${({ themeStyles }) => themeStyles.colors.background};
`;

const CancelBtn = styled.button`
  padding: 12px 1.6rem;
  background-color: transparent;
  color: #aeaeae;
  font-size: 0.8rem;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  outline: none;
  transition: background-color 0.2s, color 0.2s;
  font-weight: bold;

  &:hover {
    background-color: #e7e7e7;
  }
`;

const SaveTodoBtn = styled.button<{ themeStyles: any }>`
  padding: 12px 1.6rem;
  background-color: ${({ themeStyles }) => themeStyles.colors.buttonBackground};
  color: ${({ themeStyles }) => themeStyles.colors.buttonColor};
  font-size: 0.8rem;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  outline: none;
  transition: background-color 0.2s, color 0.2s;
  font-weight: bold;

  &:hover {
    background-color: ${({ themeStyles }) => themeStyles.colors.buttonHoverBackground};
  }
`;

const Container = styled.div`
  width: 100%;
  padding-top: 8rem;
  max-width: 972px;
  margin: 0 auto;

  @media (max-width: 1224px) {
    max-width: 90%;
    flex-direction: column;
    gap: 2rem;
  }
`;

const CalendarInfoContainer = styled.div<{ themeStyles: any }>`
  display: flex;
  flex-direction: column;
  gap: 0.4em;
  margin-bottom: 2rem;

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  p {
    margin: 0;
    color: #a7a7a7;
  }
`;

const CalendarTite = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  & img {
    width: 24px;
    height: 24px;
  }
`;

const MainTodoListContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3rem;
  
  margin: 0 auto;

  & ul {
    list-style: none;
    padding: 0;
  }

  @media (max-width: 972px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const CalendarWrapper = styled.div`
  width: 100%;
  max-width: 480px; /* Fixed width */
  margin: 0 auto;
  min-height: 530px; /* 최소 높이 */
  max-height: 800px; /* 최대 높이 */
`;

const CalendarStyled = styled(Calendar) <{ themeStyles: any }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: auto;
  min-height: 400px; /* 최소 높이 */
  max-height: 600px; /* 최대 높이 */
  padding: 1rem;
  max-width: 100%;
  background: ${({ themeStyles }) => themeStyles.colors.containerBackground};
  color: ${({ themeStyles }) => themeStyles.colors.text};
  border: none;
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.125em;
  border-radius: 10px;
  box-shadow: ${({ themeStyles }) => themeStyles.colors.shadow};

  & .react-calendar__tile {
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    height: 80px;
    border-radius: 8px;
    color: ${({ themeStyles }) => themeStyles.colors.text};
    transition: background-color 0.2s, color 0.2s;

    &:hover {
      background-color: ${({ themeStyles }) => themeStyles.colors.background};
      color: ${({ themeStyles }) => themeStyles.colors.text};
    }
  }
    
  & .react-calendar__tile--hasActive {
    background: ${({ themeStyles }) => themeStyles.colors.buttonBackground};
  }

  & .react-calendar__tile--active:hover {
    background: ${({ themeStyles }) => themeStyles.colors.buttonHoverBackground};
    color: ${({ themeStyles }) => themeStyles.colors.buttonColor};
  }

  & .react-calendar__tile--active:enabled:focus {
    background: ${({ themeStyles }) => themeStyles.colors.buttonHoverBackground};
    color: ${({ themeStyles }) => themeStyles.colors.buttonColor};
  }

  & .react-calendar__tile--active {
    background-color: ${({ themeStyles }) => themeStyles.colors.buttonBackground};
    color: #FFFFFF;
    font-size: 18px;
    font-weight: bold;
    border-radius: 8px;
  }

  & .react-calendar__tile .dot {
    height: 6px;
    width: 6px;
    background-color: #4caf50;
    border-radius: 50%;
    display: inline-block;
    margin-top: 2px;
  }

  & .react-calendar__month-view__weekdays__weekday {
    font-size: 1rem;
    font-weight: bold;
  }

  & .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none;
  }

  & .react-calendar__navigation__label {
    font-size: 1rem;
    font-weight: bold;
  }

  & .react-calendar__navigation__arrow.react-calendar__navigation__prev-button,
  & .react-calendar__navigation__arrow.react-calendar__navigation__prev2-button,
  & .react-calendar__navigation__arrow.react-calendar__navigation__next-button,
  & .react-calendar__navigation__arrow.react-calendar__navigation__next2-button {
    background: ${({ themeStyles }) => themeStyles.colors.containerBackground};
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 1rem;
    color: ${({ themeStyles }) => themeStyles.colors.text};
  }

  & .react-calendar__month-view__days__day--neighboringMonth {
    color: ${({ themeStyles }) => themeStyles.colors.inputBorder};
  }
`;



const NoTodoListText = styled.p<{ themeStyles: any }>`
  text-align: center;
  color: ${({ themeStyles }) => themeStyles.colors.text};
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

const DropdownMenu = styled.div<{ isDropDownOpen: boolean, themeStyles: any }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${({ themeStyles }) => themeStyles.colors.containerBackground};
  border: 1px solid ${({ themeStyles }) => themeStyles.colors.inputBorder};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 9999;  // z-index 값을 높게 설정
  width: 150px;
  overflow: hidden;
  animation: ${({ isDropDownOpen }) => (isDropDownOpen ? fadeInDropDownModal : fadeOutDropDownModal)} 0.2s ease forwards;

  & > * {
    padding: 12px 8px;
    cursor: pointer;
    &:hover {
      background-color: ${({ themeStyles }) => themeStyles.colors.background};
    }
  }
`;

const SelectItem = styled.button<{ themeStyles: any }>`
  display: flex;
  gap: 10px;
  align-items: center;
  box-sizing: border-box;
  width: 150px;
  background-color: transparent;
  padding: 10px;
  cursor: pointer;
  border: none;
  z-index: 10;
  font-size: 1rem;
`;

const FetchItem = styled(SelectItem) <{ themeStyles: any }>`
  color: #0075ff;
`;

const DeleteItem = styled(SelectItem) <{ themeStyles: any }>`
  color: #FF4F4F;
`;


const WantSelectListText = styled.div<{ themeStyles: any }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 50vh;
  background-color: ${({ themeStyles }) => themeStyles.colors.containerBackground};
  color: ${({ themeStyles }) => themeStyles.colors.text};
  border-radius: 12px;
  box-shadow: ${({ themeStyles }) => themeStyles.colors.shadow};
  min-height: 515px;
  max-height: 800px;
`;

const NoDdayText = styled.p<{ themeStyles: any }>`
  color: ${({ themeStyles }) => themeStyles.colors.text};
`;

const DdayItem = styled.li<{ themeStyles: any }>`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
`;

const DdayCount = styled.span<{ themeStyles: any }>`

`;

interface ModalProps {
  isFadingOut: boolean;
}

const CalenderTodoComponent: React.FC<CalenderTodoComponentProps> = ({ user }) => {
  const { addInput, inputs, setInputs, resetInputs, removeInput } = useTodoStore();
  const [value, onChange] = useState<Value>(new Date());
  const [showInput, setShowInput] = useState<boolean>(false);
  const [todoInputs, setTodoInputs] = useState<string[]>(['']);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [datesWithTodos, setDatesWithTodos] = useState<Set<string>>(new Set());
  const [showTodoModal, setShowTodoModal] = useState<boolean>(false);
  const [showAddTodoModal, setShowAddTodoModal] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isDday, setIsDday] = useState<boolean[]>([]);
  const [ddayTodos, setDdayTodos] = useState<Todo[]>([]);
  const [saveTodos, setSaveTodos] = useState<boolean>(false);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { themeStyles } = useTheme();

  useEffect(() => {
    if (inputs.length < 3) {
      const additionalInputs = Array(3 - inputs.length).fill('');
      additionalInputs.forEach(() => addInput());
    }
    setIsDday(inputs.map((_, index) => isDday[index] || false)); // Reset D-day state based on input length
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

  useEffect(() => {
    const fetchAllTodos = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching todos:', error);
        } else {
          const dates = new Set(data.map((todo: Todo) => todo.date));
          setDatesWithTodos(dates);
        }
      }
    };

    fetchAllTodos();
  }, [user]);

  const handleInputChange = (index: number, value: string) => {
    setInputs(index, value);
    if (isDday.length < inputs.length) {
      setIsDday(prevIsDday => {
        const newIsDday = [...prevIsDday];
        newIsDday[index] = newIsDday[index] || false; // 기존 값 유지
        return newIsDday;
      });
    }
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

      setInputs(inputs.length, '');
      setIsDday(prevIsDday => [...prevIsDday, false]);
    }
  };


  const closeModal = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setShowInput(false);
      setIsFadingOut(false);
      resetInputs();
      setShowAddTodoModal(false);
      setShowTodoModal(false);
    }, 100); // 애니메이션 시간에 맞추어 설정
  };

  const saveTodosHandler = async () => {
    if (!selectedDate || !user) {
      console.log('selectedDate or user is not defined');
      return;
    }

    // 입력 필드가 빈 값이 아닌 경우에만 필터링합니다.
    const nonEmptyInputs = inputs.filter((input) => input.trim() !== '');
    const filteredIsDday = inputs.map((input, index) => input.trim() !== '' ? isDday[index] : null).filter(item => item !== null);

    if (nonEmptyInputs.length === 0) {
      alert('할 일을 입력해주세요.');
      return;
    }

    const koreanDate = new Date(selectedDate.getTime() + (9 * 60 * 60 * 1000));
    const koreanDateString = koreanDate.toISOString().split('T')[0];

    console.log('nonEmptyInputs:', nonEmptyInputs);
    console.log('filteredIsDday:', filteredIsDday);

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert(nonEmptyInputs.map((content, index) => ({
          user_id: user.id,
          content: content.trim(),
          is_complete: false,
          is_priority: false,
          created_at: new Date().toISOString(),
          date: koreanDateString,
          is_dday: filteredIsDday[index], // 각 입력 필드의 D-day 여부 추가
        })));

      if (error) {
        console.error('Error saving todos:', error);
      } else {
        console.log('Todos saved successfully:', data);
        resetInputs();
        setTimeout(() => {
          setShowAddTodoModal(false); // 할 일 추가 모달 닫기
        }, 100);
        alert('저장되었습니다'); // 저장 알림 표시

        // Update datesWithTodos state
        setDatesWithTodos(prev => new Set(prev).add(koreanDateString));

        await fetchTodosForDate(user.id, selectedDate, setTodos);
        setShowTodoModal(true); // 일정 모달 다시 열기
        await fetchDdayTodos(); // D-day 할 일들을 다시 가져옴
      }
    } catch (e) {
      console.error('Unexpected error:', e);
    }
  };



  const handleDateClick = async (value: Date | Date[]) => {
    let selected;
    if (Array.isArray(value)) {
      selected = new Date(value[0].getTime() + (9 * 60 * 60 * 1000));
    } else {
      selected = new Date(value.getTime() + (9 * 60 * 60 * 1000));
    }

    setSelectedDate(selected);

    const koreanDateString = selected.toISOString().split('T')[0];
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

    setShowInput(true);
    setShowTodoModal(true);
  };

  const handleDotMenuClick = (todoId: string) => {
    setShowDropdown(prev => (prev === todoId ? null : todoId));
  };

  const handleAddTodoClick = () => {
    setIsFadingOut(true);
    setShowTodoModal(false);
    setShowAddTodoModal(true);
    setIsFadingOut(false);
  };

  const handleOverlayClick = () => {
    if (showAddTodoModal) {
      handleCancelAddTodo();
    } else {
      closeModal();
    }
  };

  const handleCancelAddTodo = () => {
    setIsFadingOut(true);
    setShowAddTodoModal(false);
    setShowTodoModal(true);
    setIsFadingOut(false);
    resetInputs();
  };


  const deleteTodoHandler = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      alert('삭제되었습니다.');
      if (user && selectedDate) {
        await supabase
          .from('todos')
          .delete()
          .eq('id', id);

        const koreanDateString = selectedDate.toISOString().split('T')[0];
        const { data: remainingTodos, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', koreanDateString);

        if (error) {
          console.error('Error fetching remaining todos:', error);
        } else {
          setTodos(remainingTodos);
          if (remainingTodos.length === 0) {
            setDatesWithTodos(prev => {
              const updatedDates = new Set(prev);
              updatedDates.delete(koreanDateString);
              return updatedDates;
            });
          }
        }
      }
    }
  };

  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      if (datesWithTodos.has(formattedDate)) {
        return <div className="dot"></div>;
      } else {
        return null;
      }
    }
    return null;
  };

  const fetchTodoToToday = async (todoId: string) => {
    if (!user || !selectedDate) return;

    const today = new Date();
    const koreanToday = new Date(today.getTime() + (9 * 60 * 60 * 1000)); // 한국 시간으로 변경
    const koreanTodayString = koreanToday.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('todos')
      .update({ date: koreanTodayString })
      .eq('id', todoId);

    if (error) {
      console.error('Error updating todo date:', error);
    } else {
      console.log('Todo date updated successfully', data);
      fetchTodosForDate(user.id, selectedDate, setTodos);
    }
  };

  const isToday = (date: string) => {
    const today = moment().startOf('day');
    const selected = moment(date).startOf('day');
    return today.isSame(selected);
  };

  const handleKeyPress = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (index < inputs.length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        handleAddInput();
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 100);
      }
    } else if (event.key === 'Backspace' && inputs[index] === '') {
      if (inputs.length > 3) {
        removeInput(index);
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      }
    }
  };

  const sortTodos = (todos: any[]) => {
    return todos.sort((a, b) => a.original_order - b.original_order);
  };

  const completedTodos = sortTodos(todos);

  const isWithinRange = (date: Date): boolean => {
    const today = new Date();
    const hundredYearsLater = new Date(today.getFullYear() + 100, today.getMonth(), today.getDate());
    return date <= hundredYearsLater;
  };

  const fetchDdayTodos = async () => {
    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 오늘 날짜의 시간을 00:00:00으로 설정
  
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dday', true);
  
      if (error) {
        console.error('Error fetching D-day todos:', error);
      } else {
        console.log("Fetched D-day todos:", data); // 결과를 콘솔에 출력하여 확인
        const filteredDdayTodos = data.filter((todo: Todo) => {
          const todoDate = new Date(todo.date);
          return isWithinRange(todoDate);
        });
        console.log("Filtered D-day todos:", filteredDdayTodos); // 필터링 결과를 콘솔에 출력하여 확인
        setDdayTodos(filteredDdayTodos);
      }
    }
  };

  useEffect(() => {
    fetchDdayTodos();
  }, [user]); // todos 상태가 변경될 때마다 D-day 할 일들을 다시 가져옴

  const handleDdayChange = (index: number, value: boolean) => {
    setIsDday(prevIsDday => {
      const newIsDday = [...prevIsDday];
      newIsDday[index] = value;
      console.log(`newIsDday:`, newIsDday);
      return newIsDday;
    });
    console.log(`Checkbox at index ${index} changed to ${value}`);
  };


  return (
    <Container>
      <CalendarInfoContainer themeStyles={themeStyles}>
        <CalendarTite>
          <img src="/calendar.svg" alt="Calendar" />
          <h1>캘린더 / 디데이</h1>
        </CalendarTite>
        <p>원하는 날짜를 선택하면 해당 날짜의 일정을 확인하거나 추가, 디데이 설정도 가능해요.</p>
      </CalendarInfoContainer>
      <MainTodoListContainer>
        <CalendarWrapper>
          <CalendarStyled
            onClickDay={handleDateClick}
            value={value}
            formatDay={(locale, date) => moment(date).format("DD")}
            tileContent={tileContent}
            themeStyles={themeStyles}
          />
        </CalendarWrapper>
        {selectedDate && (showTodoModal || showAddTodoModal) && (
          <ModalOverlay
            onClick={handleOverlayClick}
            isFadingOut={isFadingOut}
          >
            <ModalContent
              isOpen={showTodoModal || showAddTodoModal}
              isFadingOut={isFadingOut}
              ref={modalContentRef}
              onClick={(e) => e.stopPropagation()}
              themeStyles={themeStyles}
            >
              {showTodoModal ? (
                <>
                  <ModalTitleContainer>
                    <h2>
                      {selectedDate.toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h2>
                  </ModalTitleContainer>
                  {todos.length === 0 ? (
                    <NoTodoListText themeStyles={themeStyles}>현재 진행 중인 일정이 없어요.</NoTodoListText>
                  ) : (
                    <ul>
                      {completedTodos.map((todo) => (
                        <TodoListContentContainer key={todo.id}>
                          <li>{todo.content}</li>
                          <DotMenuBtnWrapper>
                            <DotMenuBtn onClick={() => handleDotMenuClick(todo.id)} isDropDownOpen={showDropdown === todo.id}>
                              <img src="/dot-menu.svg" alt="Dot Menu" />
                            </DotMenuBtn>
                            {showDropdown === todo.id && (
                              <DropdownMenu ref={dropdownRef} isDropDownOpen={!!showDropdown} themeStyles={themeStyles}>
                                {!isToday(todo.date) && (
                                  <FetchItem onClick={() => fetchTodoToToday(todo.id)} themeStyles={themeStyles}>
                                    끌어오기
                                  </FetchItem>
                                )}
                                <DeleteItem onClick={() => deleteTodoHandler(todo.id)} themeStyles={themeStyles}>
                                  <DeleteIcon />
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
                    <AddToDoBtn onClick={handleAddTodoClick} isOpen={showInput} themeStyles={themeStyles}>
                      <AddIcon />
                    </AddToDoBtn>
                  </AddToDoBtnContainer>
                </>
              ) : (
                <>
                  <ModalTitleContainer>
                    <h2>할 일 추가</h2>
                    <p>오늘 해야 할 일을 추가해 보세요.<br />한번에 최대 20개까지 추가 가능해요.</p>
                  </ModalTitleContainer>
                  <ToDoInputContainer>
                    {inputs.map((input, index) => (
                      <div key={index}>
                        <InputField
                          ref={el => {
                            inputRefs.current[index] = el;
                          }}
                          type="text"
                          value={input}
                          placeholder='할 일을 입력해주세요.'
                          onChange={(e) => handleInputChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyPress(index, e)}
                          themeStyles={themeStyles}
                        />
                        <label>
                          D-day
                          <input
                            type="checkbox"
                            checked={isDday[index] || false} // 상태가 null/undefined일 경우 대비
                            onChange={(e) => handleDdayChange(index, e.target.checked)}
                          />
                        </label>
                      </div>
                    ))}
                  </ToDoInputContainer>
                  <AddTodoBtn onClick={handleAddInput} themeStyles={themeStyles} >
                    <AddIcon />
                    <p>할 일 항목 추가</p>
                  </AddTodoBtn>
                  <TodoSaveAndCancelBtnContainer themeStyles={themeStyles}>
                    <CancelBtn onClick={handleCancelAddTodo}>돌아가기</CancelBtn>
                    <SaveTodoBtn onClick={saveTodosHandler} themeStyles={themeStyles}>저장</SaveTodoBtn>
                  </TodoSaveAndCancelBtnContainer>
                </>
              )}
            </ModalContent>
          </ModalOverlay>
        )}
        <WantSelectListText themeStyles={themeStyles}>
          <h2>D-day</h2>
          {ddayTodos.length === 0 ? (
            <NoDdayText themeStyles={themeStyles}>D-day 일정이 없습니다.</NoDdayText>
          ) : (
            <ul>
              {ddayTodos.map((todo) => {
                const todoDate = new Date(todo.date);
                const today = new Date();
                const diffDays = Math.ceil((todoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const dDayLabel = diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;

                return (
                  <DdayItem key={todo.id} themeStyles={themeStyles}>
                    <span>{todo.content}</span>
                    <DdayCount themeStyles={themeStyles}>{dDayLabel}</DdayCount>
                  </DdayItem>
                );
              })}
            </ul>
          )}
        </WantSelectListText>
      </MainTodoListContainer>
    </Container>
  );
};

export default CalenderTodoComponent;
