import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Filter, Eye, Pencil, Trash2 
} from 'lucide-react';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorModal from '../../components/common/ErrorModal';
import Modal from '../../components/common/Modal';

import { useHttpClient } from '../../hooks/HttpHook';
import { useLogin } from '../../context/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import './WorkOrderList.css';
import Card from '../../components/common/Card';

const WorkOrderList = (props) => {
  const navigate = useNavigate();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { token, role } = useLogin();
  const { currentUser } = useCurrentUser();

  const [workOrders, setWorkOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [workOrderToDelete, setWorkOrderToDelete] = useState(null);

  
  useEffect(() => {
    if(role === 'Admin' || role === 'Supervisor'){
      const fetchWorkOrders = async () => {
        try {
          const responseData = await sendRequest(
            `${process.env.REACT_APP_BACKEND_URL}/workorders`,
            'GET',
            null,
            { Authorization: 'Bearer ' + token }
          );
          setWorkOrders(responseData.workOrders);
        } catch (error) {
          console.log(error);
        }
      };
      fetchWorkOrders();
    }
    else if(role === 'Technician'){
      const fetchMyWorkOrders = async () => {
        try {
          const responseData = await sendRequest(
            `${process.env.REACT_APP_BACKEND_URL}/workorders/my`,
            'GET',
            null,
            { Authorization: 'Bearer ' + token }
          );
          setWorkOrders(responseData.workOrders);
        } catch (error) {
          console.log(error);
        }
      };
      fetchMyWorkOrders();
    }
  }, [sendRequest, token, role]);


  const filteredData = workOrders.filter(wo => 
    wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

 const startWorkorder = async (workOrderId, currentStatus) => {
  if (role === "Supervisor" || role === "Admin") {
    navigate(`/workorders/${workOrderId}`);
    return;
  }

  if (role === 'Technician') {
    if (currentStatus === "In-Progress") {
      navigate(`/workorders/${workOrderId}`);
    }
    else if (currentStatus === "Assigned" || currentStatus === "Scheduled") {
      let shouldNavigate = false;
      let navigationError = false;
      
      try {
        const response = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/workorders/${workOrderId}/start`,
          'PATCH',
          null,
          { Authorization: 'Bearer ' + token }
        );
        
        if (response && response.message === "Work order started successfully") {
          shouldNavigate = true;
        }
      } catch (error) {
        console.log('Error starting work order:', error);
        navigationError = true;
      }
      
      if (shouldNavigate && !navigationError) {
        navigate(`/workorders/${workOrderId}`);
      }
    }
    else {
      navigate(`/workorders/${workOrderId}`);
    }
  }
};

  const showDeleteWarningHandler = (id, title) => {
    setWorkOrderToDelete({ id, title });
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
    setWorkOrderToDelete(null);
  };

  const confirmDeleteHandler = async () => {
    if (!workOrderToDelete) return;

    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/workorders/${workOrderToDelete.id}`,
        'DELETE',
        null,
        { Authorization: 'Bearer ' + token }
      );

      setWorkOrders(current => current.filter(item => item.id !== workOrderToDelete.id));
      
      setShowConfirmModal(false);
      setWorkOrderToDelete(null);
    } catch (error) {
      console.log('Error deleting equipment:', error);
    }
  };

  return (
    <>

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
          Do you want to proceed and delete <strong>{workOrderToDelete?.title}</strong>?  
          Please note that this action cannot be undone.
        </p>
      </Modal>

      <ErrorModal error={error} onClear={clearError} />
      {isLoading ? <LoadingSpinner asOverlay /> : null}
      <div className="animate-fade-in">
        <div className="page-header">
          <div className="header-content">
            <div>
              <h2>Work Orders</h2>
              <p style={{color:'#64748b'}}>Track maintenance tasks and repairs</p>
            </div>
            {(role === 'Admin' || role === 'Supervisor') && (
              <Button className="wo-btn" icon={Plus} onClick={() => navigate('/workorders/new')}>
                Create Work Order
              </Button>
            )}
          </div>
        </div>

        <div className="flex-row">
          <div style={{flex:1}}>
            <Input 
              id="workorder-search"
              placeholder="Search by title or equipment..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" icon={Filter}>Filter</Button>
        </div>

        <Card className="work-order-table-container" style={{padding: "0"}}>
          <table className="work-order-table">
            <thead>
              <tr>
                <th>ID / Title</th>
                <th>Equipment</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th style={{textAlign:'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.reverse(-1).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <p style={{fontWeight:500}}>{item.title}</p>
                      <p style={{fontSize:'0.8rem', color:'#64748b'}}>{item.tag}</p>
                    </td>
                    <td>{item.equipment?.name || 'No equipment'}</td>
                    <td><StatusBadge status={item.priority} /></td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>{currentUser?.name === item.assignedTo?.name ? "You" : (item.assignedTo?.name || 'Unassigned')}</td>
                    <td style={{textAlign: 'right'}}>
                      <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                        <button 
                          className="icon-btn view" 
                          onClick={() => startWorkorder(item.id, item.status)}
                          title={role === 'Technician' ? 'Start Work Order' : 'View Work Order'}
                        >
                          <Eye size={18}/>
                        </button>
                        
                        {(role === 'Admin' || role === 'Supervisor') && (
                          <>
                          {item.status !== "Completed" ?
                          (
                            <button 
                              className="icon-btn edit" 
                              onClick={() => navigate(`/workorders/edit/${item.id}`)}
                            >
                              <Pencil size={18}/>
                            </button>
                          )
                            : null
                          }
                            <button 
                              className="icon-btn delete" 
                              onClick={() => showDeleteWarningHandler(item.id, item.title)}
                            >
                              <Trash2 size={18}/>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{textAlign:'center', padding:'2rem', color:'#64748b'}}>
                    No Work Orders found.
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

export default WorkOrderList;