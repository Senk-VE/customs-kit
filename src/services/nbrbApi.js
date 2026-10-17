const currencyIds = {
  USD: 431,
  EUR: 451,
  RUR: 456,
  BYN: 1,
};

const rateCache = {};

export async function fetchExchangeRate(currency, date) {
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
    console.error(err);
    return null;
  }
}
