import React from 'react';

// Use your existing common components
import Modal from './Modal';
import Button from './Button'; 

const ErrorModal = (props) => {
  return (
    <Modal
      onCancel={props.onClear}
      header="An Error Occurred!"
      show={!!props.error}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={props.onClear} variant="primary">
            Okay
            </Button>
        </div>
      }
    >
      <div style={{ padding: '1rem 0' }}>
        <p>{props.error}</p>
      </div>
    </Modal>
  );
};

export default ErrorModal;