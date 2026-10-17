function Button({
  children,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  return (
    <button type={type} className={className} onClick={onClick} {...props}>
      {children}
    </button>
  );
}

export default Button;
