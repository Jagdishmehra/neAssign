export const evaluateFormula = (formula, data) => {
  if (!formula) return "";

  try {
    // Parse formula to identify function and arguments
    const formulaUpper = formula.toUpperCase();

    // Mathematical functions
    if (formulaUpper.startsWith("SUM(")) {
      return evaluateSum(formula, data);
    } else if (formulaUpper.startsWith("AVERAGE(")) {
      return evaluateAverage(formula, data);
    } else if (formulaUpper.startsWith("MAX(")) {
      return evaluateMax(formula, data);
    } else if (formulaUpper.startsWith("MIN(")) {
      return evaluateMin(formula, data);
    } else if (formulaUpper.startsWith("COUNT(")) {
      return evaluateCount(formula, data);
    }

    // Data quality functions
    else if (formulaUpper.startsWith("TRIM(")) {
      return evaluateTrim(formula, data);
    } else if (formulaUpper.startsWith("UPPER(")) {
      return evaluateUpper(formula, data);
    } else if (formulaUpper.startsWith("LOWER(")) {
      return evaluateLower(formula, data);
    }

    // Cell reference or direct calculation
    else {
      // Replace cell references with their values
      const withValues = replaceReferences(formula, data);
      // Use Function constructor to safely evaluate the expression
      return new Function(`return ${withValues}`)();
    }
  } catch (error) {
    console.error("Formula evaluation error:", error);
    return "#ERROR!";
  }
};

// Helper to extract cell range from a function argument
const extractRange = (arg) => {
  const rangeMatch = arg.match(/([A-Z]+[0-9]+):([A-Z]+[0-9]+)/);
  if (rangeMatch) {
    const [, start, end] = rangeMatch;
    return { start, end };
  }
  return null;
};

// Helper to get values from a range of cells
const getCellRangeValues = (range, data) => {
  const values = [];
  const startCol = range.start.charCodeAt(0) - 65;
  const endCol = range.end.charCodeAt(0) - 65;
  const startRow = parseInt(range.start.substring(1));
  const endRow = parseInt(range.end.substring(1));

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellId = `${String.fromCharCode(65 + col)}${row}`;
      const cellValue = data[cellId]?.value;

      // Only include numeric values
      if (
        cellValue !== "" &&
        cellValue !== undefined &&
        !isNaN(Number(cellValue))
      ) {
        values.push(Number(cellValue));
      }
    }
  }

  return values;
};

// Extract arguments from a function formula
const extractArgs = (formula) => {
  const argsMatch = formula.match(/\((.+)\)/);
  if (!argsMatch) return [];

  const argsStr = argsMatch[1];
  return argsStr.split(",").map((arg) => arg.trim());
};

// Replace cell references with their values
const replaceReferences = (formula, data) => {
  let result = formula;

  // Regular expression to match cell references (e.g., A1, B2)
  const cellRefRegex = /([A-Z]+[0-9]+)/g;

  // Replace each cell reference with its value
  result = result.replace(cellRefRegex, (match) => {
    const cellValue = data[match]?.value;
    if (cellValue === undefined) return 0;
    if (cellValue === "") return 0;
    if (!isNaN(Number(cellValue))) return Number(cellValue);
    return `"${cellValue}"`;
  });

  return result;
};

// Mathematical function implementations
const evaluateSum = (formula, data) => {
  const args = extractArgs(formula);
  let sum = 0;

  args.forEach((arg) => {
    const range = extractRange(arg);
    if (range) {
      const values = getCellRangeValues(range, data);
      sum += values.reduce((acc, val) => acc + val, 0);
    } else {
      // Single cell reference
      const cellValue = data[arg]?.value;
      if (cellValue !== "" && !isNaN(Number(cellValue))) {
        sum += Number(cellValue);
      }
    }
  });

  return sum;
};

const evaluateAverage = (formula, data) => {
  const args = extractArgs(formula);
  let sum = 0;
  let count = 0;

  args.forEach((arg) => {
    const range = extractRange(arg);
    if (range) {
      const values = getCellRangeValues(range, data);
      sum += values.reduce((acc, val) => acc + val, 0);
      count += values.length;
    } else {
      // Single cell reference
      const cellValue = data[arg]?.value;
      if (cellValue !== "" && !isNaN(Number(cellValue))) {
        sum += Number(cellValue);
        count++;
      }
    }
  });

  return count > 0 ? sum / count : 0;
};

const evaluateMax = (formula, data) => {
  const args = extractArgs(formula);
  let values = [];

  args.forEach((arg) => {
    const range = extractRange(arg);
    if (range) {
      values = [...values, ...getCellRangeValues(range, data)];
    } else {
      // Single cell reference
      const cellValue = data[arg]?.value;
      if (cellValue !== "" && !isNaN(Number(cellValue))) {
        values.push(Number(cellValue));
      }
    }
  });

  return values.length > 0 ? Math.max(...values) : 0;
};

const evaluateMin = (formula, data) => {
  const args = extractArgs(formula);
  let values = [];

  args.forEach((arg) => {
    const range = extractRange(arg);
    if (range) {
      values = [...values, ...getCellRangeValues(range, data)];
    } else {
      // Single cell reference
      const cellValue = data[arg]?.value;
      if (cellValue !== "" && !isNaN(Number(cellValue))) {
        values.push(Number(cellValue));
      }
    }
  });

  return values.length > 0 ? Math.min(...values) : 0;
};

const evaluateCount = (formula, data) => {
  const args = extractArgs(formula);
  let count = 0;

  args.forEach((arg) => {
    const range = extractRange(arg);
    if (range) {
      count += getCellRangeValues(range, data).length;
    } else {
      // Single cell reference
      const cellValue = data[arg]?.value;
      if (cellValue !== "" && !isNaN(Number(cellValue))) {
        count++;
      }
    }
  });

  return count;
};

// Data quality function implementations
const evaluateTrim = (formula, data) => {
  const args = extractArgs(formula);
  if (args.length === 0) return "";

  const cellRef = args[0];
  const cellValue = data[cellRef]?.value;

  return typeof cellValue === "string" ? cellValue.trim() : cellValue;
};

const evaluateUpper = (formula, data) => {
  const args = extractArgs(formula);
  if (args.length === 0) return "";

  const cellRef = args[0];
  const cellValue = data[cellRef]?.value;

  return typeof cellValue === "string" ? cellValue.toUpperCase() : cellValue;
};

const evaluateLower = (formula, data) => {
  const args = extractArgs(formula);
  if (args.length === 0) return "";

  const cellRef = args[0];
  const cellValue = data[cellRef]?.value;

  return typeof cellValue === "string" ? cellValue.toLowerCase() : cellValue;
};
