import React, { forwardRef } from 'react';
import "./InSelect.css";

const Input = forwardRef((props, ref) => (
  <div className="input-group">
    {props.label && <label className="form-label">{props.label}</label>}
    <input 
      id={props.id}
      readOnly={props.readOnly}
      ref={ref || props.ref}
      className="form-control"
      type={props.type || 'text'}
      placeholder={props.placeholder}
      value={props.value}
      onChange={props.onChange}
      {...props}
    />
  </div>
));

Input.displayName = 'Input';

export default Input;