import React, { useState, useEffect, useRef } from 'react';
import { useSpreadsheet } from '../context/SpreadsheetContext';
import './FormulaBar.css';

const FormulaBar = () => {
  const { 
    activeCell, 
    data, 
    setCellValue 
  } = useSpreadsheet();
  
  const [formula, setFormula] = useState('');
  const inputRef = useRef(null);
  
  // Update formula when active cell changes
  useEffect(() => {
    if (activeCell && data[activeCell]) {
      setFormula(data[activeCell].formula || data[activeCell].value || '');
    } else {
      setFormula('');
    }
  }, [activeCell, data]);
  
  // Handle formula change
  const handleFormulaChange = (e) => {
    setFormula(e.target.value);
  };
  
  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && activeCell) {
      const isFormula = formula.startsWith('=');
      setCellValue(activeCell, formula, isFormula);
      inputRef.current.blur();
    }
  };
  
  return (
    <div className="formula-bar">
      <div className="formula-label">
        {activeCell || ''}
      </div>
      <div className="formula-input-container">
        <span className="formula-fx">fx</span>
        <input
          ref={inputRef}
          type="text"
          className="formula-input"
          value={formula}
          onChange={handleFormulaChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter formula or value"
          disabled={!activeCell}
        />
      </div>
    </div>
  );
};

export default FormulaBar;
