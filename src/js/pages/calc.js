const monthAbbreviations = [
  'Янв', // Январь
  'Фев', // Февраль
  'Мар', // Март
  'Апр', // Апрель
  'Май', // Май
  'Июн', // Июнь
  'Июл', // Июль
  'Авг', // Август
  'Сен', // Сентябрь
  'Окт', // Октябрь
  'Ноя', // Ноябрь
  'Дек', // Декабрь
];

const weekends = [
  'Saturday',
  'Sunday',
  '2026-01-01',
  '2026-01-02',
  '2026-01-07',
  '2026-04-20',
  '2026-04-21',
  '2026-05-01',
  '2026-07-03',
  '2026-12-25', // 2026 год скорректировано
  '2025-12-26',
  '2025-12-25',
  '2025-11-07',
  '2025-07-04',
  '2025-07-03',
  '2025-05-09',
  '2025-05-01',
  '2025-04-29',
  '2025-04-28',
  '2025-01-07',
  '2025-01-06',
  '2025-01-02',
  '2025-01-01',
  '2024-12-25',
  '2024-11-08',
  '2024-11-07',
  '2024-07-03',
  '2024-05-14',
  '2024-05-13',
  '2024-05-09',
  '2024-05-01',
  '2024-03-08',
  '2024-01-02',
  '2024-01-01',
];

const shiftedWorkdays = [
  '2026-04-25', // Рабочий день за 20.04.2026
  '2025-12-20', // Рабочий день за 26.12.2025
  '2025-07-12', // Рабочий день за 04.07.2025
  '2025-04-26', // Рабочий день за 28.04.2025
  '2025-01-11', // Рабочий день с 06.01.2025
  '2024-11-16', // Рабочий день с пятницы 8 ноября
  '2024-05-18', // Рабочий день с понедельника 13 мая
];

const isWeekend = (date) => {
  const dayOfWeek = date.getDay();
  const isoDate = date.toISOString().split('T')[0];

  return (
    (dayOfWeek === 0 || dayOfWeek === 6 || weekends.includes(isoDate)) &&
    !shiftedWorkdays.includes(isoDate)
  );
};

const getDeadline = (startDate) => {
  let date = new Date(startDate);
  let workdayCount = 0;

  while (workdayCount < 7) {
    date.setDate(date.getDate() + 1);
    if (!isWeekend(date)) {
      workdayCount++;
    }
  }

  return date;
};

// ✔ FIX: защита от null + Vite загрузки
const displayDate = () => {
  const dateInputEl = document.getElementById('dateInput');
  const result = document.getElementById('result');

  if (!dateInputEl || !result) return;

  const dateInput = dateInputEl.value;

  if (dateInput) {
    const date = new Date(dateInput);

    const monthIndex = date.getMonth();
    const monthAbbr = monthAbbreviations[monthIndex];

    const deadline = getDeadline(date);
    const deadlineMonthAbbr = monthAbbreviations[deadline.getMonth()];

    result.innerHTML =
      `Выбранная дата: ${date.getDate()} ${monthAbbr} ${date.getFullYear()}<br>` +
      `Срок подачи: ${deadline.getDate()} ${deadlineMonthAbbr} ${deadline.getFullYear()}`;
  } else {
    result.textContent = 'Дата не выбрана';
  }
};

// ✔ FIX: чтобы работало через onclick в HTML
window.displayDate = displayDate;
