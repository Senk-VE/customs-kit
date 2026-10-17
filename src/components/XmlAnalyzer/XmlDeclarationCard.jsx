function XmlDeclarationCard({ declaration, onOpen, onDownload }) {
  return (
    <div className="xml-output">
      <div className="xml-text">
        <div className="xml-reg">
          {declaration.company || 'Субъект не найден'}
        </div>

        <div className="xml-sender">
          Количество товаров: {declaration.goods.length}
        </div>
      </div>

      <div className="xml-actions">
        <span
          className="icon-wrapper"
          title="Скачать Excel"
          onClick={onDownload}
        >
          <img
            src="/customs-kit/download.png"
            className="icon-btn"
            alt="download"
          />
        </span>

        <span className="icon-wrapper" title="Просмотр" onClick={onOpen}>
          <img src="/customs-kit/zoom.png" className="icon-btn" alt="preview" />
        </span>
      </div>
    </div>
  );
}

export default XmlDeclarationCard;
