"use client"

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ColorOption = styled.div<{ color: string; selected: boolean }>`
  width: 30px;
  height: 30px;
  background-color: ${props => props.color};
  border: ${props => props.selected ? '2px solid black' : 'none'};
  border-radius: 50%;
  margin: 5px;
  cursor: pointer;
`;

const ApplyButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #0056b3;
  }
`;

interface ColorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onColorSelect: (color: string) => void;
    currentColor: string | null;
}

const ColorModal: React.FC<ColorModalProps> = ({ isOpen, onClose, onColorSelect, currentColor }) => {
    const [selectedColor, setSelectedColor] = useState<string | null>(currentColor);

    useEffect(() => {
        setSelectedColor(currentColor);
    }, [currentColor]);

    if (!isOpen) return null;

    const colors = ['#0075FF', '#FF5733', '#33FF57', '#F1C40F', '#8E44AD', '#3498DB', '#1ABC9C'];

    const handleApplyColor = () => {
        if (selectedColor) {
            onColorSelect(selectedColor);
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <h2>색상 선택(beta)</h2>
                <p>내가 원하는대로 색상을 지정할 수 있어요.</p>
                <div style={{ display: 'flex' }}>
                    {colors.map(color => (
                        <ColorOption
                            key={color}
                            color={color}
                            selected={selectedColor === color}
                            onClick={() => setSelectedColor(color)}
                        />
                    ))}
                </div>
                <ApplyButton onClick={handleApplyColor}>적용</ApplyButton>
            </ModalContent>
        </ModalOverlay>
    );
};

export default ColorModal;
