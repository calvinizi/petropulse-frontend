import React, { useState, useCallback } from 'react';
import ToastNotification from './ToastNotification';
import { useNotifications } from '../../hooks/useSocket'
import './ToastContainer.css';

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  // Handle new notifications from Socket.IO
  const handleNewNotification = useCallback((notification) => {
    // Add unique ID to notification
    const toastNotification = {
      ...notification,
      id: notification._id || Date.now(),
    };

    setToasts((prev) => [...prev, toastNotification]);
  }, []);

  // Use the socket hook to listen for notifications
  const { isConnected } = useNotifications(handleNewNotification);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="toast-connection-status">
          Reconnecting to notifications...
        </div>
      )}

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            notification={toast}
            onClose={() => removeToast(toast.id)}
            duration={10000}
          />
        ))}
      </div>
    </>
  );
};

export default ToastContainer;