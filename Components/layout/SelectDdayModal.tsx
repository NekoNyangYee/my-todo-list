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
import { supabase } from "@components/lib/supabaseClient";

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
  max-height: 80vh; 
  overflow: auto;
  animation: ${({ isOpen }) => (isOpen ? fadeInModal : fadeOutModal)} 0.2s;
  border: 1px solid ${({ themeStyles }) => themeStyles.colors.inputBorder};

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
  width: 100%;
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

const DdayOptionContainer = styled.div<{ themeStyles: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ themeStyles }) => themeStyles.colors.containerBackground};
  border-radius: 8px;
  padding: 1rem;

  & p {
    font-size: 1rem;
    color: ${({ themeStyles }) => themeStyles.colors.text};
    margin: 0;
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
  todoId: string | null;
  initialDate: Date | null;
}

const SelectDdayModal = <T extends SelectDdayModalProps>({
  isOpen,
  setSelectDday,
  closeModal,
  themeStyles,
  initialDate,
  todoId,
}: T) => {
  const [value, onChange] = useState<Date | null>(initialDate || null); // 날짜 상태
  const [ddayOption, setDdayOption] = useState<boolean>(false); // D-Day 활성화 상태

  // Supabase 업데이트 함수
  const updateDdayStatus = async (isDday: boolean) => {
    if (!todoId) return;

    try {
      const { error } = await supabase
        .from("todos")
        .update({
          is_dday: isDday,
          dday_date: isDday ? value : null, // D-Day 활성화 여부에 따라 날짜 설정
        })
        .eq("id", todoId);

      if (error) {
        console.error("Error updating D-Day status:", error);
      } else {
        console.log(`D-Day updated: is_dday=${isDday}, dday_date=${isDday ? value : null}`);
      }
    } catch (err) {
      console.error("Unexpected error updating D-Day status:", err);
    }
  };

  // D-Day 상태 로드
  const fetchDdayStatus = async () => {
    if (!todoId) return;

    try {
      const { data, error } = await supabase
        .from("todos")
        .select("is_dday, dday_date")
        .eq("id", todoId)
        .single();

      if (error) {
        console.error("Error fetching D-Day status:", error);
        return;
      }

      setDdayOption(data?.is_dday || false); // 체크박스 상태 업데이트
      if (data?.dday_date) {
        onChange(dayjs(data.dday_date).toDate()); // 날짜 설정
      } else {
        onChange(null); // 날짜 초기화
      }
    } catch (err) {
      console.error("Unexpected error fetching D-Day status:", err);
    }
  };

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen && todoId) {
      fetchDdayStatus();
    }
  }, [isOpen, todoId]);

  // 모달 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setDdayOption(false);
      onChange(initialDate || null); // 날짜 초기화
    }
  }, [isOpen, initialDate]);

  // 체크박스 상태 변경
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setDdayOption(isChecked); // 로컬 상태 업데이트

    if (!isChecked) {
      onChange(null); // 날짜 초기화
      setSelectDday(null); // 부모에 null 전달
    }
  };


  const handleDdaySave = async () => {
    if (value) {
      setSelectDday(value); // 선택된 날짜 부모로 전달
      closeModal();
    }
  };

  const formatButtonText = () => {
    return value
      ? value.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
      : "디데이 선택"; // 버튼 텍스트 동적 변경
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent themeStyles={themeStyles} isOpen={isOpen}>
        <CancelBtn onClick={closeModal} themeStyles={themeStyles}>
          취소
        </CancelBtn>
        <DdayOptionContainer themeStyles={themeStyles}>
          <p>디데이 캘린더</p>
          <input
            type="checkbox"
            checked={ddayOption}
            onChange={handleCheckboxChange} // 체크박스 상태 업데이트
            id="autoRelease"
            name="autoRelease"
          />
        </DdayOptionContainer>
        {ddayOption && (
          <>
            <h2>디데이 날짜 선택</h2>
            <CalendarStyled
              onClickDay={(date) => onChange(date)} // 날짜 선택
              value={value}
              formatDay={(locale, date) => moment(date).format("DD")}
              themeStyles={themeStyles}
            />
            <p>{formatButtonText()}</p>
            <ButtonContainer>
              <SaveTodoBtn onClick={handleDdaySave}>선택</SaveTodoBtn>
            </ButtonContainer>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default SelectDdayModal;
