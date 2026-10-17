import { useState } from 'react';

import ContentPanel from '../components/Layout/ContentPanel';
import FileUpload from '../components/UI/FileUpload';
import Button from '../components/UI/Button';

import useXmlExtractor from '../hooks/useXmlExtractor';
import XmlPreviewModal from '../components/UI/XmlPreviewModal';

function XmlExtractor() {
  const {
    files,
    xmlData,
    handleFilesSelected,
    handleClear,
    handleDownload,
    handleDownloadAll,
  } = useXmlExtractor();

  const [previewData, setPreviewData] = useState(null);

  return (
    <>
      <ContentPanel>
        <h1>Выберите XML</h1>

        <p className="desktop-hint">Или перетащите XML-файлы сюда</p>

        <div className="button-container">
          <FileUpload multiple onFilesSelected={handleFilesSelected} />

          {files.length > 0 && (
            <>
              <Button className="export-btn" onClick={handleDownloadAll}>
                📦 Скачать все
              </Button>

              <Button className="export-btn" onClick={handleClear}>
                Очистить
              </Button>
            </>
          )}
        </div>
      </ContentPanel>

      <div className="xml-extractor-results">
        {xmlData.map((item, index) => (
          <div className="xml-output" key={index}>
            <div className="xml-text">
              <div className="xml-reg">{item.regNumber}</div>

              <div className="xml-sender">{item.sender}</div>

              <div className="xml-info">
                Файлов: {item.files?.length || 0}
                {' · '}
                Размер: {item.totalSize?.toFixed(2) || '0.00'} MB
              </div>
            </div>

            <div className="xml-actions">
              <span
                className="icon-wrapper"
                title="Скачать"
                onClick={() => handleDownload(item)}
              >
                <img src="/customs-kit/download.png" className="icon-btn" />
              </span>

              <span
                className="icon-wrapper"
                title="Просмотр"
                onClick={() => setPreviewData(item)}
              >
                <img src="/customs-kit/zoom.png" className="icon-btn" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {previewData && (
        <XmlPreviewModal
          item={previewData}
          onClose={() => setPreviewData(null)}
          onDownload={handleDownload}
        />
      )}
    </>
  );
}

export default XmlExtractor;
