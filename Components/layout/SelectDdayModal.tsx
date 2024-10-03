"use client"

import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css'; // 캘린더 기본 스타일
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import styled from "@emotion/styled";
import { Theme } from "@components/types/theme";
import moment from "moment";
import { keyframes } from "@emotion/react";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Seoul');

const fadeInModal = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOutModal = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
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
   z-index: 1000;
`;

const ModalContent = styled.div<{ themeStyles: Theme, isOpen: boolean }>`
  background-color: ${({ themeStyles }) => themeStyles.colors.background};
  padding: 1rem;
  border-radius: 12px;
  max-width: 572px;
  width: 100%;
  max-height: 90vh; 
  overflow: auto;
  animation: ${({ isOpen }) => (isOpen ? fadeInModal : fadeOutModal)} 0.2s;

  @media (max-width: 1224px) {
    max-width: 80%;
  }
`;

const CalendarStyled = styled(Calendar) <{ themeStyles: any }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: auto;
  min-height: 300px; /* 최소 높이 */
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
    height: 60px;
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
    color: #FFFFFF;
    font-size: 1.2rem;

    &:hover {
      background: ${({ themeStyles }) => themeStyles.colors.buttonHoverBackground};
      color: ${({ themeStyles }) => themeStyles.colors.buttonColor};
    }
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
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

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

interface SelectDdayModalProps {
  isOpen: boolean;
  setSelectDday: (date: Date | null) => void;
  closeModal: () => void;
  themeStyles: Theme;
  todoId: string;
  initialDate: Date | null;
}

const SelectDdayModal = <T extends SelectDdayModalProps>({ isOpen, setSelectDday, closeModal, themeStyles, initialDate }: T) => {
  const [value, onChange] = useState<Date>(dayjs().toDate()); // 기본값을 오늘 날짜로 설정
  const [activeStartDate, setActiveStartDate] = useState<Date | undefined>(initialDate || new Date());

  useEffect(() => {
    onChange(initialDate || dayjs().toDate());  // 모달을 열 때 초기 날짜를 설정
    setActiveStartDate(initialDate || new Date());  // 초기 날짜에 포커스 설정
  }, [initialDate]);

  // 날짜 클릭 핸들러
  const handleDateClick = (value: Date | Date[]) => {
    onChange(value as Date); // 날짜 변경 시 value 업데이트
    setActiveStartDate(value as Date);
  };

  // 저장 버튼 클릭 시
  const handleDdaySave = async () => {
    if (value) {
      const formattedDate = dayjs(value).tz("Asia/Seoul").format('YYYY-MM-DD'); // 한국 시간으로 날짜 저장
      setSelectDday(value);
      closeModal();
    }
  };

  if (!isOpen) return null; // 모달이 열려있지 않으면 아무것도 렌더링하지 않음

  return (
    <ModalOverlay>
      <ModalContent themeStyles={themeStyles} isOpen={isOpen}>
        <h2>디데이 날짜 선택</h2>
        <CalendarStyled
          onClickDay={handleDateClick}  // 날짜 클릭 시 핸들러 호출
          value={value}  // 선택된 날짜 표시
          formatDay={(locale, date) => moment(date).format("DD")}  // 날짜 포맷 설정
          themeStyles={themeStyles}  // 테마 스타일 적용
        />
        <p>{value ? value.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }) : "선택한 날짜에 오류가 있어요."}</p>
        <ButtonContainer>
          <CancelBtn onClick={closeModal} themeStyles={themeStyles}>취소</CancelBtn>
          <SaveTodoBtn onClick={handleDdaySave}>선택</SaveTodoBtn>
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SelectDdayModal;
