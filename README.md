# Google Sheets Clone

A web application that closely mimics the user interface and core functionalities of Google Sheets, focusing on mathematical and data quality functions, data entry, and key UI interactions.

![Google Sheets Clone Screenshot](screenshot.png)

## Features

### Spreadsheet Interface

- **Google Sheets-like UI**: Clean interface with toolbar, formula bar, and cell grid
- **Cell Selection**: Click and drag to select cell ranges
- **Formula Bar**: View and edit cell content and formulas
- **Cell Formatting**: Support for bold, italic, font size, and text color
- **Row & Column Management**: Add and delete rows and columns

### Mathematical Functions

- **SUM**: Calculates the sum of a range of cells
  ```
  =SUM(A1:A5)
  ```
- **AVERAGE**: Calculates the average of a range of cells
  ```
  =AVERAGE(B1:B10)
  ```
- **MAX**: Returns the maximum value from a range of cells
  ```
  =MAX(C1:C20)
  ```
- **MIN**: Returns the minimum value from a range of cells
  ```
  =MIN(D5:D15)
  ```
- **COUNT**: Counts the number of cells containing numerical values
  ```
  =COUNT(E1:E100)
  ```

### Data Quality Functions

- **TRIM**: Removes leading and trailing whitespace
  ```
  =TRIM(A1)
  ```
- **UPPER**: Converts text to uppercase
  ```
  =UPPER(B2)
  ```
- **LOWER**: Converts text to lowercase
  ```
  =LOWER(C3)
  ```
- **REMOVE_DUPLICATES**: Removes duplicate rows from a selection
- **FIND_AND_REPLACE**: Search and replace text within the spreadsheet

### Cell Dependencies

- Formulas automatically recalculate when referenced cells change
- Proper handling of cell dependencies in calculation chain

## Tech Stack

- **React**: Frontend library for building the user interface
- **CSS**: Styling with CSS variables for theme consistency
- **Context API**: State management across components
- **Vite**: Build tool for fast development

## Data Structure Design

### Cell Data Model

Each cell is represented as an object containing:
