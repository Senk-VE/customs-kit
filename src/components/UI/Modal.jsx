function Modal({ children, onClose }) {
  return (
    <div
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-window">{children}</div>
    </div>
  );
}

export default Modal;
