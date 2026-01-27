import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Clock, Pencil, Trash2, Eye } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import './PMTemplateList.css';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorModal from '../../components/common/ErrorModal';

import { useHttpClient } from '../../hooks/HttpHook';
import { useLogin } from '../../context/AuthContext';
import Card from '../../components/common/Card';

const PMTemplateList = (props) => {
  const navigate = useNavigate();
  const [pmData, setPmData] = useState([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  

  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { token, role } = useLogin();

  useEffect(() => {
    const fetchPmTemplates = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/pm-templates`,
          "GET",
          null,
          { Authorization: 'Bearer ' + token }
        );
        setPmData(responseData.pmTemplates);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPmTemplates();
  }, [sendRequest, token]);

  const showDeleteWarningHandler = (id, title) => {
    setTemplateToDelete({ id, title });
    setShowConfirmModal(true);
  };

  
  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
    setTemplateToDelete(null);
  };

  const confirmDeleteHandler = async () => {
    if (!templateToDelete) return;

    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/pm-templates/${templateToDelete.id}`,
        'DELETE',
        null,
        { Authorization: 'Bearer ' + token }
      );

      setPmData(current => current.filter(item => item.id !== templateToDelete.id));
      
      setShowConfirmModal(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.log('Error deleting equipment:', error);
    }
  };

  return (
    <>
    <ErrorModal error={error} onClear={clearError} />    
    {isLoading ? <LoadingSpinner asOverlay /> : null}


    <Modal 
        show={showConfirmModal}
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
          Do you want to proceed and delete <strong>{templateToDelete?.title}</strong>? 
          This will also delete from all associated equipments. 
          Please note that this action cannot be undone.
        </p>
      </Modal>

      <div className="animate-fade-in">
        <div className="page-header">
          <div className="header-content">
            <div>
              <h2>PM Templates</h2>
              <p style={{color:'#64748b'}}>Automated maintenance schedules</p>
            </div>

            {role === "Admin" || role === "Supervisor" ? 
              <Button icon={Plus} onClick={() => navigate('/pm-templates/new')}>
                Create Template
              </Button>
              :
              null
            }
          </div>
        </div>

        <Card className="pm-template-table-container" style={{padding: "0"}}>
          <table className="pm-template-table">
            <thead>
              <tr>
                <th>Template Name</th>
                <th>Trigger Type</th>
                <th>Frequency</th>
                <th>Assigned Equipment</th>
                <th style={{textAlign:'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pmData.length > 0 ?
                pmData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <p style={{fontWeight:500}}>{item.title}</p>
                    <p style={{fontSize:'0.8rem', color:'#64748b'}}>{item.tag}</p>
                  </td>
                  <td>
                    <span className={`type-badge ${item.frequencyType}`}>
                      {item.frequencyType === 'Calendar' ? <Calendar size={14}/> : <Clock size={14}/>} 
                      {item.frequencyType}
                    </span>
                  </td>
                  <td>{item.frequencyValue} {item.frequencyType === 'Calendar' ? 'days' : 'hours'}</td>
                  <td>
                    {item.equipment && item.equipment.length > 0 ? (
                      <div style={{fontSize: '0.9rem'}}>
                        {item.equipment.slice(0, 3).map((eq, index) => (
                          <React.Fragment key={eq._id}>
                          <span key={eq._id}>
                            {eq.name}
                            {index < Math.min(item.equipment.length - 1, 2)}
                          </span>
                          <br />
                          </React.Fragment>
                        ))}
                        {item.equipment.length > 3 && (
                          <span style={{color: '#64748b'}}> +{item.equipment.length - 3} more</span>
                        )}
                      </div>
                    ) : (
                      <span style={{color: '#94a3b8', fontSize: '0.9rem'}}>No equipment assigned</span>
                    )}
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                    
                      <button 
                        className="icon-btn view" 
                        onClick={() => navigate(`/pm-templates/${item.id}`)}
                        title="View Details"
                      >
                        <Eye size={18}/>
                      </button>

                    {role === "Admin" || role === "Supervisor" ? 
                      <>
                        <button 
                          className="icon-btn edit" 
                          onClick={() => navigate(`/pm-templates/edit/${item.id}`)}
                          title="Edit Template"
                        >
                          <Pencil size={18}/>
                        </button>


                        <button 
                          className="icon-btn delete" 
                          onClick={() => showDeleteWarningHandler(item.id, item.title)}
                          title="Delete Template"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </>
                      : null
                      }
                    </div>
                  </td>
                </tr>
                
              )):
              <tr>
                    <td colSpan="5" style={{textAlign:'center', padding:'2rem', color:'#64748b'}}>
                      No templates found.
                    </td>
                </tr>
            }
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
};

export default PMTemplateList;