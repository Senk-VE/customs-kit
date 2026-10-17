import { useState } from 'react';
import calculateCurrency from '../utils/currencyCalculator';

function useCurrencyConverter() {
  const [selectedDate, setSelectedDate] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');

  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState(null);

  function handleAdd() {
    if (!amount) {
      return;
    }
    const newItem = {
      amount: Number(amount),
      currency,
    };

    setItems((prev) => [...prev, newItem]);

    setAmount('');
  }

  function handleClear() {
    setItems([]);
    setTotals(null);
    setAmount('');
  }
  async function handleCalculate() {
    if (!selectedDate) {
      alert('Выберите дату курса валют.');
      return;
    }

    try {
      const result = await calculateCurrency(items, selectedDate);
      setTotals(result);
    } catch (error) {
      alert(error.message);
    }
  }
  return {
    selectedDate,
    setSelectedDate,

    amount,
    setAmount,

    currency,
    setCurrency,

    items,
    totals,

    handleAdd,
    handleClear,
    handleCalculate,
  };
}
export default useCurrencyConverter;
