import { fetchExchangeRate } from '../services/nbrbApi';

function round2(value) {
  return Number((Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2));
}

async function calculateCurrency(items, date) {
  let totalBYN = 0;

  const eurRate = await fetchExchangeRate('EUR', date);
  const usdRate = await fetchExchangeRate('USD', date);

  if (!eurRate || !usdRate) {
    throw new Error('Ошибка получения курса EUR/USD');
  }

  for (const item of items) {
    const rate = await fetchExchangeRate(item.currency, date);

    if (!rate) continue;

    const byn = round2(item.amount * rate);

    totalBYN = round2(totalBYN + byn);
  }

  const totalEUR = round2(totalBYN / eurRate);
  const totalUSD = round2(totalBYN / usdRate);

  return {
    totalBYN,
    totalEUR,
    totalUSD,
  };
}

export default calculateCurrency;
