import ContentPanel from '../components/Layout/ContentPanel';
import useDeadlineCalculator from '../hooks/useDeadlineCalculator';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

function DeadlineCalculator() {
  const { selectedDate, setSelectedDate, result, handleCalculate } =
    useDeadlineCalculator();

  return (
    <ContentPanel>
      <div>
        <h1>Выберите дату поступления:</h1>

        <Input
          type="date"
          id="dateInput"
          min="2024-01-01"
          max="2026-12-21"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <div className="button-container">
          <Button onClick={handleCalculate}>Подтвердить</Button>
        </div>

        <div className="result">
          {result && (
            <>
              <div> Выбранная дата: {result.selectedDate}</div>
              <div> Срок подачи: {result.deadlineDate}</div>
            </>
          )}
        </div>
      </div>
    </ContentPanel>
  );
}

export default DeadlineCalculator;
