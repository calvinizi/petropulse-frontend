import ReactDOM from 'react-dom';
import './Backdrop.css';

const Backdrop = (props) => {
  if (typeof document === 'undefined') return null;
  const hook = document.getElementById('backdrop-hook');

  return ReactDOM.createPortal(
    <div className="backdrop" onClick={props.onClick}></div>,
    hook
  );
};

export default Backdrop;