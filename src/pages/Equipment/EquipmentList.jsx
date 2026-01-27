import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Filter, Eye, Pencil, Trash2, TrendingUp
} from 'lucide-react';

import "./EquipmentList.css"

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorModal from '../../components/common/ErrorModal';
import Card from '../../components/common/Card';

import { useHttpClient } from '../../hooks/HttpHook';
import { useLogin } from '../../context/AuthContext';


const EquipmentList = (props) => {
  const navigate = useNavigate();

  const { sendRequest, isLoading, clearError, error } = useHttpClient();
  const { token, role } = useLogin();

  
  const [equipmentData, setEquipmentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
 
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/equipment`,
          "GET",
          null,
          {
            Authorization: 'Bearer ' + token
          }
        );
        
        setEquipmentData(responseData.equipments);
      } catch (error) {
        console.log(error);
      }
    };
    fetchEquipments();
  }, [sendRequest, token]);
  
  const showDeleteWarningHandler = (id, name) => {
    setEquipmentToDelete({ id, name });
    setShowConfirmModal(true);
  };
  
  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
    setEquipmentToDelete(null);
  };

  const confirmDeleteHandler = async () => {
    if (!equipmentToDelete) return;

    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/equipment/${equipmentToDelete.id}`,
        'DELETE',
        null,
        { Authorization: 'Bearer ' + token }
      );

      setEquipmentData(current => current.filter(item => item.id !== equipmentToDelete.id));
      
      setShowConfirmModal(false);
      setEquipmentToDelete(null);
    } catch (error) {
      console.log('Error deleting equipment:', error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/equipment/edit/${id}`);
  };

  const filteredData = equipmentData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.site.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          Do you want to proceed and delete <strong>{equipmentToDelete?.name}</strong>? 
          This will also delete all associated work orders. 
          Please note that this action cannot be undone.
        </p>
      </Modal>

      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <h2>Equipment Registry</h2>
            <p style={{color:'var(--text-muted)'}}>Manage all assets across sites</p>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
              {(role === "Admin" || role === "Supervisor") &&
              <>
                <Button 
                  variant="primary"  
                  icon={TrendingUp} 
                  onClick={() => navigate('/equipment/analysis')}
                >
                  Analyze All
                </Button>
                <Button icon={Plus} onClick={() => navigate('/equipment/new')}>
                  Add Equipment
                </Button>
                
              </>
              }
          </div>
        </div>

        <div className="flex-row">
          <div style={{flex:1}}>
            <Input
              id="equipment-search"
              placeholder="Search equipment..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" icon={Filter}>Filter</Button>
        </div>

        <Card className="equipment-table-container" style={{padding: '0'}}>
          <table className="equipment-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Site</th>
                <th>Status</th>
                <th>Health</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <p style={{fontWeight:500}}>{item.name}</p>
                      <p style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{item.tag}</p>
                    </td>
                    <td>{item.site.name}</td>
                    
                    <td><StatusBadge status={item.status} /></td>
                    <td>{item.health}%</td>
                    <td style={{textAlign: 'right'}}>
                      <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                        
                        <button 
                          style={{border:'none', background:'none', color:'var(--primary)', cursor:'pointer', padding:'4px'}} 
                          onClick={() => navigate(`/equipment/${item.id}`)}
                          title="View"
                        >
                          <Eye size={18} />
                        </button>

                        {role === "Admin" || role === "Supervisor" ? 
                        <>
                          <button 
                            style={{border:'none', background:'none', color:'#d97706', cursor:'pointer', padding:'4px'}} 
                            onClick={() => handleEdit(item.id)}
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>

                          <button 
                            style={{border:'none', background:'none', color:'#e11d48', cursor:'pointer', padding:'4px'}} 
                            onClick={() => showDeleteWarningHandler(item.id, item.name)}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                        : null
                        }
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{textAlign:'center', padding:'2rem', color:'var(--text-muted)'}}>
                    No equipment found.
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

export default EquipmentList;