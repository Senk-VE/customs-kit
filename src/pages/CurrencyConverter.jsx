import ContentPanel from '../components/Layout/ContentPanel';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import SecondaryButton from '../components/UI/SecondaryButton';
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
        max={new Date().toISOString().split('T')[0]}
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      <Input
        type="text"
        className="currency-amount"
        placeholder="Введите сумму"
        inputMode="decimal"
        value={amount}
        onChange={(e) => {
          let value = e.target.value;

          value = value.replace(',', '.');

          value = value.replace(/[^\d.]/g, '');

          const parts = value.split('.');
          if (parts.length > 2) {
            value = `${parts[0]}.${parts.slice(1).join('')}`;
          }

          if (value.includes('.')) {
            const [integerPart, decimalPart] = value.split('.');
            value = `${integerPart}.${decimalPart.slice(0, 2)}`;
          }

          setAmount(value);
        }}
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
        <SecondaryButton onClick={handleCalculate}>Рассчитать</SecondaryButton>
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
          <div className="total-byn">
            Итого: {totals.totalBYN.toFixed(2)} BYN
          </div>

          <div className="total-eur">
            Итого: {totals.totalEUR.toFixed(2)} EUR
          </div>

          <div className="total-usd">
            Итого: {totals.totalUSD.toFixed(2)} USD
          </div>
        </div>
      )}
    </ContentPanel>
  );
}

export default CurrencyConverter;
