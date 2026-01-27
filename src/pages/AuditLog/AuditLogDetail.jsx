import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Clock, User, FileText, Database } from 'lucide-react';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorModal from '../../components/common/ErrorModal';
import { useHttpClient } from '../../hooks/HttpHook';
import { useLogin } from '../../context/AuthContext';
import './AuditLogDetail.css';

const AuditLogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { token, role } = useLogin();

  const [log, setLog] = useState(null);

  useEffect(() => {
    if (role !== 'Admin') {
      navigate('/');
      return;
    }

    const fetchLog = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/audit-logs/${id}`,
          'GET',
          null,
          { Authorization: 'Bearer ' + token }
        );
        setLog(responseData.auditLog);
      } catch (err) {}
    };
    fetchLog();
  }, [id, sendRequest, token, role, navigate]);

  if (!log && !isLoading) {
    return <div className="p-8 text-center">Log not found</div>;
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}

      <div className="animate-fade-in">
        <div className="page-top-left">
            <button
              className='back-btn'
              aria-label='Go back'
              onClick={() => navigate('/audit-logs')}
            >
              <ChevronLeft size={28} />
            </button>
            <div className="title-area">
              <h2>Audit Log Detail</h2>
            </div>
          
        </div>

        {log && (
          <div className="audit-detail-layout">
            <div className="detail-card header-card">
              <div className="header-icon-box">
                <Shield size={32} />
              </div>
              <div className="header-content">
                <h3>{log.action}</h3>
                <div className="meta-row">
                    <span className="meta-item"><Clock size={14}/> {new Date(log.createdAt).toLocaleString()}</span>
                    <span className="meta-item"><Database size={14}/> ID: {log.id}</span>
                </div>
              </div>
            </div>

            <div className="audit-grid">
                <div className="detail-card">
                    <h3>User Information</h3>
                    <div className="info-row">
                        <User size={18} className="text-blue" />
                        <div>
                            <span className="label">Performed By</span>
                            <p>{log.user?.name}</p>
                            <p className="sub-text">ID: {log.user?.id}</p>
                            <p className="sub-text">Role: {log.user?.role}</p>
                        </div>
                    </div>
                    <div className="info-row">
                        <Clock size={18} className="text-gray" />
                        <div>
                            <span className="label">Timestamp</span>
                            <p>{new Date(log.createdAt).toString()}</p>
                        </div>
                    </div>
                </div>

                <div className="detail-card">
                    <h3>Target Entity</h3>
                    <div className="info-row">
                        <FileText size={18} className="text-orange" />
                        <div>
                            <span className="label">Entity Type</span>
                            <p>{log.entity}</p>
                        </div>
                    </div>
                    <div className="info-row">
                        <Database size={18} className="text-purple" />
                        <div>
                            <span className="label">Entity ID</span>
                            <p className="monospace">{log.entityId}</p>
                        </div>
                    </div>
                </div>

                {/* Details (in JSON) */}
                <div className="detail-card full-width">
                    <h3>Change Details</h3>
                    <div className="json-box">
                        <pre>{JSON.stringify(log.details || log.changes, null, 2)}</pre>
                    </div>
                </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
};

export default AuditLogDetail;