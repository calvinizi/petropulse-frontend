import React, { useRef } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import { X } from "lucide-react";

import "./Modal.css";
import Backdrop from "./Backdrop";

const ModalOverlay = (props) => {
  const content = (
    <div ref={props.nodeRef} className={`modal ${props.className || ''}`} style={props.style}>
      <header className={`modal-header ${props.headerClass || ''}`}>
        <h2>{props.header}</h2>
        <button 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex' }} 
            onClick={props.onCancel} 
        >
            <X size={20} />
        </button>
      </header>
      
      <form onSubmit={props.onSubmit ? props.onSubmit : (e) => e.preventDefault()}>
        <div className={`modal-content ${props.contentClass || ''}`}>
          {props.children}
        </div>
        
        {props.footer && (
            <footer className={`modal-footer ${props.footerClass || ''}`}>
            {props.footer}
            </footer>
        )}
      </form>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return ReactDOM.createPortal(content, document.getElementById("modal-hook") || document.body);
};

const Modal = (props) => {
  const nodeRef = useRef(null);
  
  return (
    <>
      {props.show && <Backdrop onClick={props.onCancel} />}
      <CSSTransition
        in={props.show}
        mountOnEnter
        unmountOnExit
        timeout={200}
        classNames="modal"
        nodeRef={nodeRef}
      >
        <ModalOverlay {...props} nodeRef={nodeRef} />
      </CSSTransition>
    </>
  );
};

export default Modal;