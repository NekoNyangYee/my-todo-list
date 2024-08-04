"use client"

import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@components/app/Context/ThemeContext';

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

const ModalContent = styled.div<{ themeStyles: any }>`
    background: ${({ themeStyles }) => themeStyles.colors.background};
    padding: 20px;
    border-radius: 12px;
    max-width: 472px;
    width: 100%;
    min-height: 30vh;
    max-height: 80vh;
    display: flex;
    gap: 20px;
    flex-direction: column;

    @media (max-width: 768px) {
        max-width: 80%;
    }
`;

const ColorOption = styled.div<{ color: string; selected: boolean, themeStyles: any }>`
    width: 30px;
    height: 30px;
    background-color: ${props => props.color};
    border: ${props => props.selected ? `3px solid ${props.themeStyles.colors.text}` : 'none'};
    box-sizing: border-box;
    border-radius: 50%;
    margin: 5px;
    cursor: pointer;
`;

const NoColorOption = styled.div<{ selected: boolean, themeStyles: any }>`
    width: 30px;
    height: 30px;
    margin: 5px;
    background-color: #ccc;
    border: ${props => props.selected ? `3px solid ${props.themeStyles.colors.text}` : 'none'};
    box-sizing: border-box;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ApplyButton = styled.button`
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;

    &:hover {
        background-color: #0056b3;
    }
`;

const SelectColorTitle = styled.h2`
    margin: 0;
`;

const SampleColorText = styled.p<{ color: string, themeStyles: any }>`
    width: 100%;
    padding: 1rem;
    background-color: ${props => props.themeStyles.colors.containerBackground};
    color: ${props => props.color};
    border-radius: 8px;
    box-shadow: ${props => props.themeStyles.colors.shadow};
    box-sizing: border-box;
    margin: 0;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
`;

const SampleContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;

    & h3  {
        margin: 0;
    }
`;

interface ColorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onColorSelect: (color: string | null) => void;
    currentColor: string | null;
}

const ColorModal: React.FC<ColorModalProps> = ({ isOpen, onClose, onColorSelect, currentColor }) => {
    const [selectedColor, setSelectedColor] = useState<string>(currentColor || '');
    const { themeStyles } = useTheme();

    useEffect(() => {
        setSelectedColor(currentColor || '');
    }, [currentColor]);

    if (!isOpen) return null;
    const colors = ['#0075FF', '#FF5733', '#33FF57', '#F1C40F', '#8E44AD', '#3498DB', '#1ABC9C'];

    const handleApplyColor = () => {
        onColorSelect(selectedColor || null);
        onClose();
    };

    const handleClose = () => {
        setSelectedColor(currentColor || '');
        onClose();
    };

    return (
        <ModalOverlay onClick={handleClose}>
            <ModalContent onClick={e => e.stopPropagation()} themeStyles={themeStyles}>
                <SelectColorTitle>색상 선택(beta)</SelectColorTitle>
                <SampleContainer>
                    <h3>색상 적용 예시</h3>
                    <SampleColorText color={selectedColor || themeStyles.colors.text} themeStyles={themeStyles}>색상이 적용됩니다.</SampleColorText>
                </SampleContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <NoColorOption
                        selected={selectedColor === ''}
                        onClick={() => setSelectedColor('')}
                        themeStyles={themeStyles}
                    >
                        <img src="./close.svg" />
                    </NoColorOption>
                    {colors.map(color => (
                        <ColorOption
                            key={color}
                            color={color}
                            selected={selectedColor === color}
                            onClick={() => setSelectedColor(color)}
                            themeStyles={themeStyles}
                        />
                    ))}
                </div>
                <ApplyButton onClick={handleApplyColor}>적용</ApplyButton>
            </ModalContent>
        </ModalOverlay>
    );
};

export default ColorModal;
