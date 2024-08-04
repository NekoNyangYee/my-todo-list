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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div<{ themeStyles: any }>`
    background: ${({ themeStyles }) => themeStyles.colors.containerBackground};
    padding: 20px;
    border-radius: 8px;
    width: 400px;
    max-width: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
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
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;

    &:hover {
        background-color: #0056b3;
    }
`;

const SampleColorText = styled.p<{ color: string }>`
    color: ${props => props.color};
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
                <h2>색상 선택(beta)</h2>
                <h3>색상 적용 예시</h3>
                <SampleColorText color={selectedColor || themeStyles.colors.text}>색상이 적용됩니다.</SampleColorText>
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
