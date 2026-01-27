import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { 
  Filter, Eye, 
  PlayCircle, StopCircle, History, FileText, Calendar 
} from 'lucide-react';

import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import ErrorModal from '../../components/common/ErrorModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './DowntimeList.css';

import { useLogin } from '../../context/AuthContext';
import { useHttpClient } from '../../hooks/HttpHook';
import Card from '../../components/common/Card';


const DowntimeList = () => {
  const navigate = useNavigate();
  
  // Data State
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [equipmentData, setEquipmentData] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedEq, setSelectedEq] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // React Hook Form Setup
  const { 
    register, 
    handleSubmit, 
    control,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      failureReason: 'Mechanical',
      woTitle: '',
      woDueDate: '',
      woAssignee: 'Randomize',
      woDescription: ''
    }
  });

  const { sendRequest, isLoading, clearError, error } = useHttpClient();
  const { token, role } = useLogin();

  // Helper function to refresh all data
  const refreshData = async () => {
    try {
      // Refresh equipment data
      const equipmentResponse = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/equipment`,
        "GET",
        null,
        { Authorization: 'Bearer ' + token }
      );
      setEquipmentData(equipmentResponse.equipments);

      // Refresh downtime events
      const downtimeResponse = await sendRequest(
      `${process.env.REACT_APP_BACKEND_URL}/downtime`,
        'GET',
        null,
        { Authorization: 'Bearer ' + token }
      );
      setLogs(downtimeResponse.downtimeEvents);
    } catch (error) {
      console.log('Error refreshing data:', error);
    }
  };

  // Fetch equipment on mount
  useEffect(() => {
    if (role === "Technician" || role === "Viewer") {
      return;
    }
    const fetchEquipments = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/equipment`,
          "GET",
          null,
          { Authorization: 'Bearer ' + token }
        );
        setEquipmentData(responseData.equipments);
      } catch (error) {
        console.log(error);
      }
    };
    fetchEquipments();
  }, [sendRequest, token, role]);

  // Fetch technicians on mount
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/user/all`,
          'GET',
          null,
          { Authorization: 'Bearer ' + token }
        );
        const technicianList = responseData.users.filter(i => i.role === 'Technician');
        setTechnicians(technicianList);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTechnicians();
  }, [sendRequest, token]);

  useEffect(() => {
    const fetchDowntimeEvents = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/downtime`,
          'GET',
          null,
          { Authorization: 'Bearer ' + token }
        );
        setLogs(responseData.downtimeEvents);
      } catch (error) {
        console.log('Error fetching downtime events:', error);
        setLogs([]);
        // navigate(-1)
      }
    };
    fetchDowntimeEvents();
  }, [sendRequest, token, navigate]);
  
  const handleOpenStartModal = (eq) => {
    setSelectedEq(eq);
    
    reset({
      failureReason: 'Mechanical',
      woTitle: `Emergency Repair: ${eq.name}`,
      woAssignee: 'Randomize',
    });
    
    setShowModal(true);
  };

  const confirmStartDowntime = handleSubmit(async (formData) => {
    if (!selectedEq) return;

    setIsSubmitting(true); 

    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/downtime`,
        'POST',
        JSON.stringify({
          title: formData.woTitle,
          equipmentId: selectedEq.id,
          description: formData.woDescription,
          assignedTo: formData.woAssignee,
          dueDate: formData.woDueDate,
          reason: formData.failureReason,
        }),
        { 
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token 
        }
      );
        
      setShowModal(false);
      
      //Refresh data immediately to show changes
      await refreshData();

    } catch (error) {
      console.log('Error creating downtime:', error);

    } finally {
      setIsSubmitting(false); 
    }
  });

  const handleEndDowntime = async (eqId) => {
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/downtime/${eqId}/end`,
        'PATCH',
        null,
        { Authorization: 'Bearer ' + token }
      );

      //Refresh data immediately to show changes
      await refreshData();

    } catch (error) {
      console.log('Error ending downtime:', error);
    }
  };

  
  const filteredLogs = logs.filter(log => {
    const equipmentName = log.equipment?.name || log.equipment || '';
    const reason = log.reason || '';
    return equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           reason.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
    <ErrorModal error={error} onClear={clearError} />    
    {isLoading ? <LoadingSpinner asOverlay /> : null}
    {(isLoading || isSubmitting) && <LoadingSpinner asOverlay />} 

    <div className="animate-fade-in">
      <div className="page-header">
        <div className='home-audit'>
          <h2>Downtime Control</h2>
          <p style={{color:'#64748b'}}>Live Equipment Status</p>
        </div>
      </div>

      <div className="equipment-status-grid">
        {equipmentData.map(eq => (
          <Card key={eq.id} className={`status-card ${eq.status === 'Down' ? 'down' : 'running'}`}>
            <div className="status-card-header">
              <span className="eq-name">{eq.name}</span>
              <span className={`status-dot ${eq.status === 'Down' ? 'red' : 'green'}`}></span>
            </div>
            
            <div className="status-actions">
              <button 
                className={`control-btn start ${eq.status === 'Down' ? 'disabled' : ''}`}
                onClick={() => handleOpenStartModal(eq)}
                disabled={eq.status === 'Down' || isSubmitting }
              >
                <PlayCircle size={18} /> Start
              </button>
              
              <button 
                className={`control-btn end ${eq.status !== 'Down' ? 'disabled' : ''}`}
                onClick={() => handleEndDowntime(eq.id)}
                disabled={eq.status !== 'Down' || isSubmitting}
              >
                <StopCircle size={18} /> End
              </button>
            </div>
          </Card>
        ))}
      </div>

      <hr className="divider" />

     <div className="page-header history-header">
        <div className='page-top'>
          <History size={24} color="#64748b"/>
          <h2>History Logs</h2>
        </div>
      </div>

      <div className="flex-row">
        <div style={{flex:1}}>
            <Input 
              id="downtime-search"
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <Button variant="secondary" icon={Filter}>Filter</Button>
      </div>

      <Card className="downtime-table-container" style={{padding: "0"}}>
        <table className="downtime-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Reason</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th style={{textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.reverse(-1).map((log) => (
                <tr key={log.id}>
                  <td>
                    <p style={{fontWeight:500}}>{log.equipment?.name || log.equipment}</p>
                    <p style={{fontSize:'0.8rem', color:'#64748b'}}>{log.tag}</p>
                  </td>
                  <td>{log.reason}</td>
                  <td>{new Date(log.startTime).toLocaleString()}</td>
                  <td>{log.endTime ? new Date(log.endTime).toLocaleString() : '-'}</td>
                  <td>
                      <StatusBadge status={log.equipment.status === 'Down' ? 'down' : 'Operational'} />
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                      <button className="icon-action view" onClick={() => navigate(`/downtime/${log.id}`)}>
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: '#94a3b8'}}>
                  No downtime events at this time
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        show={showModal}
        onCancel={() => !isSubmitting && setShowModal(false)}
        header={selectedEq ? `Start Downtime: ${selectedEq.name}` : 'Start Downtime'}
        footer={
            <div style={{display:'flex', gap:'10px', width:'100%', justifyContent:'flex-end'}}>
                <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button className="btn-danger" onClick={confirmStartDowntime} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Confirm & Start'} 
                </Button>
            </div>
        }
      >
        <div className="downtime-modal-body">
            <div className="form-group">
                <label className="modal-label">Failure Reason</label>
                <Controller
                  name="failureReason"
                  control={control}
                  rules={{ required: 'Failure reason is required' }}
                  render={({ field }) => (
                    <Select 
                      className="modal-select"
                      {...field}
                      disabled={isSubmitting}
                    >
                      <option value="Mechanical">Mechanical</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Instrumentation">Instrumentation</option>
                      <option value="Process">Process</option>
                      <option value="Other">Other</option>
                    </Select>
                  )}
                />
                {errors.failureReason && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.failureReason.message}</span>}
            </div>

            
            <div className="form-group">
                <label className="modal-label">Cost Impact</label>
                <div className="cost-display">
                    <span className="currency">N</span>
                    <span className="amount">{selectedEq ? selectedEq.downtimeCostPerHour : 0}</span>
                    <span className="unit">/ Hour</span>
                </div>
            </div>

            {/* 3. Automatic Work order modal */}
            <div className="wo-auto-section">
                <div className="wo-section-header">
                    <FileText size={18} />
                    <span>Work Order (Auto-Creation)</span>
                </div>
                
                <div className="form-group">
                    <label className="modal-label">Work Order Title</label>
                    <input 
                        type="text" 
                        className="modal-input" 
                        placeholder="e.g., Emergency Repair: Pump A-7"
                        disabled={isSubmitting}
                        {...register('woTitle', { required: 'Work order title is required' })}
                    />
                    {errors.woTitle && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.woTitle.message}</span>}
                </div>

                <div className="form-row">
                    <div style={{flex:1}}>
                        <label className="modal-label">Due Date</label>
                        <div className="input-with-icon">
                            <Calendar size={16} className="input-icon"/>
                            <input 
                                type="date" 
                                className="modal-input has-icon" 
                                {...register('woDueDate', { required: 'Due date is required' })}
                                disabled={isSubmitting}
                            />
                        </div>
                        {errors.woDueDate && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.woDueDate.message}</span>}
                    </div>
                    <div style={{flex:1}}>
                        <label className="modal-label">Assign Technician</label>
                        <Controller
                          name="woAssignee"
                          control={control}
                          render={({ field }) => (
                            <Select className="modal-select" {...field} disabled={isSubmitting}>
                              <option value="Randomize">Randomize (Auto-Assign)</option>
                              {technicians.map((tech) => (
                                <option key={tech.id} value={tech.id}>
                                  {tech.name}
                                </option>
                              ))}
                            </Select>
                          )}
                        />
                        {errors.woAssignee && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.woAssignee.message}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label className="modal-label">Instructions / Description</label>
                    <textarea 
                        className="modal-textarea" 
                        rows="3" 
                        placeholder="Describe the failure and required repairs..."
                        disabled={isSubmitting}
                        {...register('woDescription', { required: 'Description is required' })}
                    ></textarea>
                    {errors.woDescription && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.woDescription.message}</span>}
                </div>
            </div>

        </div>
      </Modal>

    </div>
    </>
  );
};

export default DowntimeList;