function ContentPanel({ children, className = '', ...props }) {
  return (
    <section className={`content-panel ${className}`} {...props}>
      {children}
    </section>
  );
}

export default ContentPanel;
