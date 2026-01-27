import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Pencil, Calendar, Clock, Box 
} from 'lucide-react';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import './PMTemplateDetail.css';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorModal from '../../components/common/ErrorModal';

import { useHttpClient } from '../../hooks/HttpHook';
import { useLogin } from '../../context/AuthContext';
import Card from '../../components/common/Card';

const PMTemplateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ template, setTemplate ] = useState()
  const { token, role } = useLogin()
  const { isLoading, error, sendRequest, clearError } = useHttpClient()
  

  useEffect(()=>{
    const fetchTemplateById = async()=>{
        try {
          const responseData = await sendRequest(
            `${process.env.REACT_APP_BACKEND_URL}/pm-templates/${id}`,
            "GET",
            null,
            {
              Authorization: 'Bearer '+ token
            }
          )
          setTemplate(responseData.pmTemplate)
          
        } catch (error) {
          console.log(error);
          
        }

    }
    fetchTemplateById()
  }, [sendRequest, token, id])

  
   if (!template) {
    return <LoadingSpinner asOverlay />;
  }


  return (
     <>
    <ErrorModal error={error} onClear={clearError} />    
    {/* <ErrorModal error={permissionError} onClear={() => setPermissionError(null)} /> */}
    {isLoading ? <LoadingSpinner asOverlay /> : null}
    <div className="animate-fade-in">
      <div className="page-top-left">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="title-area">
          <h2>{template.title}</h2>
          <div className="pm-meta">
            <span className="code-badge">{template.tag}</span>
            <span className={`type-badge ${template.frequencyType}`}>
              {template.frequencyType === 'Calendar' ? <Calendar size={14}/> : <Clock size={14}/>} 
              {template.frequencyType}
            </span>
          </div>
        </div>

        {(role === "Admin" || role === "Supervisor") && (
          <Button 
            icon={Pencil} 
            onClick={() => navigate(`/pm-templates/edit/${id}`)}
          >
            Edit Template
          </Button>
        )}
      </div>

      <div className="pm-detail-layout">
         <div className="pm-info-panel">
            <div className="detail-card" style={{height: '100%'}}>
                <h3>Schedule Rules</h3>
                
                <div className="info-grid">
                    <div className="info-group">
                        <label>Frequency</label>
                        <p className="highlight-val">{template.frequencyValue} {template.frequencyType === "Calendar" ? 'Days' : 'Hours'}</p>
                    </div>
                    <div className="info-group">
                        <label>Trigger Type</label>
                        <p>{template.frequencyType} Based</p>
                    </div>
                    {/* <div className="info-group">
                        <label>Default Priority</label>
                        <StatusBadge status={template.priority} />
                    </div>
                    <div className="info-group">
                        <label>Est. Duration</label>
                        <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                            <Clock size={16} className="text-gray"/>
                            <p>{template.estDuration}</p>
                        </div>
                    </div> */}
                </div>

                

                <div className="info-group" style={{marginTop:'1.5rem'}}>
                    <label>Instructions / Description</label>
                    <p className="desc-text">{template.description || 'No description provided'}</p>
                </div>
            </div>
         </div>

         <Card className="pm-assets-panel">
            <div className="panel-header">
                <h3>Linked Equipment</h3>
                <span className="count-badge">{template.equipment.length}</span>
            </div>
            
            <p className="panel-desc">
                This PM template is currently active for the following assets:
            </p>

            <div className="linked-assets-list">
              {template.equipment && template.equipment.length > 0 ?
                template.equipment.map((item)=>
                  (               
                    <div key={item.id} className="linked-asset-row" onClick={() => navigate(`/equipment/${item.id}`)}>
                        <div className="asset-icon-box">
                            <img 
                              src={`${process.env.REACT_APP_ASSET_URL}/${item.photo}`} 
                              alt={<Box size={18} />} 
                              style={{
                                objectFit:"cover",
                                height:"100%",
                                width:"100%",
                                borderRadius:"6px"
                              }}
                              />
                        </div>
                        <div className="asset-data">
                            <h4>{item.name}</h4>
                            <span className="asset-sub">{item.site.name}</span>
                        </div>
                        <StatusBadge status={item.status} />
                    </div>
                  )
                    
              ):
              (
                 <div className="linked-asset-row">
                       No equipment for this template
                  </div>
              )
            }
            </div>
         </Card>

      </div>
    </div>
    </>
  );
};

export default PMTemplateDetail;