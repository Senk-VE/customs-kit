let results = [];

const amountInput = document.getElementById('amount');
const currencySelect = document.getElementById('currencySelect');
const resultContainer = document.getElementById('resultContainer');
const addButton = document.getElementById('addButton');
const clearButton = document.getElementById('clearButton');
const dateInputConverter = document.getElementById('dateInputConverter');
const doneButton = document.getElementById('doneButton');

const currencyIds = {
  USD: 431,
  EUR: 451,
  RUR: 456,
  BYN: 1,
};

const rateCache = {};

async function fetchExchangeRate(currency, date) {
  if (currency === 'BYN') return 1;

  const key = `${currency}_${date}`;
  if (rateCache[key]) return rateCache[key];

  const formattedDate = new Date(date).toISOString().split('T')[0];
  const d = new Date(formattedDate);

  let currencyId = currencyIds[currency];

  if (currency === 'USD') {
    currencyId = d < new Date('2021-07-09') ? 145 : 431;
  }

  if (currency === 'EUR') {
    currencyId =
      d < new Date('2016-07-01') ? 19 : d < new Date('2021-07-09') ? 292 : 451;
  }

  if (currency === 'RUR') {
    currencyId =
      d < new Date('2016-07-01') ? 190 : d < new Date('2021-07-09') ? 298 : 456;
  }

  const url = `https://api.nbrb.by/exrates/rates/${currencyId}?ondate=${formattedDate}&periodicity=0`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();

    if (!data || !data.Cur_OfficialRate) return null;

    const rate =
      currency === 'RUR' ? data.Cur_OfficialRate / 100 : data.Cur_OfficialRate;

    rateCache[key] = rate;
    return rate;
  } catch (err) {
    console.error('API error:', err);
    return null;
  }
}

if (amountInput && addButton && resultContainer) {
  amountInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(',', '.');

    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
      value = value.slice(0, -1);
    }

    e.target.value = value;
  });

  addButton.addEventListener('click', () => {
    const amount = amountInput.value.trim();
    const currency = currencySelect.value;

    if (!amount) {
      alert('Введите сумму');
      return;
    }

    results.push({
      amount: parseFloat(amount),
      currency,
    });

    resultContainer.innerHTML = results
      .map((r) => `${r.amount} ${r.currency}`)
      .join(' + ');

    amountInput.value = '';
  });

  clearButton?.addEventListener('click', () => {
    results = [];
    resultContainer.innerHTML = '';
  });

  doneButton?.addEventListener('click', async () => {
    const date = dateInputConverter.value;

    if (!date) {
      alert('Выберите дату');
      return;
    }

    let totalBYN = 0;

    const eurRate = await fetchExchangeRate('EUR', date);
    const usdRate = await fetchExchangeRate('USD', date);

    if (!eurRate || !usdRate) {
      alert('Ошибка получения EUR/USD');
      return;
    }

    for (const item of results) {
      const rate = await fetchExchangeRate(item.currency, date);
      if (!rate) continue;

      totalBYN += item.amount * rate;
    }

    const totalEUR = totalBYN / eurRate;
    const totalUSD = totalBYN / usdRate;

    // 🔥 ВАЖНО: удаляем только старые итоги, но НЕ список
    const oldTotals = resultContainer.querySelectorAll(
      '.total-byn, .total-eur, .total-usd',
    );
    oldTotals.forEach((el) => el.remove());

    resultContainer.innerHTML += `
      <p class="total-byn">Итого: ${totalBYN.toFixed(2)} BYN</p>
      <p class="total-eur">Итого: ${totalEUR.toFixed(2)} EUR</p>
      <p class="total-usd">Итого: ${totalUSD.toFixed(2)} USD</p>
    `;
  });
}

window.currencyDebug = results;
