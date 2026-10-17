import monthAbbreviations from '../constants/months';
import { weekends, shiftedWorkdays } from '../constants/holidays';

function isWeekend(date) {
  const dayOfWeek = date.getDay();
  const isoDate = date.toISOString().split('T')[0];

  return (
    (dayOfWeek === 0 || dayOfWeek === 6 || weekends.includes(isoDate)) &&
    !shiftedWorkdays.includes(isoDate)
  );
}

function getDeadline(startDate) {
  let date = new Date(startDate);

  let workdayCount = 0;

  while (workdayCount < 7) {
    date.setDate(date.getDate() + 1);

    if (!isWeekend(date)) {
      workdayCount++;
    }
  }

  return date;
}

function calculateDeadline(dateInput) {
  if (!dateInput) {
    return null;
  }

  const date = new Date(dateInput);

  const monthAbbr = monthAbbreviations[date.getMonth()];

  const deadline = getDeadline(date);

  const deadlineMonthAbbr = monthAbbreviations[deadline.getMonth()];

  return {
    selectedDate: `${date.getDate()} ${monthAbbr} ${date.getFullYear()}`,

    deadlineDate: `${deadline.getDate()} ${deadlineMonthAbbr} ${deadline.getFullYear()}`,
  };
}

export default calculateDeadline;
