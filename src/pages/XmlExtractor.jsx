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
    progress,
    handleFilesSelected,
    handleClear,
    handleDownload,
    handleDownloadAll,
  } = useXmlExtractor();

  const [previewData, setPreviewData] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e) {
    e.preventDefault();

    const droppedFiles = [...e.dataTransfer.files].filter((f) =>
      f.name.toLowerCase().endsWith('.xml'),
    );

    if (droppedFiles.length) {
      handleFilesSelected(droppedFiles);
    }
  }

  return (
    <div className="xml-extractor-page">
      <ContentPanel
        className={dragOver ? 'drag-over-panel' : ''}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => {
          setDragOver(false);
        }}
        onDrop={(e) => {
          setDragOver(false);
          handleDrop(e);
        }}
      >
        <h1>Выберите XML</h1>

        <p className="desktop-hint">Или перетащите XML-файлы сюда</p>

        <div className="button-container">
          <FileUpload multiple onFilesSelected={handleFilesSelected} />

          <Button
            className="export-btn"
            disabled={files.length === 0}
            onClick={handleDownloadAll}
          >
            ⬇🗜️ Скачать все в Zip
          </Button>

          <Button
            className="export-btn"
            disabled={files.length === 0}
            onClick={handleClear}
          >
            Очистить
          </Button>
        </div>

        <div className="xml-progress-slot">
          <div className={`xml-progress ${progress.visible ? 'show' : ''}`}>
            <div className="xml-progress-text">{progress.text}</div>

            <div className="xml-progress-track">
              <div
                className="xml-progress-bar"
                style={{
                  width: `${progress.percent}%`,
                }}
              />
            </div>
          </div>
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
                <img
                  src="/customs-kit/download.png"
                  className="icon-btn"
                  alt="download"
                />
              </span>

              <span
                className="icon-wrapper"
                title="Просмотр"
                onClick={() => setPreviewData(item)}
              >
                <img
                  src="/customs-kit/zoom.png"
                  className="icon-btn"
                  alt="preview"
                />
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
    </div>
  );
}

export default XmlExtractor;
