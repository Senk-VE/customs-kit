import ContentPanel from '../components/Layout/ContentPanel';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import useCurrencyConverter from '../hooks/useCurrencyConverter';

function CurrencyConverter() {
  const {
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
  } = useCurrencyConverter();

  return (
    <ContentPanel>
      <h1>Выберите дату курса валют:</h1>
      <Input
        type="date"
        min="2016-07-01"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      <Input
        type="text"
        className="currency-amount"
        placeholder="Введите сумму"
        inputMode="numeric"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <select
        className="currency-select"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
      >
        <option value="USD">USD (840)</option>
        <option value="EUR">EUR (978)</option>
        <option value="RUR">RUR (643)</option>
        <option value="BYN">BYN (933)</option>
      </select>
      <div className="button-container">
        <Button onClick={handleAdd}>Добавить</Button>
        <Button onClick={handleClear}>Очистить</Button>
        <Button onClick={handleCalculate}>Рассчитать</Button>
      </div>
      <div className="currency-list">
        {items.map((item, index) => (
          <span key={index} className="currency-item">
            {index > 0 && ' + '}
            {item.amount} {item.currency}
          </span>
        ))}
      </div>
      {totals && (
        <div className="currency-totals">
          <p className="total-byn">Итого: {totals.totalBYN.toFixed(2)} BYN</p>

          <p className="total-eur">Итого: {totals.totalEUR.toFixed(2)} EUR</p>

          <p className="total-usd">Итого: {totals.totalUSD.toFixed(2)} USD</p>
        </div>
      )}{' '}
    </ContentPanel>
  );
}

export default CurrencyConverter;
