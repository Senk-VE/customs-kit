function parseSdXml(file) {
  return file.text().then((xmlText) => {
    const parser = new DOMParser();

    const xml = parser.parseFromString(xmlText, 'application/xml');

    const parserError = xml.querySelector('parsererror');

    if (parserError) {
      throw new Error('XML содержит ошибки');
    }

    const declaration = {
      company: getValue(xml, 'ShortName') || 'Субъект не найден',
      goods: [],
    };

    const goods = Array.from(xml.querySelectorAll('Stat_CUGoods'));

    goods.forEach((node) => {
      declaration.goods.push(parseGood(node));
    });

    return declaration;
  });
}

function parseGood(node) {
  return {
    number: getValue(node, 'GoodsNumeric'),
    code: getValue(node, 'GoodsTNVEDCode'),
    description: getValue(node, 'GoodsDescription'),

    liabilityDate: getValue(node, 'LiabilityDate'),

    net: getValue(node, 'NetWeightQuantity'),
    net2: getValue(node, 'NetWeightQuantity2'),
    gross: getValue(node, 'GrossWeightQuantity'),

    quantity: getValue(node, 'GoodsQuantity'),
    unit: getValue(node, 'MeasureUnitQualifierName'),

    invoice: getValue(node, 'InvoicedCost'),
    currency: getValue(node, 'CurrencyCode'),

    statistic: getValue(node, 'StatisticValueAmount'),

    dispatchCountry: getValue(node, 'DispatchCountryName'),
    originCountry: getValue(node, 'OriginCountryName'),
    destinationCountry: getValue(node, 'DestinationCountryName'),

    documents: parseDocuments(node),
  };
}

function parseDocuments(node) {
  return Array.from(node.querySelectorAll('Document')).map((doc) => ({
    code: getValue(doc, 'DocumentCode'),
    number: getValue(doc, 'DocumentNumber'),
    date: getValue(doc, 'DocumentDate'),
  }));
}

function getValue(node, tag) {
  const element = node.querySelector(tag);

  return element ? element.textContent.trim() : '';
}

export default parseSdXml;
