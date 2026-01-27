import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Pencil, MapPin, Box, 
  AlertTriangle, CheckCircle2 
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorModal from '../../../components/common/ErrorModal';
import { useHttpClient } from '../../../hooks/HttpHook';
import { useLogin } from '../../../context/AuthContext';
import './SiteDetail.css';

const SiteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { token, role } = useLogin();

  const [site, setSite] = useState(null);
  const [siteEquipment, setSiteEquipment] = useState([]);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/sites/${id}`,
          'GET',
          null,
          { Authorization: 'Bearer ' + token }
        );
        setSite(responseData.site);
        setSiteEquipment(responseData.site.equipment || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSite();
  }, [id, sendRequest, token]);


  return (
  <>
    <ErrorModal error={error} onClear={clearError} />
    {isLoading ? <LoadingSpinner asOverlay /> : null}
    <div className="animate-fade-in">
      {site ? (
        <>
          <div className="page-header">
          <div className='page-top'>
            <button 
                className="back-button" 
                onClick={() => navigate(-1)}
            >
              <ChevronLeft />
            </button>
              <div>
                <h2>{site.name}</h2>
                <div className="site-meta">
                  <span className="code-badge">{site.code}</span>
                  <span className={`status-text ${site.status?.toLowerCase()}`}>{site.status}</span>
                </div>
              </div>
            </div>
            {role === "Admin" || role === "Supervisor" ? 
            (
              <Button icon={Pencil} onClick={() => navigate(`/settings/sites/edit/${id}`)}>
                Edit Site
              </Button>
            ): 
            null
            }
          </div>

          <div className="site-detail-layout">
            <div className="site-info-panel">
              <div className="detail-card">
                <h3>Location Details</h3>
                
                <div className="info-group">
                  <label>Full Address / Coordinates</label>
                  <div className="address-box">
                    <MapPin size={18} className="text-blue-600" />
                    <p>{site.address}</p>
                  </div>
                </div>

                <div className="info-group">
                  <label>Description</label>
                  <p className="info-desc">{site.description}</p>
                </div>
              </div>

              <div className="detail-card">
                <h3>Statistics</h3>
                <div className="stats-row">
                  <Card className="stat-item">
                    <span className="stat-val black">{siteEquipment.length}</span>
                    <span className="stat-label">Total Assets</span>
                  </Card>
                  <Card className="stat-item">
                    <span className="stat-val text-emerald-600">
                      {siteEquipment.filter(e => e.status === 'Operational').length}
                    </span>
                    <span className="stat-label">Operational</span>
                  </Card>
                  <Card className="stat-item">
                    <span className="stat-val text-amber-600">
                      {siteEquipment.filter(e => e.status === 'Maintenance').length}
                    </span>
                    <span className="stat-label">In Maint.</span>
                  </Card>
                  <Card className="stat-item">
                    <span className="stat-val text-rose-600">
                      {siteEquipment.filter(e => e.status === 'Critical').length}
                    </span>
                    <span className="stat-label">Critical</span>
                  </Card>
                  <Card className="stat-item">
                    <span className="stat-val black">
                      {siteEquipment.filter(e => e.status === 'Down').length}
                    </span>
                    <span className="stat-label">Down</span>
                  </Card>
                </div>
              </div>
            </div>

            <Card className="site-assets-panel">
              <div className="panel-header">
                <h3>Assigned Assets</h3>
                {role === "Admin" || role === "Supervisor" ? 
                  <Button onClick={()=> navigate("/equipment/new")} variant="secondary" className="btn-sm">Add Asset</Button>
                  :  
                  null
                }
              </div>

              <div className="assets-list">
                {siteEquipment.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No equipment assigned to this site.
                  </div>
                )}
                {siteEquipment.map(eq => (
                  <div key={eq.id} className="asset-row" onClick={() => navigate(`/equipment/${eq.id}`)}>
                    <div className="asset-icon">
                      <img 
                        src={`${process.env.REACT_APP_ASSET_URL}/${eq.photo}`} 
                        alt={<Box size={20} />} 
                        style={{
                          objectFit:"cover",
                          height:"100%",
                          width:"100%",
                          borderRadius:"6px"
                        }}
                      />
                    </div>
                    <div className="asset-info">
                      <h4>{eq.name}</h4>
                      <span>{eq.tag}</span>
                    </div>
                    <div className="asset-status">
                      {eq.status === 'Operational' ? 
                        <span className="health-good"><CheckCircle2 size={14}/> {eq.health}%</span> :
                        <span className="health-warn"><AlertTriangle size={14}/> {eq.health}%</span>
                      }
                      <StatusBadge status={eq.status} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : !isLoading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          Site not found
        </div>
      )}
    </div>
  </>
);
};

export default SiteDetail;