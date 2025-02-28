import { useState } from 'react'
import './App.css'
import Spreadsheet from './components/Spreadsheet'
import Toolbar from './components/Toolbar'
import FormulaBar from './components/FormulaBar'
import { SpreadsheetProvider } from './context/SpreadsheetContext'

function App() {
  return (
    <div className="spreadsheet-app">
      <SpreadsheetProvider>
        <Toolbar />
        <FormulaBar />
        <Spreadsheet />
      </SpreadsheetProvider>
    </div>
  )
}

export default App
