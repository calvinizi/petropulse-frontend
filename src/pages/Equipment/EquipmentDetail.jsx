import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Pencil, MapPin, Calendar, 
  Activity, AlertTriangle, CheckCircle, Trash2, Clock, FileText, TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import './EquipmentDetail.css';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorModal from '../../components/common/ErrorModal';
import { useHttpClient } from '../../hooks/HttpHook';
import { useLogin } from '../../context/AuthContext';
import Card from '../../components/common/Card';

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [equipment, setEquipment] = useState();
  const [latestWo, setLatestWo] = useState();
  const [latestPm, setLatestPm] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { token, role } = useLogin();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedPmId, setSelectedPmId] = useState(null);

  useEffect(() => {
    const fetchEquipmentById = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/equipment/${id}`,
          "GET",
          null,
          { Authorization: 'Bearer ' + token }
        );
        setEquipment(responseData.equipment);
        setLatestPm(responseData.equipment.pmTemplates[0] || null);
        setLatestWo(responseData.latestWorkOrder)
      } catch (error) {
        console.log(error);
      }
    };
    fetchEquipmentById();
  }, [sendRequest, token, id]);

  const fetchRiskAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/predictive/analyze/${id}`,
        'GET',
        null,
        { Authorization: 'Bearer ' + token }
      );
      setRiskAnalysis(responseData.data);
      setShowAnalysisModal(true);
    } catch (error) {
      console.log('Error fetching risk analysis:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const showDeleteWarningHandler = () => {
    setShowDeleteModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowDeleteModal(false);
  };

  const confirmDeleteHandler = async () => {
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/equipment/${id}`,
        'DELETE',
        null,
        { Authorization: 'Bearer ' + token }
      );

      setShowDeleteModal(false);
      navigate('/equipment');
    } catch (error) {
      console.log('Error deleting equipment:', error);
    }
  };

  const handleDeletePM = (e, pmId) => {
    e.stopPropagation(); 
    setSelectedPmId(pmId);
    setShowUnlinkModal(true);
  };

  const cancelUnlinkHandler = () => {
    setShowUnlinkModal(false);
    setSelectedPmId(null);
  };

  const confirmUnlinkHandler = async () => {
    if (!selectedPmId) return;

    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/equipment/${id}/templates/${selectedPmId}/remove`,
        'PATCH',
        null,
        { Authorization: 'Bearer ' + token }
      );

      setEquipment(prev => ({
        ...prev,
        pmTemplates: prev.pmTemplates.filter(pm => pm.id !== selectedPmId)
      }));

      setShowUnlinkModal(false);
      setSelectedPmId(null);
      
      console.log(`Unlinked PM ${selectedPmId} from Equipment ${id}`);
    } catch (error) {
      console.log('Error unlinking PM template:', error);
    }
  };

  const handleEdit = () => {
    navigate(`/equipment/edit/${id}`);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL': return '#dc3545';
      case 'HIGH': return '#fd7e14';
      case 'MEDIUM': return '#ffc107';
      case 'LOW': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (!equipment) {
    return <LoadingSpinner asOverlay />;
  }

  const selectedPmTemplate = equipment.pmTemplates.find(pm => pm.id === selectedPmId);

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />    
      {isLoading && <LoadingSpinner asOverlay />}

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
          Do you want to proceed and delete <strong>{equipment.name}</strong>? 
          This will also delete all associated work orders. 
          Please note that this action cannot be undone.
        </p>
      </Modal>

      <Modal 
        show={showUnlinkModal}
        onCancel={cancelUnlinkHandler}
        header="Unlink PM Template?" 
        footer={
          <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%'}}>
            <Button variant="secondary" onClick={cancelUnlinkHandler}>
              CANCEL
            </Button>
            <Button 
              onClick={confirmUnlinkHandler}
              style={{backgroundColor: '#d97706', color: 'white'}}
            >
              UNLINK
            </Button>
          </div>
        }
      >
        <p>
          Do you want to unlink <strong>{selectedPmTemplate?.title}</strong> from this equipment? 
          This will also delete any pending work orders created by this template.
        </p>
      </Modal>

      <Modal 
        show={showAnalysisModal}
        onCancel={() => setShowAnalysisModal(false)}
        header="Predictive Maintenance Analysis"
        style={{ maxWidth: '700px' }}
      >
        {loadingAnalysis ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <LoadingSpinner />
            <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>
              Analyzing equipment...
            </p>
          </div>
        ) : riskAnalysis ? (
          <div className="risk-analysis-content">
            <div className="risk-score-header" style={{
              textAlign: 'center',
              padding: '24px',
              borderRadius: '8px',
              backgroundColor: `${getRiskColor(riskAnalysis.riskLevel)}15`,
              border: `2px solid ${getRiskColor(riskAnalysis.riskLevel)}`,
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: getRiskColor(riskAnalysis.riskLevel),
                marginBottom: '8px'
              }}>
                {riskAnalysis.riskScore}%
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: getRiskColor(riskAnalysis.riskLevel),
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {riskAnalysis.riskLevel} RISK
              </div>
            </div>
            <div className="risk-factors-section" style={{ marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>
                Risk Factors:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(riskAnalysis.factors).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      color: 'var(--text-main)'
                    }}>
                      <span style={{ textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span style={{ fontWeight: '600' }}>{value}%</span>
                    </div>
                    <div style={{
                      height: '8px',
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${value}%`,
                        backgroundColor: value > 70 ? '#dc3545' : value > 50 ? '#fd7e14' : '#ffc107',
                        transition: 'width 0.5s ease',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="recommendations-section">
              <h4 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>
                Recommendations:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {riskAnalysis.recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${
                        rec.priority === 'URGENT' ? '#dc3545' :
                        rec.priority === 'HIGH' ? '#fd7e14' :
                        rec.priority === 'MEDIUM' ? '#ffc107' : '#28a745'
                      }`,
                      backgroundColor: `${
                        rec.priority === 'URGENT' ? '#dc3545' :
                        rec.priority === 'HIGH' ? '#fd7e14' :
                        rec.priority === 'MEDIUM' ? '#ffc107' : '#28a745'
                      }10`
                    }}
                  >
                    <div style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      fontWeight: '700',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      color: rec.priority === 'URGENT' ? '#dc3545' :
                             rec.priority === 'HIGH' ? '#fd7e14' :
                             rec.priority === 'MEDIUM' ? '#ffc107' : '#28a745'
                    }}>
                      {rec.priority}
                    </div>
                    <div style={{
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: 'var(--text-main)'
                    }}>
                      {rec.action}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--text-muted)',
                      marginBottom: '8px'
                    }}>
                      {rec.reason}
                    </div>
                    {rec.estimatedCost > 0 && (
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#dc3545',
                        marginTop: '8px'
                      }}>
                        Potential cost if ignored: NGN {rec.estimatedCost.toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              Analysis performed: {new Date(riskAnalysis.analyzedAt).toLocaleString()}
            </div>
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
            No analysis data available
          </p>
        )}
      </Modal>

      <div className="animate-fade-in">
        <div className="equipment-detail-top-bar">
        <div className="left-group">
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={28} />
          </button>

          <div className="title-and-meta">
            <h2 className="equipment-name">{equipment.name}</h2>
            <div className="meta-row">
              <span className="tag-badge">{equipment.tag}</span>
              <StatusBadge status={equipment.status} />
            </div>
          </div>
        </div>

          <div className="action-buttons">
            {(role === "Admin" || role === "Supervisor") && (
              <>
                <Button 
                  variant="primary" 
                  icon={TrendingUp} 
                  onClick={fetchRiskAnalysis}
                  disabled={loadingAnalysis}
                >
                  {loadingAnalysis ? 'Analyzing...' : 'Risk Analysis'}
                </Button>
                <Button variant="secondary" icon={Pencil} onClick={handleEdit}>
                  Edit
                </Button>
                <Button 
                  className="btn-danger" 
                  icon={Trash2} 
                  onClick={showDeleteWarningHandler}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="eq-detail-layout">
          <div className="eq-info-panel">
            <div className="eq-stats-row">
              <div className="stat-card">
                <span className="stat-label">Health Score</span>
                <div 
                  className={`stat-value ${equipment.health > 75 ? 'text-emerald-600' : equipment.health < 50 ? 'text-rose-600' : 'text-amber-600'}`}
                >
                  <Activity size={20}/> {equipment.health}%
                </div>
              </div>
              
              <div className="stat-card">
                <span className="stat-label">Criticality</span>
                <div 
                  className={`stat-value ${equipment.criticality === 'C' ? 'text-emerald-600' : equipment.criticality === 'A' ? 'text-rose-600' : 'text-amber-600'}`}
                >
                  <AlertTriangle size={20}/> {equipment.criticality}
                </div>
              </div>
              
              <div className="stat-card">
                <span className="stat-label">Downtime Cost</span>
                <div className="stat-value text-amber-600">
                  NGN {equipment.downtimeCostPerHour}/hr
                </div>
              </div>
            </div>

            <Card className="detail-card">
              <h3>Usage & Maintenance Status</h3>
              <div className="info-grid">
                <div className="info-group">
                  <label>Current Running Hours</label>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'1.1rem', fontWeight:'600'}}>
                    <Clock size={18} className="text-blue-600"/>
                    {equipment.runningHours || 0} hrs
                  </div>
                </div>
                
                {latestPm?.frequencyType === "Runtime" ? (
                  <div className="info-group">
                    <label>Last Maintenance Hours</label>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                      <CheckCircle size={16} className="text-emerald-600"/>
                      <span style={{fontWeight:'500'}}>
                        {equipment.lastMaintenanceHours || 0} hrs ago
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="info-group">
                    <label>Last Maintenance Date</label>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                      <CheckCircle size={16} className="text-emerald-600"/>
                      <span style={{fontWeight:'500'}}>
                        {equipment.latestCompletedWorkOrder?.completedAt 
                          ? new Date(equipment.latestCompletedWorkOrder.completedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : equipment.lastMaintenanceDate 
                            ? new Date(equipment.lastMaintenanceDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'Never'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="info-group">
                  <label>Last Work Order</label>
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <FileText size={16} className="text-blue-600"/>
                    {equipment?.latestCompletedWorkOrder ? (
                      <span 
                        style={{fontWeight:'500', color:'#2563eb', cursor:'pointer'}}
                        onClick={() => navigate(`/workorders/${equipment?.latestCompletedWorkOrder.id}`)}
                      >
                        {equipment?.latestCompletedWorkOrder.tag}
                      </span>
                    ) : (
                      <span style={{color:'#64748b'}}>None</span>
                    )}
                  </div>
                </div>
                
                <div className="info-group">
                  <label>Next Due (Calendar)</label>
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <Calendar size={16} className="text-amber-600"/>
                    <span style={{fontWeight:'500'}}>
                      {equipment?.nextCalendarDue || 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="info-group">
                  <label>Next Due (Runtime)</label>
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <Activity size={16} className="text-amber-600"/>
                    <span style={{fontWeight:'500'}}>
                      {equipment?.nextRuntimeDue ? equipment?.nextRuntimeDue.toLocaleString() + ' hrs' : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="detail-card">
              <h3>General Information</h3>
              <div className="info-grid">
                <div className="info-group">
                  <label>Equipment Type</label>
                  <p>{equipment?.type}</p>
                </div>
                
                <div className="info-group">
                  <label>Site Location</label>
                  <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                    <MapPin size={16} className="text-blue-600"/> 
                    <p>{equipment?.site.address || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="info-group full-width">
                  <label>Description</label>
                  <p className="desc-text">{equipment?.description || 'No description available'}</p>
                </div>
              </div>
            </Card>

            <Card className="detail-card">
              <h3>Technical Specifications</h3>
              <div className="info-grid">
                <div className="info-group">
                  <label>Manufacturer</label>
                  <p>{equipment?.manufacturer || 'N/A'}</p>
                </div>
                
                <div className="info-group">
                  <label>Model Number</label>
                  <p>{equipment?.model || 'N/A'}</p>
                </div>
                
                <div className="info-group">
                  <label>Serial Number</label>
                  <p className="monospace">{equipment?.serialNumber || 'N/A'}</p>
                </div>
                
                <div className="info-group">
                  <label>Install Date</label>
                  <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                    <Calendar size={16} className="text-slate-400"/>
                    <p>{equipment?.installDate}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="eq-side-panel">
            <div className="detail-card photo-card">
              <h3>Asset Photo</h3>
              <div className="asset-image-placeholder">
                <img 
                  src={`${process.env.REACT_APP_ASSET_URL}/${equipment?.photo}` || "https://placehold.co/400x300?text=No+Image"} 
                  alt="Asset" 
                  style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'8px'}} 
                />
              </div>
            </div>

            <div className="detail-card">
              <h3>PM Schedules</h3>
              <div className="pm-list-small">
                {equipment?.pmTemplates.length > 0 ? (
                  equipment?.pmTemplates.map(pm => (
                    <div 
                      key={pm.id} 
                      className="pm-item-small" 
                      onClick={() => navigate(`/pm-templates/${pm.id}`)}
                      title="View Template Details"
                    >
                      <div className={`pm-icon ${pm.frequencyType}`}>
                        {pm.frequencyType === 'Calendar' ? <Calendar size={14}/> : <Clock size={14}/>}
                      </div>
                      <div className="pm-info">
                        <p className="pm-title">{pm.title}</p>
                        {pm.frequencyType === 'Calendar' ? (
                          <span className="pm-freq">{pm.frequencyValue} Days</span>
                        ) : (
                          <span className="pm-freq">{pm.frequencyValue} Hours</span>
                        )}
                      </div>
                      <button 
                        className="pm-delete-btn"
                        onClick={(e) => handleDeletePM(e, pm.id)}
                        title="Unlink Template"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="pm-item-small" style={{textAlign:'center', padding:'2rem', color:'#64748b'}}>
                    No PM Templates found
                  </div>
                )}
              </div>
            </div>

            <div className="detail-card">
              <h3>Recent Activity</h3>
              <div className="activity-timeline">
                <div className="timeline-item">
                  <div className="dot"></div>
                  <p>
                    <strong>
                      {
                        latestWo?.status === "Completed" ? `Last Work Order Completed by ${latestWo?.assignedTo.name}` : 
                        latestWo?.status === "Scheduled" ? `Work Order Scheduled for 
                        ${new Date(latestWo?.scheduledStart).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}` :
                        latestWo?.status === "In-Progress" ? `Work order currently In-Progress by ${latestWo?.assignedTo.name}` :
                        latestWo?.status === "Assigned" ? `Work order Assigned to ${latestWo?.assignedTo.name}` : "No Pending WO"
                      }
                    </strong>
                  </p>
                  <span className="time">
                    {latestWo?.updatedAt 
                      ? formatDistanceToNow(new Date(latestWo.updatedAt), { addSuffix: true })
                      : "N/A"
                    }
                  </span>
                </div>
                <div className="timeline-item">
                  <div className="dot"></div>
                  <p>
                    <strong>
                      Status
                    </strong> 
                    {
                      (latestWo?.status === "Completed" && equipment?.status === "Operational") ?  " Changed to Operational" :
                      latestWo?.status === ("Assigned" || "In-Progress") || equipment.status === "Maintenance" ? " Changed to Maintenance" : " Unchanged"
                    }
                  </p>
                  <span className="time">
                    {latestWo?.updatedAt 
                        ? formatDistanceToNow(new Date(latestWo.updatedAt), { addSuffix: true })
                        : "N/A"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EquipmentDetail;