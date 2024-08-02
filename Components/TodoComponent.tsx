'use client';

import { css, keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { useTodoStore } from "../Store/useAuthTodoStore";
import { fetchTodosForDate, deleteTodo, toggleTodo, togglePriority, saveTodos, fetchDdayTodos, updateTodo } from "@components/util/todoUtil";
import { ThemeProvider, useTheme } from "@components/app/Context/ThemeContext";
import PriorityIcon from "./icons/Priority/PriorityIcon";
import DeleteIcon from "./icons/Utils/DeleteIcon";
import AddIcon from "./icons/Utils/AddIcon";
import CheckIcon from "./icons/Utils/CheckIcon";
import CheckDdayIcon from "./icons/Utils/CheckDdayIcon";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Todo } from "@components/types/todo";
import EditIcon from "./icons/Utils/EditIcon";

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

const MainTodoListContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 6rem 0;
  width: 100%;
  max-width: 972px;
  margin: 0 auto;

  @media (max-width: 1224px) {
    max-width: 90%;
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100vh;

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
`;

const TodoContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  width: 100%;
  max-width: 972px;
  margin: 0 auto;

  & ul {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    line-height: 1.5;
    word-break: break-all;
    white-space: normal;
  }

 & li {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: auto 0;
    font-size: 1.2rem;
    padding: 0.5rem 0; /* 각 항목의 상하 여백 설정 */
  }

  @media (max-width: 768px) {
    max-width: 100%;
    height: 100%; // 화면 전체 높이를 기준으로 설정
    flex-direction: column;
    gap: 2rem;
  }
`;

const commonContainerStyles = (themeStyles: any = {}) => css`
  flex: 1;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  border-radius: 12px;
  padding: 1rem;
  box-sizing: border-box;
  background-color: ${themeStyles.colors.containerBackground};
  overflow-y: auto;
  box-shadow: ${themeStyles.colors.shadow};

  & h2 {
    margin: 0;
    color: ${themeStyles.colors.text};
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

const ProgressTodoContainer = styled.div<{ themeStyles?: any }>`
  ${({ themeStyles }) => commonContainerStyles(themeStyles)}
  height: 500px; /* 고정된 높이 설정 */
  min-height: 500px; /* 최소 높이 설정 */
  max-height: 500px; /* 최대 높이 설정 */
`;

const ComplecatedTodoContainer = styled.div<{ themeStyles?: any }>`
  ${({ themeStyles }) => commonContainerStyles(themeStyles)}
  height: 500px; /* 고정된 높이 설정 */
  min-height: 500px; /* 최소 높이 설정 */
  max-height: 500px; /* 최대 높이 설정 */
`;

const CompleteInfoContainer = styled.div`
  display: flex;
  gap: 12px;
  color: #7e7cde;
  font-size: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f3f4ff;

  & img {
    width: 24px;
    height: 24px;
    margin: auto 0;
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
  z-index: 1000;
`;

const ModalContent = styled.div<{ isOpen: boolean, themeStyles: any }>`
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

const ToDoInputContainer = styled.div<{ themeStyles: any }>`
  display: flex;
  flex-direction: column;
  gap: 12px;

  & input {
    width: 100%;
    padding: 1rem;
    border-radius: 8px;
    border: none;
    outline: none;
    box-sizing: border-box;
    font-size: 1.2rem;
    background-color: ${({ themeStyles }) => themeStyles.colors.inputBackground};
    border: 1px solid ${({ themeStyles }) => themeStyles.colors.inputBorder};

    &:focus {
      outline: none;
      border: 1px solid #e7e7e7;
    }
  }
`;

const TodoSaveAndCancelBtnContainer = styled.div<{ themeStyles: any }>`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 1rem;
  padding: 1rem 0;
  box-sizing: border-box;
  width: 100%;
  position: sticky;
  bottom: 0;
  background: ${({ themeStyles }) => themeStyles.colors.background};
`;

const CancelBtn = styled.button<{ themeStyles: any }>`
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
    background-color: ${({ themeStyles }) => themeStyles.colors.inputBackground};
  }
`;

const SaveTodoBtn = styled.button`
  padding: 12px 1.6rem;
  background-color: #0075ff;
  color: #ffffff;
  font-size: 0.8rem;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  outline: none;
  transition: background-color 0.2s, color 0.2s;
  font-weight: bold;

  &:hover {
    background-color: #0055cc;
  }
`;

const ModalTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1rem;

  & h2, & p {
    margin: 0;
  }

  & p {
    color: #6a6a6a;
    font-size: 0.9rem;
  }
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

const TodoListContentContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
  position: relative;
  word-break: break-all;
  white-space: normal;
`;

const TodoList = styled.li`
  display: flex;
  align-items: center;
  height: 40px;
  gap: 8px;
  margin: auto 0;
  font-size: 1.2rem;
`;

const NoTodoListText = styled.p`
  color: #a7a7a7;
  font-size: 1rem;
  margin: auto;
  text-align: center;
`;

const PriorityButton = styled.button<{ isPriority: boolean }>`
  padding: 8px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  width: 40px;
  height: 40px;

  & svg {
    width: 24px;
    height: 24px;
    fill: ${({ isPriority }) => (isPriority ? '#F9E000' : '#C8C8C8')};
  }
`;

const ImportantTodoContainer = styled.div`
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 4px dotted #e7e7e7;
`;

const DotMenuBtnWrapper = styled.div`
  position: relative;
  display: inline-block;

  & button {
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  & img {
    width: 24px;
    height: 24px;
  }
`;

const DotMenuBtn = styled.button<{ isDropDownOpen: boolean, themeStyles: any }>`
  width: 40px;
  height: 40px;
  border: none;
  cursor: pointer;
  background-color: ${({ isDropDownOpen, themeStyles }) => isDropDownOpen ? themeStyles.colors.inputBorder : 'transparent'};
  border-radius: 50%;
`;

const DropdownMenu = styled.div<{ isDropDownOpen: boolean, themeStyles: any, index: number }>`
  position: absolute;
  top: ${({ index }) => (index >= 2 ? 'auto' : '100%')};
  bottom: ${({ index }) => (index > 2 ? '110%' : 'auto')};
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

const CompleteItem = styled.div`
  color: #28A745;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DeleteItem = styled.div<{ themeStyles: any }>`
  color: #FF4F4F;
  padding: 12px 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DateContainer = styled.div<{ themeStyles: any }>`
  display: flex;
  flex-direction: column;
  text-align: right;
  margin-bottom: 1rem;

  & span {
    color: #a7a7a7;
    font-size: 1rem;
  }

  & h2 {
    margin: 0;
    color: ${({ themeStyles }) => themeStyles.colors.text};
    font-size: 1.5rem;
  }
`;

const DasboardContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
`;

const DashBordText = styled.h2`
  color: #a7a7a7;
  font-size: 1.5rem;
`;

const HeaderTitleSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EditBtn = styled.button`
  padding: 8px 12px;
  background-color: transparent;
  color: #0075ff;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 1rem;
`;

const CheckAndDeleteContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const HeaderEditSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EditDeleteBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding: 8px 12px;
  background-color: transparent;
  color: #FF4F4F;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 1rem;

  &:disabled {
    color: #afafaf;
    cursor: not-allowed;
  }

  &:hover {
    background-color: #f3f4ff;
  }
`;

const SelectBtn = styled.button`
  padding: 8px 12px;
  background-color: #DDE9F6;
  color: #0075ff;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 1rem;
`;

const SelectColorBtn = styled.button<{ themeStyles: any }>`
  padding: 8px 1rem;
  background-color: ${({ themeStyles }) => themeStyles.colors.buttonBackground};
  color: ${({ themeStyles }) => themeStyles.colors.buttonColor};
  border: none;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:disabled {
    background-color: ${({ themeStyles }) => themeStyles.colors.inputBorder};
    color: #aeaeae;
    cursor: not-allowed;
  }
`;

const InputOptionContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 8px 0;
`;

const DDayBtn = styled.button<{ isDday: boolean, themeStyles: any }>`
  padding: 8px 1rem;
  background-color: ${({ themeStyles, isDday }) => isDday ? themeStyles.colors.buttonBackground : "#DDE9F6"};
  color: ${({ themeStyles, isDday }) => isDday ? themeStyles.colors.buttonColor : themeStyles.colors.buttonBackground};
  border: ${({ themeStyles }) => `1px solid ${themeStyles.colors.buttonBackground}`};
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
`;

const EditUtiltyBtn = styled.div`
  display: flex;
`;

const CompletedBtn = styled.button<{ themeStyles: any }>`
  padding: 8px 12px;
  background-color: transparent;
  color: #0075ff;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;

  &:disabled {
    color: #afafaf;
    cursor: not-allowed;
  }

  &:hover {
    background-color: #f3f4ff;
  }
`;

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Seoul');

interface TodoComponentProps {
  user: { id: string; email: string } | null;
  selectedDate: Date;
}

const TodoComponent = <T extends TodoComponentProps>({ user, selectedDate }: T) => {
  const { todos, setTodos, inputs, addInput, setInputs, resetInputs, removeInput } = useTodoStore();
  const [showInput, setShowInput] = useState<boolean>(false);
  const [animateOut, setAnimateOut] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const [dropdownItemCount, setDropdownItemCount] = useState<number>(0);
  const [isDday, setIsDday] = useState<boolean[]>([]);
  const [ddayTodos, setDdayTodos] = useState<Todo[]>([]);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { themeStyles } = useTheme();

  useEffect(() => {
    if (inputs.length < 3 && !isEditMode) {
      const additionalInputs = Array(3 - inputs.length).fill('');
      additionalInputs.forEach(() => addInput());
    }
    // isDday 배열을 inputs 길이에 맞춰 초기화
    setIsDday(inputs.map(() => false));
  }, [inputs, addInput, isEditMode]);


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
      if (user) {
        await fetchTodosForDate(user.id, selectedDate, setTodos);
      }
    };

    fetchData();
  }, [user, selectedDate, setTodos]);

  const handleInputChange = (index: number, value: string) => {
    setInputs(index, value);
  };

  const handleDotMenuClick = (todoId: string) => {
    const clickedTodoIndex = todos.findIndex(todo => todo.id === todoId);
    setShowDropdown(prev => (prev === todoId ? null : todoId));
    setDropdownItemCount(clickedTodoIndex);
  };

  const deleteTodoHandler = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      alert('삭제되었습니다.');
      if (user) {
        await deleteTodo(user.id, id, setTodos, selectedDate);
      }
    }
  };

  const toggleTodoHandler = async (id: string, isComplete: boolean) => {
    if (user) {
      await toggleTodo(user.id, id, isComplete, setTodos, selectedDate);
    }
  };

  const togglePriorityHandler = async (id: string, isPriority: boolean) => {
    if (user) {
      await togglePriority(user.id, id, isPriority, setTodos, selectedDate);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedTodos((prevSelectedTodos) => {
      const newSelectedTodos = prevSelectedTodos.includes(id)
        ? prevSelectedTodos.filter((todoId) => todoId !== id)
        : [...prevSelectedTodos, id];

      const allTodoIds = [...importantTodos, ...nonImportantTodos].map((todo) => todo.id);
      setIsAllSelected(newSelectedTodos.length === allTodoIds.length);

      return newSelectedTodos;
    });
  };

  const deleteSelectedTodosHandler = async () => {
    if (selectedTodos.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }
    if (confirm('선택된 항목들을 정말 삭제하시겠습니까?')) {
      alert('삭제되었습니다.');
      if (user) {
        await Promise.all(selectedTodos.map(todoId => deleteTodo(user.id, todoId, setTodos, selectedDate)));
        setSelectedTodos([]); // 선택된 항목 초기화
        await fetchTodosForDate(user.id, selectedDate, updatedTodos => {
          setTodos(updatedTodos);
          if (updatedTodos.length === 0) {
            setIsEditing(false);
          }
        });
      }
    }
  };

  const selectAllTodos = () => {
    const allTodoIds = [...importantTodos, ...nonImportantTodos].map((todo) => todo.id);
    if (isAllSelected) {
      setSelectedTodos([]);
    } else {
      setSelectedTodos(allTodoIds);
    }
    setIsAllSelected(!isAllSelected);
    setIsEditMode(false);
  };

  const saveTodosHandler = async () => {
    if (user) {
      const filteredIsDday = isDday.filter((_, index) => inputs[index].trim() !== '');
      if (isEditMode) {
        await Promise.all(
          selectedTodos.map((todoId, index) =>
            updateTodo(user.id, todoId, inputs[index], filteredIsDday[index], setTodos, selectedDate)
          )
        );
        alert('수정되었습니다.');
        setAnimateOut(true);
        setTimeout(() => {
          setIsEditing(false);
          setAnimateOut(false);
          setShowInput(false);
          resetInputs();
          setSelectedTodos([]);
          setIsEditMode(false);  // 수정 모드 해제
        }, 100);
      } else {
        await saveTodos(user.id, inputs, filteredIsDday, setTodos, resetInputs, setAnimateOut, setShowInput, selectedDate);
      }
      await fetchTodosForDate(user.id, selectedDate, setTodos);
      await fetchDdayTodos(user.id, setDdayTodos); // 디데이 일정 패칭 추가
    }
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

  const closeModal = () => {
    if (inputs.some(input => input !== '')) {
      if (confirm('창을 나가면 입력한 내용이 저장되지 않습니다. 정말 닫으시겠습니까?')) {
        alert('입력한 내용이 저장되지 않았습니다.');
        setTimeout(() => {
          setIsEditMode(false);
        }, 100);
      } else {
        return;
      }
    }
    setAnimateOut(true);
    setSelectedTodos([]);
    setTimeout(() => {
      setShowInput(false);
      setAnimateOut(false);
      resetInputs();
    }, 100);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);

    if (isEditing) {
      setSelectedTodos([]);
      setIsAllSelected(false);
    }

    if (importantTodos.length === 0 && nonImportantTodos.length === 0) {
      alert("편집할 일정이 없어요.");
      setIsEditing(false);
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
    }
  };

  const date: Date = new Date(selectedDate);

  const sortTodos = (todos: any[]) => {
    return todos.sort((a, b) => a.original_order - b.original_order);
  };


  const importantTodos = sortTodos(todos.filter(todo => todo.is_priority && !todo.is_complete));
  const nonImportantTodos = sortTodos(todos.filter(todo => !todo.is_priority && !todo.is_complete));
  const completedTodos = sortTodos(todos.filter(todo => todo.is_complete));

  useEffect(() => {
    if (user) {
      fetchDdayTodos(user.id, setDdayTodos);
    }
  }, [user]);

  const handleDdayChange = (index: number) => {
    setIsDday(prevIsDday => {
      const newIsDday = [...prevIsDday];
      newIsDday[index] = !newIsDday[index];
      return newIsDday;
    });

    if (inputs[index] === '') {
      alert('할 일을 먼저 입력해주세요.');
      setIsDday(prevIsDday => {
        const newIsDday = [...prevIsDday];
        newIsDday[index] = false;
        return newIsDday;
      });
    }
  };

  useEffect(() => {
    inputs.forEach((input, index) => {
      if (input === '' && isDday[index]) {
        setIsDday(prevIsDday => {
          const newIsDday = [...prevIsDday];
          newIsDday[index] = false;
          return newIsDday;
        });
      }
    });
  }, [inputs, isDday]);

  const completeSelectedTodos = async () => {
    if (selectedTodos.length === 0) {
      alert('완료할 항목을 선택해주세요.');
      return;
    }
    if (user) {
      await Promise.all(selectedTodos.map(todoId => toggleTodo(user.id, todoId, false, setTodos, selectedDate)));
      setSelectedTodos([]);

      const updatedTodos = await new Promise<Todo[]>((resolve) => {
        fetchTodosForDate(user.id, selectedDate, resolve);
      });

      setTodos(updatedTodos);

      const remainingTodos = updatedTodos.filter(todo => !todo.is_complete);
      if (remainingTodos.length === 0) {
        setIsEditing(false);
      }
    }
  };

  const handleEditTodo = (todoId?: string) => {
    let selectedTodo;

    if (todoId) {
      selectedTodo = todos.filter(todo => todo.id === todoId && !todo.is_complete);
      setSelectedTodos([todoId]);
    } else {
      selectedTodo = todos.filter(todo => selectedTodos.includes(todo.id) && !todo.is_complete);
    }

    if (selectedTodo.length === 0) {
      alert('수정할 일정을 선택해주세요.');
      return;
    }

    // 일정의 순서를 유지하여 가져오기 위해 original_order로 정렬
    selectedTodo.sort((a, b) => a.original_order - b.original_order);

    const selectedTodoContents = selectedTodo.map(todo => todo.content);
    const selectedTodoDdays = selectedTodo.map(todo => todo.is_dday);

    // 선택된 일정의 개수에 맞게 inputs 배열 설정
    resetInputs(selectedTodoContents.length);
    selectedTodoContents.forEach((content, index) => setInputs(index, content));

    setIsDday(selectedTodoDdays);
    setIsEditMode(true);
    setShowInput(true);
    setShowDropdown(null);
  };

  useEffect(() => {
    if (isEditMode && showInput) {
      const selectedTodosSorted = todos
        .filter(todo => selectedTodos.includes(todo.id) && !todo.is_complete)
        .sort((a, b) => a.original_order - b.original_order);

      const selectedTodoContents = selectedTodosSorted.map(todo => todo.content);
      const selectedTodoDdays = selectedTodosSorted.map(todo => todo.is_dday);

      resetInputs(selectedTodoContents.length); // 필요한 입력 필드만 생성
      selectedTodoContents.forEach((content, index) => setInputs(index, content));
      setIsDday(selectedTodoDdays);
    }
  }, [isEditMode, showInput, selectedTodos, todos, setInputs, resetInputs]);

  return (
    <>
      <MainTodoListContainer>
        <DasboardContainer>
          <DashBordText>DashBoard</DashBordText>
          <DateContainer themeStyles={themeStyles}>
            <span>{date.toLocaleString("ko-KR", { year: "numeric" })}</span>
            <h2>
              {date.toLocaleString("ko-KR", { month: "long", day: "numeric" })}
            </h2>
          </DateContainer>
        </DasboardContainer>
        <TodoContainer>
          <ProgressTodoContainer themeStyles={themeStyles}>
            <HeaderEditSection>
              <HeaderTitleSection>
                <h2>진행 중인 일정</h2>
                <EditBtn onClick={toggleEdit}>{isEditing ? '취소' : '편집'}</EditBtn>
              </HeaderTitleSection>
              <CheckAndDeleteContainer>
                {isEditing && (
                  <>
                    <SelectBtn onClick={selectAllTodos}>{isAllSelected ? '전체 해제' : '전체 선택'}</SelectBtn>
                    <EditUtiltyBtn>
                      <CompletedBtn onClick={completeSelectedTodos} disabled={selectedTodos.length === 0} themeStyles={themeStyles}>
                        <CheckDdayIcon />
                      </CompletedBtn>
                      <EditDeleteBtn onClick={() => handleEditTodo()} disabled={selectedTodos.length === 0}>
                        <EditIcon />
                      </EditDeleteBtn>
                      <EditDeleteBtn onClick={deleteSelectedTodosHandler} disabled={selectedTodos.length === 0}>
                        <DeleteIcon />
                      </EditDeleteBtn>
                    </EditUtiltyBtn>
                  </>
                )}
              </CheckAndDeleteContainer>
            </HeaderEditSection>
            {nonImportantTodos.length === 0 && importantTodos.length === 0 ? (
              <NoTodoListText>현재 진행 중인 일정이 없어요.</NoTodoListText>
            ) : (
              <ListContainer>
                <ul>
                  {importantTodos.length > 0 && (
                    <ImportantTodoContainer>
                      {importantTodos.map((todo) => (
                        <TodoListContentContainer key={todo.id}>
                          <TodoList>
                            {isEditing ? (
                              <input
                                type="checkbox"
                                checked={selectedTodos.includes(todo.id)}
                                onChange={() => handleCheckboxChange(todo.id)}
                              />
                            ) : (
                              <PriorityButton
                                isPriority={todo.is_priority}
                                onClick={() => togglePriorityHandler(todo.id, todo.is_priority)}
                              >
                                <PriorityIcon isPriority={todo.is_priority} />
                              </PriorityButton>
                            )}
                            {todo.content}
                          </TodoList>
                          <DotMenuBtnWrapper>
                            {!isEditing && (
                              <DotMenuBtn onClick={() => handleDotMenuClick(todo.id)} isDropDownOpen={showDropdown === todo.id} themeStyles={themeStyles}>
                                <img src="/dot-menu.svg" alt="Dot Menu" />
                              </DotMenuBtn>
                            )}
                            {showDropdown === todo.id && (
                              <DropdownMenu ref={dropdownRef} isDropDownOpen={!!showDropdown} themeStyles={themeStyles} index={dropdownItemCount}>
                                <CompleteItem onClick={() => toggleTodoHandler(todo.id, todo.is_complete)}>
                                  <CheckIcon />
                                  일정 완료
                                </CompleteItem>
                                <CompleteItem onClick={() => handleEditTodo(todo.id)}>
                                  <EditIcon />
                                  수정
                                </CompleteItem>
                                <DeleteItem onClick={() => deleteTodoHandler(todo.id)} themeStyles={themeStyles}>
                                  <DeleteIcon />
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
                      <TodoList>
                        {isEditing ? (
                          <input
                            type="checkbox"
                            checked={selectedTodos.includes(todo.id)}
                            onChange={() => handleCheckboxChange(todo.id)}
                          />
                        ) : (
                          <PriorityButton
                            isPriority={todo.is_priority}
                            onClick={() => togglePriorityHandler(todo.id, todo.is_priority)}
                          >
                            <PriorityIcon isPriority={todo.is_priority} />
                          </PriorityButton>
                        )}
                        {todo.content}
                      </TodoList>
                      <DotMenuBtnWrapper>
                        {!isEditing && (
                          <DotMenuBtn onClick={() => handleDotMenuClick(todo.id)} isDropDownOpen={showDropdown === todo.id} themeStyles={themeStyles}>
                            <img src="/dot-menu.svg" alt="Dot Menu" />
                          </DotMenuBtn>
                        )}
                        {showDropdown === todo.id && (
                          <DropdownMenu ref={dropdownRef} isDropDownOpen={!!showDropdown} themeStyles={themeStyles} index={dropdownItemCount}>
                            <CompleteItem onClick={() => toggleTodoHandler(todo.id, todo.is_complete)}>
                              <CheckIcon />
                              일정 완료
                            </CompleteItem>
                            <CompleteItem onClick={() => handleEditTodo(todo.id)}>
                              <EditIcon />
                              수정
                            </CompleteItem>
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
              </ListContainer>
            )}
            <AddToDoBtnContainer>
              <AddToDoBtn onClick={() => setShowInput(!showInput)} isOpen={showInput}>
                <AddIcon />
              </AddToDoBtn>
            </AddToDoBtnContainer>
          </ProgressTodoContainer>

          <ComplecatedTodoContainer themeStyles={themeStyles}>
            <h2>완료된 일정</h2>
            {completedTodos.length === 0 ? (
              <NoTodoListText>완료된 할 일이 없어요.</NoTodoListText>
            ) : (
              <ListContainer>
                <ul>
                  {completedTodos.map((todo) => (
                    <TodoListContentContainer key={todo.id}>
                      <li>
                        <input
                          type="checkbox"
                          checked={todo.is_complete}
                          onChange={() => toggleTodoHandler(todo.id, todo.is_complete)}
                        />
                        {todo.content}
                      </li>
                    </TodoListContentContainer>
                  ))}
                </ul>
              </ListContainer>
            )}
            <CompleteInfoContainer>
              <img src="/info.svg" alt="Info" />
              "남들이 할 수 있거나 하려는 일을 하지 말고 남들이 할 수 없거나 하지 않으려는 일을 하라" - 아멜리아 에어하트
            </CompleteInfoContainer>
          </ComplecatedTodoContainer>
        </TodoContainer>
      </MainTodoListContainer>

      {(showInput || animateOut) && (
        <ModalOverlay>
          <ModalContent isOpen={showInput && !animateOut} ref={modalContentRef} themeStyles={themeStyles}>
            <ModalTitleContainer>
              <h2>할 일 {isEditMode ? "수정" : "추가"}</h2>
              <p>
                {!isEditMode && (
                  <>
                    오늘 해야 할 일을 추가해 보세요.
                    <br />
                    한번에 최대 20개까지 추가 가능해요.
                  </>
                )}
              </p>
            </ModalTitleContainer>
            <ToDoInputContainer themeStyles={themeStyles}>
              {inputs.map((input, index) => (
                <div key={index}>
                  <input
                    ref={el => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    value={input}
                    placeholder='할 일을 입력해주세요.'
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyPress(index, e)}
                  />
                  <InputOptionContainer>
                    <DDayBtn onClick={() => handleDdayChange(index)} themeStyles={themeStyles} isDday={isDday[index]}>
                      {isDday[index] ? <CheckDdayIcon /> : null}
                      디데이
                    </DDayBtn>
                    <SelectColorBtn disabled themeStyles={themeStyles}>색상 설정</SelectColorBtn>
                  </InputOptionContainer>
                </div>
              ))}
            </ToDoInputContainer>
            {!isEditMode && (
              <AddTodoBtn onClick={handleAddInput}>
                <AddIcon />
                <p>할 일 항목 추가</p>
              </AddTodoBtn>
            )}
            <TodoSaveAndCancelBtnContainer themeStyles={themeStyles}>
              <CancelBtn themeStyles={themeStyles} onClick={closeModal}>취소</CancelBtn>
              <SaveTodoBtn onClick={saveTodosHandler}>{isEditMode ? '수정' : '저장'}</SaveTodoBtn>
            </TodoSaveAndCancelBtnContainer>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default TodoComponent;