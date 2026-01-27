import React, { useRef } from "react";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import "./SideDrawer.css";

const SideDrawer = (props) => {
  const nodeRef = useRef(null);

  const content = (
    <CSSTransition
      in={props.show}
      timeout={300}
      classNames="slide-in-left"
      mountOnEnter
      unmountOnExit
      nodeRef={nodeRef}
    >
      <aside className="side-drawer" ref={nodeRef} onClick={props.onClick}>
        {props.children}
      </aside>
    </CSSTransition>
  );

  // Safely check for document
  if (typeof document === 'undefined') return null;
  const hook = document.getElementById("drawer-hook") || document.body;

  return ReactDOM.createPortal(content, hook);
};

export default SideDrawer;