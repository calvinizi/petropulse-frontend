import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Eye } from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorModal from '../../components/common/ErrorModal';

import { useHttpClient } from '../../hooks/HttpHook';
import { useLogin } from '../../context/AuthContext';
import './AuditLogList.css';

const AuditLogList = () => {
  const navigate = useNavigate();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { token, role } = useLogin();

  const [auditLogs, setAuditLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (role !== 'Admin') {
      navigate('/');
      return;
    }

    const fetchAuditLogs = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/audit-logs`,
          'GET',
          null,
          { Authorization: 'Bearer ' + token }
        );
        setAuditLogs(responseData.auditLogs);
      } catch (err) {}
    };
    fetchAuditLogs();
  }, [sendRequest, token, role, navigate]);

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}

      <div className="animate-fade-in">
        <div className="page-header">
          <div className='home-audit'>
            <h2>Audit Logs</h2>
            <p style={{color:'#64748b'}}>Track all system activities and changes</p>
          </div>
        </div>

        <div className="flex-row">
          <div style={{flex:1}}>
            <Input 
              placeholder="Search logs by action, entity, or user..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" icon={Filter}>Filter</Button>
        </div>

        <Card className="audit-table-container" style={{padding: "0"}}>
          <table className="audit-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>User</th>
                <th>Date</th>
                <th style={{textAlign:'right'}}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className={`audit-action-badge ${log.action.split(' ')[0].toLowerCase()}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.entity}</td>
                    <td className="monospace-text">{log.entityId}</td>
                    <td>
                      <div className="audit-user-cell">
                        <div className="audit-user-avatar">
                          {log.user?.name.charAt(0) || "S"}
                        </div>
                        <span>{log.user?.name || "System"} <span className="text-muted">({log.user?.id || ""})</span></span>
                      </div>
                    </td>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td style={{textAlign: 'right'}}>
                        <button 
                          className="icon-btn view" 
                          onClick={() => navigate(`/audit-logs/${log.id}`)}
                          title="View Log Details"
                        >
                          <Eye size={18}/>
                        </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{textAlign:'center', padding:'2rem', color:'#64748b'}}>
                    No audit logs found.
                  </td>
                </tr>
              )}   
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
};

export default AuditLogList;