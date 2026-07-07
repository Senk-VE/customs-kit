export const getCurrency = () => {
  const dateEl = document.getElementById('dateCurrency');
  const rateEl = document.getElementById('rate');

  if (!dateEl || !rateEl) return;

  const date = dateEl.value;

  if (!date) {
    alert('Пожалуйста, выберите дату!');
    return;
  }

  const formattedDate = new Date(date).toISOString().split('T')[0];

  const url = `https://api.nbrb.by/exrates/rates/431?ondate=${formattedDate}&periodicity=0`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data?.Cur_OfficialRate) {
        rateEl.textContent = `Курс доллара к белорусскому рублю на ${formattedDate}: ${data.Cur_OfficialRate}`;
      } else {
        rateEl.textContent = 'Курс не найден';
      }
    })
    .catch((err) => {
      rateEl.textContent = `Ошибка: ${err}`;
    });
};

window.getCurrency = getCurrency;
