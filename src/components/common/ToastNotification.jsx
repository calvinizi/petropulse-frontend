import React, { useState, useEffect, useCallback } from 'react';
import { X, Bell, AlertCircle, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import './ToastNotification.css';

const ToastNotification = (props) => {
  const [isExiting, setIsExiting] = useState(false);
  const duration = props.duration || 10000;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      props.onClose();
    }, 300);
  }, [props]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  // Get icon and class based on notification type
  const getNotificationConfig = (type) => {
    switch (type) {
      case 'overdue':
        return {
          icon: <AlertCircle className="toast-icon" />,
          className: 'toast-overdue'
        };
      case 'downtime':
        return {
          icon: <AlertTriangle className="toast-icon" />,
          className: 'toast-downtime'
        };
      case 'assigned':
        return {
          icon: <Bell className="toast-icon" />,
          className: 'toast-assigned'
        };
      case 'pm_due':
        return {
          icon: <Clock className="toast-icon" />,
          className: 'toast-pm-due'
        };
      case 'done':
        return {
          icon: <CheckCircle className="toast-icon" />,
          className: 'toast-done'
        };
      default:
        return {
          icon: <Bell className="toast-icon" />,
          className: 'toast-default'
        };
    }
  };

  const config = getNotificationConfig(props.notification.type);

  return (
    <div className={`toast-notification ${config.className} ${isExiting ? 'toast-exiting' : ''}`}>
      {/* Icon */}
      <div className="toast-icon-wrapper">
        {config.icon}
      </div>

      {/* Content */}
      <div className="toast-content">
        <h4 className="toast-title">{props.notification.title}</h4>
        <p className="toast-message">{props.notification.message}</p>
        <p className="toast-time">
          {new Date(props.notification.createdAt).toLocaleTimeString()}
        </p>
      </div>

      <button onClick={handleClose} className="toast-close-btn">
        <X className="toast-close-icon" />
      </button>

      <div className="toast-progress-bar">
        <div 
          className="toast-progress-fill"
          style={{ animation: `shrink ${duration}ms linear forwards` }}
        />
      </div>
    </div>
  );
};

export default ToastNotification;