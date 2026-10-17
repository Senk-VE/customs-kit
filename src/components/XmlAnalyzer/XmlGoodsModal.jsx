import Modal from '../UI/Modal';

function XmlGoodsModal({ declaration, onClose, onDownload }) {
  if (!declaration) return null;

  const differentNet = declaration.goods.some(
    (good) => Number(good.net) !== Number(good.net2),
  );

  return (
    <Modal onClose={onClose}>
      <div className="modal-header">
        <div>
          <div className="modal-title">
            {declaration.company || 'Субъект не найден'}
          </div>

          <div className="modal-summary">
            Товаров: {declaration.goods.length}
          </div>
        </div>

        <button className="modal-close" type="button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="modal-body">
        <table className="files-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Наименование</th>
              <th>Нетто/ед.</th>
              <th>Факт./нетто</th>
              <th>Стат./нетто</th>

              {differentNet && (
                <>
                  <th>Нетто2/ед.</th>
                  <th>Факт./нетто2</th>
                  <th>Стат./нетто2</th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {declaration.goods.map((good, index) => {
              const net = Number(good.net) || 0;
              const net2 = Number(good.net2) || 0;
              const quantity = Number(good.quantity) || 0;
              const invoice = Number(good.invoice) || 0;
              const statistic = Number(good.statistic) || 0;

              const netPerUnit = quantity ? (net / quantity).toFixed(2) : '-';

              const invoicePerNet = net ? (invoice / net).toFixed(2) : '-';

              const statisticPerNet = net ? (statistic / net).toFixed(2) : '-';

              return (
                <tr key={index}>
                  <td>{good.number || index + 1}</td>

                  <td>{good.description}</td>

                  <td>
                    {netPerUnit} кг/{good.unit}
                  </td>

                  <td>
                    {invoicePerNet} {good.currency}/кг
                  </td>

                  <td>{statisticPerNet} USD/кг</td>

                  {differentNet && (
                    <>
                      <td>
                        {net2 && quantity ? (net2 / quantity).toFixed(2) : '-'}{' '}
                        кг/{good.unit}
                      </td>

                      <td>
                        {net2 && invoice ? (invoice / net2).toFixed(2) : '-'}{' '}
                        {good.currency}/кг
                      </td>

                      <td>
                        {net2 && statistic
                          ? (statistic / net2).toFixed(2)
                          : '-'}{' '}
                        USD/кг
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="modal-footer">
        <button
          className="modal-download-btn"
          type="button"
          onClick={() => onDownload(declaration)}
        >
          📄 Скачать Excel
        </button>
      </div>
    </Modal>
  );
}

export default XmlGoodsModal;
