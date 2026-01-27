import { forwardRef } from "react";
import "./InSelect.css";

const Select = forwardRef((props, ref) => (
  <div className="input-group">
    {props.label && <label className="form-label">{props.label}</label>}
    <select className="form-control" ref={ref} value={props.value} onChange={props.onChange}>
      {props.children}
    </select>
  </div>
));

export default Select