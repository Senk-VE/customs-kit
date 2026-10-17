function Input({ type = 'text', className = '', ...props }) {
  return <input className={className} type={type} {...props}></input>;
}

export default Input;
