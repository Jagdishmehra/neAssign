import React, { useState } from 'react';
import { useSpreadsheet } from '../context/SpreadsheetContext';
import './Toolbar.css';

const Toolbar = () => {
  const { 
    activeCell, 
    data, 
    setCellFormatting,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    removeDuplicates,
    selectedRange
  } = useSpreadsheet();
  
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  
  const cellFormatting = activeCell ? data[activeCell]?.formatting : {
    bold: false,
    italic: false,
    fontSize: 14,
    color: '#000000'
  };

  const handleBoldClick = () => {
    if (activeCell) {
      setCellFormatting(activeCell, { bold: !cellFormatting.bold });
    }
  };

  const handleItalicClick = () => {
    if (activeCell) {
      setCellFormatting(activeCell, { italic: !cellFormatting.italic });
    }
  };

  const handleColorChange = (e) => {
    if (activeCell) {
      setCellFormatting(activeCell, { color: e.target.value });
    }
  };

  const handleFontSizeChange = (e) => {
    if (activeCell) {
      setCellFormatting(activeCell, { fontSize: parseInt(e.target.value) });
    }
  };

  const handleAddRowClick = () => {
    if (activeCell) {
      const rowIndex = parseInt(activeCell.substring(1));
      addRow(rowIndex);
    }
  };

  const handleDeleteRowClick = () => {
    if (activeCell) {
      const rowIndex = parseInt(activeCell.substring(1)) - 1;
      deleteRow(rowIndex);
    }
  };

  const handleAddColumnClick = () => {
    if (activeCell) {
      const colIndex = activeCell.charCodeAt(0) - 65;
      addColumn(colIndex);
    }
  };

  const handleDeleteColumnClick = () => {
    if (activeCell) {
      const colIndex = activeCell.charCodeAt(0) - 65;
      deleteColumn(colIndex);
    }
  };

  const handleFindAndReplace = () => {
    if (findText) {
      useSpreadsheet().findAndReplace(findText, replaceText);
      setShowFindReplace(false);
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section formatting">
        <button 
          className={`toolbar-button ${cellFormatting?.bold ? 'active' : ''}`} 
          onClick={handleBoldClick}
          title="Bold"
        >
          <span className="icon">B</span>
        </button>
        <button 
          className={`toolbar-button ${cellFormatting?.italic ? 'active' : ''}`} 
          onClick={handleItalicClick}
          title="Italic"
        >
          <span className="icon">I</span>
        </button>
        <select 
          className="toolbar-select"
          value={cellFormatting?.fontSize || 14}
          onChange={handleFontSizeChange}
          title="Font Size"
        >
          {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24].map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <input 
          type="color"
          className="toolbar-color"
          value={cellFormatting?.color || '#000000'}
          onChange={handleColorChange}
          title="Text Color"
        />
      </div>
      
      <div className="toolbar-section">
        <button 
          className="toolbar-button"
          onClick={handleAddRowClick}
          title="Add Row"
        >
          Add Row
        </button>
        <button 
          className="toolbar-button"
          onClick={handleDeleteRowClick}
          title="Delete Row"
        >
          Delete Row
        </button>
        <button 
          className="toolbar-button"
          onClick={handleAddColumnClick}
          title="Add Column"
        >
          Add Col
        </button>
        <button 
          className="toolbar-button"
          onClick={handleDeleteColumnClick}
          title="Delete Column"
        >
          Delete Col
        </button>
      </div>
      
      <div className="toolbar-section">
        <button 
          className="toolbar-button"
          onClick={() => removeDuplicates()}
          disabled={!selectedRange?.start || !selectedRange?.end}
          title="Remove duplicate rows in selection"
        >
          Remove Duplicates
        </button>
        <button 
          className="toolbar-button"
          onClick={() => setShowFindReplace(!showFindReplace)}
          title="Find and Replace"
        >
          Find/Replace
        </button>
      </div>
      
      {showFindReplace && (
        <div className="find-replace-panel">
          <input 
            type="text"
            placeholder="Find"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
          />
          <input 
            type="text"
            placeholder="Replace with"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
          />
          <button onClick={handleFindAndReplace}>Replace</button>
          <button onClick={() => setShowFindReplace(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
