import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Bell, Trash2, CheckCircle } from 'lucide-react';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Modal from '../../../components/common/Modal';
import ErrorModal from '../../../components/common/ErrorModal';
import { useHttpClient } from '../../../hooks/HttpHook';
import { useLogin } from '../../../context/AuthContext';

import { formatDistanceToNow } from 'date-fns';
import './NotificationDetail.css';

const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { token } = useLogin();
  const [notification, setNotification] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/notifications/${id}`,
          'GET',
          null,
          { Authorization: 'Bearer ' + token }
        );
        setNotification(responseData.notification);
        if (!responseData.notification.read) {
          await sendRequest(
            `${process.env.REACT_APP_BACKEND_URL}/notifications/${id}/read`,
            'PATCH',
            null,
            { Authorization: 'Bearer ' + token }
          );
        }
      } catch (err) {}
    };
    fetchNotification();
  }, [id, sendRequest, token]);

  const showDeleteWarningHandler = () => {
    setShowDeleteModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowDeleteModal(false);
  };

  const confirmDeleteHandler = async () => {
      try {
        await sendRequest(
            `${process.env.REACT_APP_BACKEND_URL}/notifications/${id}`,
            'DELETE',
            null,
            { Authorization: 'Bearer ' + token }
          );

        setShowDeleteModal(false);  
        navigate('/settings');
      } catch (err) {}

  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading ? <LoadingSpinner asOverlay /> : null}

      <Modal 
          show={showDeleteModal}
          onCancel={cancelDeleteHandler}
          header="Are you sure?" 
          footer={
            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%'}}>
              <Button variant="secondary" onClick={cancelDeleteHandler}>
                CANCEL
              </Button>
              <Button 
                onClick={confirmDeleteHandler}
                style={{backgroundColor: '#dc2626', color: 'white'}}
              >
                DELETE
              </Button>
            </div>
          }
        >
        <p>
          Do you want to proceed and delete <strong>{notification?.title}</strong>? 
          Please note that this action cannot be undone.
        </p>
      </Modal>
      
      <div className="animate-fade-in">
        <div className="notif-page-header">
           <button onClick={() => navigate('/settings/notifications',  { state: { refetch: true } })} className="back-btn">
             <ChevronLeft size={20} />
             <span>Back to Notifications</span>
           </button>
           
           <div className="notif-actions">
             <Button variant="danger" icon={Trash2} onClick={showDeleteWarningHandler}>Delete</Button>
           </div>
        </div>

        {notification && (
            <div className="notif-content-card">
                <div className="notif-top-bar">
                    <div className={`icon-circle ${notification.type?.toLowerCase() || 'info'}`}>
                        <Bell size={24} />
                    </div>
                    <div className="notif-meta">
                        <h2>{notification.title}</h2>
                        <div className="notif-time-row">
                            <Clock size={14} />
                            <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                            {notification.read && (
                                <span className="read-badge"><CheckCircle size={12}/> Read</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="notif-body">
                    <p>{notification.message}</p>
                </div>
            </div>
        )}
      </div>
    </>
  );
};

export default NotificationDetail;