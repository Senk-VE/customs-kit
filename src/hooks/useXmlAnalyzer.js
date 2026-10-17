import { useState } from 'react';
function useXmlAnalyzer() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [declarations, setDeclarations] = useState([]);
  const [currentDeclaration, setCurrentDeclaration] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressValue, setProgressValue] = useState(0);
  async function handleFiles(files) {
    const fileList = Array.from(files);
    setSelectedFiles(fileList);
    setDeclarations([]);
    setProgressVisible(true);
    const parsedDeclarations = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setProgressText(`Обработка ${i + 1}/${fileList.length}`);
      setProgressValue(((i + 1) / fileList.length) * 100);
      try {
        const xmlText = await file.text();
        const declaration = parseXml(xmlText);
        if (declaration) {
          parsedDeclarations.push(declaration);
        }
      } catch (error) {
        console.error('Ошибка обработки файла:', file.name, error);
      }
    }
    setDeclarations(parsedDeclarations);
    setProgressText('Готово');
    setProgressValue(100);
    setTimeout(() => {
      setProgressVisible(false);
    }, 1000);
  }
  function parseXml(xmlText) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'application/xml');
    const parserError = xml.querySelector('parsererror');
    if (parserError) {
      console.error('Ошибка XML');
      return null;
    }
    return {
      company: getValue(xml, 'ShortName') || 'Субъект не найден',
      goods: findAll(xml, 'Stat_CUGoods').map((node) => readGood(node)),
    };
  }
  function readGood(node) {
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
      documents: readDocuments(node),
    };
  }
  function readDocuments(node) {
    const documents = [];
    const nodes = node.querySelectorAll('Document');
    nodes.forEach((doc) => {
      documents.push({
        code: getValue(doc, 'DocumentCode'),
        number: getValue(doc, 'DocumentNumber'),
        date: getValue(doc, 'DocumentDate'),
      });
    });
    return documents;
  }
  function getValue(node, tag) {
    const element = node.querySelector(tag);
    return element ? element.textContent.trim() : '';
  }
  function findAll(node, tag) {
    return Array.from(node.querySelectorAll(tag));
  }
  function openModal(declaration) {
    setCurrentDeclaration(declaration);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setCurrentDeclaration(null);
  }
  function clearAnalyzer() {
    setSelectedFiles([]);
    setDeclarations([]);
    setCurrentDeclaration(null);
    setModalOpen(false);
    setProgressVisible(false);
    setProgressText('');
    setProgressValue(0);
  }
  return {
    selectedFiles,
    declarations,
    currentDeclaration,
    modalOpen,
    progressVisible,
    progressText,
    progressValue,
    handleFiles,
    openModal,
    closeModal,
    clearAnalyzer,
  };
}
export default useXmlAnalyzer;
