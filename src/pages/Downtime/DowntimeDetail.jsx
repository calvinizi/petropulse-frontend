import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, AlertOctagon, CheckCircle2 } from 'lucide-react';



import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorModal from '../../components/common/ErrorModal';

import { useHttpClient } from '../../hooks/HttpHook';
import { useLogin } from '../../context/AuthContext';

import './DowntimeDetail.css';
import Card from '../../components/common/Card';

const DowntimeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [downtimeEvent, setDowntimeEvent] = useState()

  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { token } = useLogin()

  
  useEffect(()=>{
      const fetchDowntimeById = async()=>{
        try {
          const responseData = await sendRequest(
            `${process.env.REACT_APP_BACKEND_URL}/downtime/${id}`,
            "GET",
            null,
            { Authorization: 'Bearer '+ token }
          )
          
          setDowntimeEvent(responseData.downtime)
        } catch (error) {
          console.log(error);
        }
      }
      fetchDowntimeById()
    }, [sendRequest, token, id]);

    if (!downtimeEvent) {
    return <LoadingSpinner asOverlay />;
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />    
      {isLoading ? <LoadingSpinner asOverlay /> : null}
      <div className="animate-fade-in">
        {/* Header */}
        <div className="page-top-left">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="title-area">
            <h2>{downtimeEvent.tag}</h2>
            <p className="subtitle">Event Detail View</p>
          </div>
        </div>
        <Card className="detail-container">
          {downtimeEvent.startTime && downtimeEvent.endTime ?
            (
              <div className={`status-banner closed`}>
              <CheckCircle2 size={24} />
              <div>
                <h3>Status: Closed</h3>
                <p>This event has been handled efficiently.</p>
              </div>
              </div>
            )
            :
            <div className={`status-banner active`}>
              <AlertOctagon size={24} />
              <div>
                <h3>Status: Active</h3>
                <p>This event is currently affecting production.</p>
              </div>
            </div>
          }

          <div className="detail-grid">
            <div className="info-group">
              <label>Equipment</label>
              <p className="info-value">{downtimeEvent.equipment?.name}</p>
            </div>

            <div className="info-group">
              <label>Reason Category</label>
              <p className="info-value">{downtimeEvent.reason}</p>
            </div>

            <div className="info-group">
              <label>Start Time</label>
              <p className="info-value"><Clock size={16} style={{marginRight:5, verticalAlign:'middle'}}/> {downtimeEvent.startTime}</p>
            </div>


            <div className="info-group">
              <label>End Time</label>
              <p className="info-value"><Clock size={16} style={{marginRight:5, verticalAlign:'middle'}}/> {downtimeEvent.endTime || 'N/A'}</p>
            </div>
            
            <div className="info-group">
              <label>Est. Money Lost</label>
              <p className="info-value" style={{color:'#e11d48', fontWeight:'700'}}>
                  <span style={{marginRight:2, verticalAlign:'middle'}}>NGN</span> 
                  {downtimeEvent.cost || "N/A"}
              </p>
            </div>

            <div className="info-group">
              <label>Logged By</label>
              <p className="info-value">{downtimeEvent.reportedBy?.name}</p>
            </div>
          </div>

          <div className="description-box">
            <label>Description / Logs</label>
            <p>{downtimeEvent.description}</p>
          </div>
        </Card>
      </div>
    </>
  );
};

export default DowntimeDetail;