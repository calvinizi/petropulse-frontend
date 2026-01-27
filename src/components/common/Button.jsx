import "./Button.css";

const Button = (props) => {
  const className = `btn ${props.variant ? `btn-${props.variant}` : 'btn-primary'} ${props.size ? `btn-${props.size}` : ''} ${props.className || ''}`;
  return (
    <button 
      className={className} 
      onClick={props.onClick} 
      type={props.type || 'button'} 
      disabled={props.disabled}>
      {props.icon && <props.icon size={18} />}
      {props.children}
    </button>
  );
};

export default Button