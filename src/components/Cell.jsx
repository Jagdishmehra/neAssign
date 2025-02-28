import React, { useState, useRef, useEffect } from 'react';
import { useSpreadsheet } from '../context/SpreadsheetContext';
import './Cell.css';

const Cell = ({ cellId, onMouseDown, onMouseOver, isSelected, isActive }) => {
  const { 
    data, 
    editMode, 
    setEditMode, 
    setCellValue 
  } = useSpreadsheet();
  
  const cell = data[cellId] || {
    value: '',
    formula: '',
    formatting: { bold: false, italic: false, fontSize: 14, color: '#000000' }
  };
  
  const [inputValue, setInputValue] = useState('');
  const cellRef = useRef(null);
  const inputRef = useRef(null);

  // Set up input value when cell becomes active
  useEffect(() => {
    if (isActive && editMode) {
      setInputValue(cell.formula || cell.value || '');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isActive, editMode, cell.value, cell.formula]);

  // Handle double click to enter edit mode
  const handleDoubleClick = () => {
    setEditMode(true);
  };

  // Handle key down events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Save and exit edit mode
      handleBlur();
    } else if (e.key === 'Escape') {
      // Cancel edit and exit edit mode
      setEditMode(false);
    }
  };

  // Handle blur event to save changes
  const handleBlur = () => {
    if (editMode && isActive) {
      const isFormula = inputValue.startsWith('=');
      setCellValue(cellId, inputValue, isFormula);
      setEditMode(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Apply cell formatting styles
  const cellStyle = {
    fontWeight: cell.formatting?.bold ? 'bold' : 'normal',
    fontStyle: cell.formatting?.italic ? 'italic' : 'normal',
    fontSize: `${cell.formatting?.fontSize || 14}px`,
    color: cell.formatting?.color || '#000000',
  };

  // Determine cell class names
  const cellClassNames = [
    'spreadsheet-cell',
    isSelected ? 'selected' : '',
    isActive ? 'active' : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      ref={cellRef}
      className={cellClassNames}
      onMouseDown={() => onMouseDown(cellId)}
      onMouseOver={() => onMouseOver(cellId)}
      onDoubleClick={handleDoubleClick}
      style={cellStyle}
    >
      {isActive && editMode ? (
        <input
          ref={inputRef}
          type="text"
          className="cell-input"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div className="cell-content">
          {cell.formatted || cell.value || ''}
        </div>
      )}
    </div>
  );
};

export default Cell;
