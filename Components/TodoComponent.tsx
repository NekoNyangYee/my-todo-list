'use client';

import { css, keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { useTodoStore } from "../Store/useAuthTodoStore";
import { fetchTodosForDate, deleteTodo, toggleTodo, togglePriority, saveTodos } from "@components/util/todoUtil";
import { useTheme } from "@components/app/Context/ThemeContext";
import PriorityIcon from "./icons/Priority/PriorityIcon";
import DeleteIcon from "./icons/Utils/DeleteIcon";
import AddIcon from "./icons/Utils/AddIcon";

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

const TodoContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  width: 100%;
  max-width: 972px;
  margin: 0 auto;

  & ul {
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  & li {
    list-style: none;
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
  z-index: 1000; /* Ensure the modal overlay is above other content */
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

const CancelBtn = styled.button`
  padding: 12px 1.6rem;
  background-color: #e7e7e7;
  color: #aeaeae;
  font-size: 0.8rem;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  outline: none;
  transition: background-color 0.2s, color 0.2s;
  font-weight: bold;

  &:hover {
    background-color: #d7d7d7;
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
  gap: 12px;
  justify-content: space-between;
  position: relative;

  & li {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: auto 0;
  }
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
    background: none;
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

const DotMenuBtn = styled.button<{ isDropDownOpen: boolean }>`
  width: 40px;
  height: 40px;
  padding: 8px;
  border: none;
  cursor: pointer;
  background-color: ${({ isDropDownOpen }) => (isDropDownOpen ? '#f7f7f7' : 'transparent')};
  border-radius: 50%;
  position: relative;
`;

const DropdownMenu = styled.div<{ isDropDownOpen: boolean, themeStyles: any }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${({ themeStyles }) => themeStyles.colors.containerBackground};
  border: 1px solid ${({ themeStyles }) => themeStyles.colors.inputBorder};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
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

  &:hover {
    background-color: ${({ themeStyles }) => themeStyles.colors.background};
  }
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

interface TodoComponentProps {
  user: { id: string; email: string } | null;
  selectedDate: Date;
}

const TodoComponent: React.FC<TodoComponentProps> = ({ user, selectedDate }) => {
  const { todos, setTodos, inputs, addInput, setInputs, resetInputs } = useTodoStore();
  const [showInput, setShowInput] = useState<boolean>(false);
  const [animateOut, setAnimateOut] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { themeStyles } = useTheme();

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
    setShowDropdown(prev => (prev === todoId ? null : todoId));
  };

  const deleteTodoHandler = async (id: string) => {
    if (user) {
      await deleteTodo(user.id, id, setTodos, selectedDate);
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

  const saveTodosHandler = async () => {
    if (user) {
      await saveTodos(user.id, inputs, setTodos, resetInputs, setAnimateOut, setShowInput, selectedDate);
      await fetchTodosForDate(user.id, selectedDate, setTodos);
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

  const date = new Date();

  const importantTodos = todos.filter(todo => todo.is_priority && !todo.is_complete);
  const nonImportantTodos = todos.filter(todo => !todo.is_priority && !todo.is_complete);

  return (
    <>
      <MainTodoListContainer>
        <DasboardContainer>
          <DashBordText>DashBoard</DashBordText>
          <DateContainer themeStyles={themeStyles}>
            <span>{date.toLocaleString("ko-KR", {
              year: "numeric",
            })}
            </span>
            <h2>
              {date.toLocaleString("ko-KR", {
                month: "long",
                day: "numeric",
              })}
            </h2>
          </DateContainer>
        </DasboardContainer>
        <TodoContainer>
          <ProgressTodoContainer themeStyles={themeStyles}>
            <h2>진행 중인 일정</h2>
            {nonImportantTodos.length === 0 && importantTodos.length === 0 ? (
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
                            onClick={() => togglePriorityHandler(todo.id, todo.is_priority)}
                          >
                            <PriorityIcon isPriority={todo.is_priority} />
                          </PriorityButton>
                          {todo.content}
                        </li>
                        <DotMenuBtnWrapper>
                          <DotMenuBtn onClick={() => handleDotMenuClick(todo.id)} isDropDownOpen={showDropdown === todo.id}>
                            <img src="/dot-menu.svg" alt="Dot Menu" />
                          </DotMenuBtn>
                          {showDropdown === todo.id && (
                            <DropdownMenu ref={dropdownRef} isDropDownOpen={!!showDropdown} themeStyles={themeStyles}>
                              <CompleteItem onClick={() => toggleTodoHandler(todo.id, todo.is_complete)}>
                                <img src="/check.svg" alt="Check" />
                                일정 완료
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
                    <li>
                      <PriorityButton
                        isPriority={todo.is_priority}
                        onClick={() => togglePriorityHandler(todo.id, todo.is_priority)}
                      >
                        <PriorityIcon isPriority={todo.is_priority} />
                      </PriorityButton>
                      {todo.content}
                    </li>
                    <DotMenuBtnWrapper>
                      <DotMenuBtn onClick={() => handleDotMenuClick(todo.id)} isDropDownOpen={showDropdown === todo.id}>
                        <img src="/dot-menu.svg" alt="Dot Menu" />
                      </DotMenuBtn>
                      {showDropdown === todo.id && (
                        <DropdownMenu ref={dropdownRef} isDropDownOpen={!!showDropdown} themeStyles={themeStyles}>
                          <CompleteItem onClick={() => toggleTodoHandler(todo.id, todo.is_complete)}>
                            <img src="/check.svg" alt="Check" />
                            일정 완료
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

            )}
            <AddToDoBtnContainer>
              <AddToDoBtn onClick={() => setShowInput(!showInput)} isOpen={showInput}>
                <AddIcon />
              </AddToDoBtn>
            </AddToDoBtnContainer>
          </ProgressTodoContainer>

          <ComplecatedTodoContainer themeStyles={themeStyles}>
            <h2>완료된 일정</h2>
            {todos.filter(todo => todo.is_complete).length === 0 ? (
              <NoTodoListText>완료된 할 일이 없어요.</NoTodoListText>
            ) : (
              <ul>
                {todos.filter(todo => todo.is_complete).map((todo) => (
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
              <h2>할 일 추가</h2>
              <p>오늘 해야 할 일을 추가해 보세요.<br />한번에 최대 20개까지 추가 가능해요.</p>
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
                </div>
              ))}
            </ToDoInputContainer>
            <AddTodoBtn onClick={handleAddInput}>
              <AddIcon />
              <p>할 일 항목 추가</p>
            </AddTodoBtn>
            <TodoSaveAndCancelBtnContainer themeStyles={themeStyles}>
              <CancelBtn onClick={closeModal}>취소</CancelBtn>
              <SaveTodoBtn onClick={saveTodosHandler}>저장</SaveTodoBtn>
            </TodoSaveAndCancelBtnContainer>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default TodoComponent;
