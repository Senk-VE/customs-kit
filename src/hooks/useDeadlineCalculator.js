import { useState } from 'react';
import calculateDeadline from '../utils/deadlineCalculator';

function useDeadlineCalculator() {
  const [selectedDate, setSelectedDate] = useState('');
  const [result, setResult] = useState(null);

  function handleCalculate() {
    if (!selectedDate) {
      setResult(null);
      return;
    }

    const calculation = calculateDeadline(selectedDate);
    setResult(calculation);
  }

  return {
    selectedDate,
    setSelectedDate,
    result,
    handleCalculate,
  };
}

export default useDeadlineCalculator;
