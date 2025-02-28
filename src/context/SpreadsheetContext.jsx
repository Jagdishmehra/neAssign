import React, { createContext, useState, useContext, useCallback } from 'react';
import { evaluateFormula } from '../utils/formulaEvaluator';

const SpreadsheetContext = createContext();

export const useSpreadsheet = () => useContext(SpreadsheetContext);

export const SpreadsheetProvider = ({ children }) => {
  const DEFAULT_ROWS = 100;
  const DEFAULT_COLS = 26;
  
  const [data, setData] = useState(() => {
    const initialData = {};
    for (let row = 0; row < DEFAULT_ROWS; row++) {
      for (let col = 0; col < DEFAULT_COLS; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
        initialData[cellId] = {
          value: '',
          formula: '',
          formatted: '',
          formatting: {
            bold: false,
            italic: false,
            fontSize: 14,
            color: '#000000',
          },
        };
      }
    }
    return initialData;
  });

  const [activeCell, setActiveCell] = useState(null);
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });
  const [editMode, setEditMode] = useState(false);
  const [dimensions, setDimensions] = useState({
    rows: DEFAULT_ROWS,
    cols: DEFAULT_COLS,
  });

  const setCellValue = useCallback((cellId, value, isFormula = false) => {
    setData(prevData => {
      const newData = { ...prevData };
      
      // If it's a formula, store it and evaluate
      if (isFormula) {
        const formulaValue = value.startsWith('=') ? value : `=${value}`;
        const result = evaluateFormula(formulaValue.substring(1), newData);
        
        newData[cellId] = {
          ...newData[cellId],
          formula: formulaValue,
          value: result,
          formatted: result,
        };
      } else {
        newData[cellId] = {
          ...newData[cellId],
          formula: '',
          value: value,
          formatted: value,
        };
      }

      // Update dependent cells
      updateDependentCells(newData, cellId);
      
      return newData;
    });
  }, []);

  const updateDependentCells = (data, changedCellId) => {
    // Find cells that depend on the changed cell and update them
    Object.keys(data).forEach(cellId => {
      const cell = data[cellId];
      if (cell.formula && cell.formula.includes(changedCellId)) {
        const result = evaluateFormula(cell.formula.substring(1), data);
        data[cellId] = {
          ...cell,
          value: result,
          formatted: result,
        };
        // Recursively update cells that depend on this cell
        updateDependentCells(data, cellId);
      }
    });
  };

  const setCellFormatting = useCallback((cellId, formatting) => {
    setData(prevData => ({
      ...prevData,
      [cellId]: {
        ...prevData[cellId],
        formatting: {
          ...prevData[cellId].formatting,
          ...formatting,
        },
      },
    }));
  }, []);

  const addRow = useCallback((afterIndex) => {
    setDimensions(prev => ({ ...prev, rows: prev.rows + 1 }));
    setData(prevData => {
      const newData = { ...prevData };
      // Shift existing rows down
      for (let row = dimensions.rows - 1; row > afterIndex; row--) {
        for (let col = 0; col < dimensions.cols; col++) {
          const oldCellId = `${String.fromCharCode(65 + col)}${row}`;
          const newCellId = `${String.fromCharCode(65 + col)}${row + 1}`;
          newData[newCellId] = { ...newData[oldCellId] };
        }
      }
      
      // Create the new row
      for (let col = 0; col < dimensions.cols; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${afterIndex + 1}`;
        newData[cellId] = {
          value: '',
          formula: '',
          formatted: '',
          formatting: {
            bold: false,
            italic: false,
            fontSize: 14,
            color: '#000000',
          },
        };
      }
      
      return newData;
    });
  }, [dimensions]);

  const deleteRow = useCallback((rowIndex) => {
    if (dimensions.rows <= 1) return;
    
    setDimensions(prev => ({ ...prev, rows: prev.rows - 1 }));
    setData(prevData => {
      const newData = { ...prevData };
      
      // Shift rows up
      for (let row = rowIndex; row < dimensions.rows - 1; row++) {
        for (let col = 0; col < dimensions.cols; col++) {
          const oldCellId = `${String.fromCharCode(65 + col)}${row + 2}`;
          const newCellId = `${String.fromCharCode(65 + col)}${row + 1}`;
          newData[newCellId] = { ...newData[oldCellId] };
        }
      }
      
      // Remove the last row
      for (let col = 0; col < dimensions.cols; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${dimensions.rows}`;
        delete newData[cellId];
      }
      
      return newData;
    });
  }, [dimensions]);

  const addColumn = useCallback((afterIndex) => {
    setDimensions(prev => ({ ...prev, cols: prev.cols + 1 }));
    setData(prevData => {
      const newData = { ...prevData };
      
      // Shift columns to the right
      for (let col = dimensions.cols - 1; col > afterIndex; col--) {
        for (let row = 0; row < dimensions.rows; row++) {
          const oldCellId = `${String.fromCharCode(65 + col)}${row + 1}`;
          const newCellId = `${String.fromCharCode(65 + col + 1)}${row + 1}`;
          newData[newCellId] = { ...newData[oldCellId] };
        }
      }
      
      // Create the new column
      for (let row = 0; row < dimensions.rows; row++) {
        const cellId = `${String.fromCharCode(65 + afterIndex + 1)}${row + 1}`;
        newData[cellId] = {
          value: '',
          formula: '',
          formatted: '',
          formatting: {
            bold: false,
            italic: false,
            fontSize: 14,
            color: '#000000',
          },
        };
      }
      
      return newData;
    });
  }, [dimensions]);

  const deleteColumn = useCallback((colIndex) => {
    if (dimensions.cols <= 1) return;
    
    setDimensions(prev => ({ ...prev, cols: prev.cols - 1 }));
    setData(prevData => {
      const newData = { ...prevData };
      
      // Shift columns to the left
      for (let col = colIndex; col < dimensions.cols - 1; col++) {
        for (let row = 0; row < dimensions.rows; row++) {
          const oldCellId = `${String.fromCharCode(65 + col + 1)}${row + 1}`;
          const newCellId = `${String.fromCharCode(65 + col)}${row + 1}`;
          newData[newCellId] = { ...newData[oldCellId] };
        }
      }
      
      // Remove the last column
      for (let row = 0; row < dimensions.rows; row++) {
        const cellId = `${String.fromCharCode(65 + dimensions.cols - 1)}${row + 1}`;
        delete newData[cellId];
      }
      
      return newData;
    });
  }, [dimensions]);

  const removeDuplicates = useCallback(() => {
    if (!selectedRange.start || !selectedRange.end) return;
    
    const { start, end } = selectedRange;
    const startCol = start.charCodeAt(0) - 65;
    const endCol = end.charCodeAt(0) - 65;
    const startRow = parseInt(start.substring(1));
    const endRow = parseInt(end.substring(1));
    
    // Extract data from the range
    const rowData = [];
    for (let row = startRow; row <= endRow; row++) {
      const rowValues = [];
      for (let col = startCol; col <= endCol; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${row}`;
        rowValues.push(data[cellId].value);
      }
      rowData.push({ row, values: rowValues.join('|') });
    }
    
    // Find unique rows
    const uniqueRows = [];
    const uniqueRowValues = new Set();
    
    rowData.forEach(rowInfo => {
      if (!uniqueRowValues.has(rowInfo.values)) {
        uniqueRowValues.add(rowInfo.values);
        uniqueRows.push(rowInfo.row);
      }
    });
    
    // Create new data without duplicates
    setData(prevData => {
      const newData = { ...prevData };
      
      // Clear the range first
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const cellId = `${String.fromCharCode(65 + col)}${row}`;
          newData[cellId] = {
            ...newData[cellId],
            value: '',
            formula: '',
            formatted: '',
          };
        }
      }
      
      // Fill in unique rows
      let newRowIndex = startRow;
      uniqueRows.forEach(originalRow => {
        for (let col = startCol; col <= endCol; col++) {
          const originalCellId = `${String.fromCharCode(65 + col)}${originalRow}`;
          const newCellId = `${String.fromCharCode(65 + col)}${newRowIndex}`;
          
          newData[newCellId] = {
            ...newData[newCellId],
            value: prevData[originalCellId].value,
            formula: prevData[originalCellId].formula,
            formatted: prevData[originalCellId].formatted,
          };
        }
        newRowIndex++;
      });
      
      return newData;
    });
  }, [selectedRange, data]);

  const findAndReplace = useCallback((findText, replaceText) => {
    setData(prevData => {
      const newData = { ...prevData };
      
      // Determine range to search
      const searchRange = selectedRange.start && selectedRange.end 
        ? selectedRange 
        : { start: 'A1', end: `${String.fromCharCode(65 + dimensions.cols - 1)}${dimensions.rows}` };
      
      const startCol = searchRange.start.charCodeAt(0) - 65;
      const endCol = searchRange.end.charCodeAt(0) - 65;
      const startRow = parseInt(searchRange.start.substring(1));
      const endRow = parseInt(searchRange.end.substring(1));
      
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const cellId = `${String.fromCharCode(65 + col)}${row}`;
          const cell = prevData[cellId];
          
          if (typeof cell.value === 'string' && cell.value.includes(findText)) {
            const newValue = cell.value.replaceAll(findText, replaceText);
            newData[cellId] = {
              ...cell,
              value: newValue,
              formatted: newValue,
            };
          }
        }
      }
      
      return newData;
    });
  }, [selectedRange, dimensions]);

  const value = {
    data,
    activeCell,
    selectedRange,
    editMode,
    dimensions,
    setActiveCell,
    setSelectedRange,
    setEditMode,
    setCellValue,
    setCellFormatting,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    removeDuplicates,
    findAndReplace
  };

  return (
    <SpreadsheetContext.Provider value={value}>
      {children}
    </SpreadsheetContext.Provider>
  );
};
