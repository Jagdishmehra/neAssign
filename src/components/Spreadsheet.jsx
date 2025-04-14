import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSpreadsheet } from '../context/SpreadsheetContext';
import Cell from './Cell';
import './Spreadsheet.css';

const Spreadsheet = () => {
  const {
    dimensions,
    activeCell,
    setActiveCell,
    setSelectedRange,
    selectedRange
  } = useSpreadsheet();

  const [isDragging, setIsDragging] = useState(false);
  const spreadsheetRef = useRef(null);
  const headerRowRef = useRef(null);
  const headerColRef = useRef(null);
  const contentRef = useRef(null);


  useEffect(() => {
    const content = contentRef.current;
    const headerRow = headerRowRef.current;
    const headerCol = headerColRef.current;

    if (!content || !headerRow || !headerCol) return;

    const handleScroll = () => {
      requestAnimationFrame(() => {
        headerRow.scrollLeft = content.scrollLeft;
        headerCol.scrollTop = content.scrollTop;
      });
    };

    content.addEventListener('scroll', handleScroll);
    return () => content.removeEventListener('scroll', handleScroll);
  }, []);


  const isCellSelected = useCallback((cellId) => {
    if (!selectedRange.start || !selectedRange.end) return false;
    
    const start = selectedRange.start;
    const end = selectedRange.end;
    
    const startCol = start.charCodeAt(0) - 65;
    const endCol = end.charCodeAt(0) - 65;
    const startRow = parseInt(start.substring(1));
    const endRow = parseInt(end.substring(1));
    
    const cellCol = cellId.charCodeAt(0) - 65;
    const cellRow = parseInt(cellId.substring(1));
    
    return (
      cellCol >= Math.min(startCol, endCol) &&
      cellCol <= Math.max(startCol, endCol) &&
      cellRow >= Math.min(startRow, endRow) &&
      cellRow <= Math.max(endRow, endRow)
    );
  }, [selectedRange]);


  const handleMouseDown = useCallback((cellId) => {
    setActiveCell(cellId);
    setSelectedRange({ start: cellId, end: cellId });
    setIsDragging(true);
  }, [setActiveCell, setSelectedRange]);

  const handleMouseOver = useCallback((cellId) => {
    if (isDragging && activeCell) {
      setSelectedRange({ start: activeCell, end: cellId });
    }
  }, [isDragging, activeCell, setSelectedRange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);


  const renderColumnHeaders = useMemo(() => {
    return (
      <>
        <div className="corner-header"></div>
        {Array.from({ length: dimensions.cols }, (_, col) => (
          <div key={`col-${col}`} className="column-header">
            {String.fromCharCode(65 + col)}
          </div>
        ))}
      </>
    );
  }, [dimensions.cols]);


  const renderRowHeaders = useMemo(() => {
    return Array.from({ length: dimensions.rows }, (_, row) => (
      <div key={`row-${row}`} className="row-header">
        {row + 1}
      </div>
    ));
  }, [dimensions.rows]);


  const renderCells = useMemo(() => {
    return Array.from({ length: dimensions.rows }, (_, row) => (
      <div key={`row-${row}`} className="spreadsheet-row">
        {Array.from({ length: dimensions.cols }, (_, col) => {
          const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
          return (
            <Cell
              key={cellId}
              cellId={cellId}
              onMouseDown={() => handleMouseDown(cellId)}
              onMouseOver={() => handleMouseOver(cellId)}
              isSelected={isCellSelected(cellId)}
              isActive={activeCell === cellId}
            />
          );
        })}
      </div>
    ));
  }, [dimensions, activeCell, handleMouseDown, handleMouseOver, isCellSelected]);

  return (
    <div className="spreadsheet-container" ref={spreadsheetRef}>
      <div className="header-row" ref={headerRowRef}>
        {renderColumnHeaders}
      </div>
      <div className="spreadsheet-body">
        <div className="header-column" ref={headerColRef}>
          {renderRowHeaders}
        </div>
        <div className="spreadsheet-content" ref={contentRef}>
          {renderCells}
        </div>
      </div>
    </div>
  );
};

export default Spreadsheet;
