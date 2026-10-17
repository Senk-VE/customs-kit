function SecondaryButton({ children, onClick }) {
  return (
    <button className="secondary-button" onClick={onClick}>
      {children}
    </button>
  );
}

export default SecondaryButton;
