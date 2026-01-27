import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp, AlertTriangle } from 'lucide-react';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorModal from '../../../components/common/ErrorModal';
import { useHttpClient } from '../../../hooks/HttpHook';
import { useLogin } from '../../../context/AuthContext';
import './EquipmentAnalysis.css';

const EquipmentAnalysis = () => {
  const navigate = useNavigate();
  const { sendRequest, isLoading, error, clearError } = useHttpClient();
  const { token } = useLogin();

  const [analysisData, setAnalysisData] = useState(null);
  const [filterLevel, setFilterLevel] = useState('ALL');

  

  const fetchAnalysis = useCallback (async () => {
    try {
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/predictive/analyze-all`,
        'GET',
        null,
        { Authorization: 'Bearer ' + token }
      );
      setAnalysisData(responseData.data);
    } catch (err) {
      console.error('Error fetching analysis:', err);
    }
  }, [sendRequest, token]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL': return '#dc3545';
      case 'HIGH': return '#fd7e14';
      case 'MEDIUM': return '#ffc107';
      case 'LOW': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getRiskBgColor = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'rgba(220, 38, 38, 0.1)';
      case 'HIGH': return 'rgba(253, 126, 20, 0.1)';
      case 'MEDIUM': return 'rgba(255, 193, 7, 0.1)';
      case 'LOW': return 'rgba(40, 167, 69, 0.1)';
      default: return 'rgba(108, 117, 125, 0.1)';
    }
  };

  const filteredEquipment = analysisData?.allResults?.filter(eq => {
    if (filterLevel === 'ALL') return true;
    return eq.riskLevel === filterLevel;
  }) || [];

  if (!analysisData) {
    return <LoadingSpinner asOverlay />;
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}

      <div className="animate-fade-in">
        <div className="page-top-left">
            <button
              className="back-btn"
              aria-label="Go back"
              onClick={() => navigate('/equipment')}
              >
              <ChevronLeft />
            </button>
            <div className='title-area'>
              <h2>Equipment Risk Analysis</h2>
              <p className='subtitle'>
                Predictive maintenance analysis for all equipment
              </p>
            </div>
          <Button variant="secondary" onClick={fetchAnalysis}>
            Refresh Analysis
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="analysis-summary-grid">
          <Card
            className="summary-card"
            style={{ borderLeft: '4px solid #dc3545' }}
          >
            <div className="summary-content">
              <div className="summary-label">Critical Risk</div>
              <div className="summary-value" style={{ color: '#dc3545' }}>
                {analysisData.criticalCount}
              </div>
            </div>
            <AlertTriangle size={32} style={{ color: '#dc3545', opacity: 0.2 }} />
          </Card>

          <Card
            className="summary-card"
            style={{ borderLeft: '4px solid #fd7e14' }}
          >
            <div className="summary-content">
              <div className="summary-label">High Risk</div>
              <div className="summary-value" style={{ color: '#fd7e14' }}>
                {analysisData.highRiskCount - analysisData.criticalCount}
              </div>
            </div>
            <TrendingUp size={32} style={{ color: '#fd7e14', opacity: 0.2 }} />
          </Card>

          <Card
            className="summary-card"
            style={{ borderLeft: '4px solid #ffc107' }}
          >
            <div className="summary-content">
              <div className="summary-label">Medium Risk</div>
              <div className="summary-value" style={{ color: '#ffc107' }}>
                {analysisData.allResults.filter(r => r.riskLevel === 'MEDIUM').length}
              </div>
            </div>
            <TrendingUp size={32} style={{ color: '#ffc107', opacity: 0.2 }} />
          </Card>

          <Card
            className="summary-card"
            style={{ borderLeft: '4px solid #28a745' }}
          >
            <div className="summary-content">
              <div className="summary-label">Low Risk</div>
              <div className="summary-value" style={{ color: '#28a745' }}>
                {analysisData.allResults.filter(r => r.riskLevel === 'LOW').length}
              </div>
            </div>
            <TrendingUp size={32} style={{ color: '#28a745', opacity: 0.2 }} />
          </Card>
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterLevel === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterLevel('ALL')}
          >
            All ({analysisData.totalAnalyzed})
          </button>
          <button
            className={`filter-btn ${filterLevel === 'CRITICAL' ? 'active' : ''}`}
            onClick={() => setFilterLevel('CRITICAL')}
            style={{ '--filter-color': '#dc3545' }}
          >
            Critical ({analysisData.criticalCount})
          </button>
          <button
            className={`filter-btn ${filterLevel === 'HIGH' ? 'active' : ''}`}
            onClick={() => setFilterLevel('HIGH')}
            style={{ '--filter-color': '#fd7e14' }}
          >
            High ({analysisData.highRiskCount - analysisData.criticalCount})
          </button>
          <button
            className={`filter-btn ${filterLevel === 'MEDIUM' ? 'active' : ''}`}
            onClick={() => setFilterLevel('MEDIUM')}
            style={{ '--filter-color': '#ffc107' }}
          >
            Medium ({analysisData.allResults.filter(r => r.riskLevel === 'MEDIUM').length})
          </button>
          <button
            className={`filter-btn ${filterLevel === 'LOW' ? 'active' : ''}`}
            onClick={() => setFilterLevel('LOW')}
            style={{ '--filter-color': '#28a745' }}
          >
            Low ({analysisData.allResults.filter(r => r.riskLevel === 'LOW').length})
          </button>
        </div>

        <div className="equipment-analysis-grid">
          {filteredEquipment.length > 0 ? (
            filteredEquipment.map((eq) => (
              <Card
                key={eq.equipmentId}
                className="equipment-analysis-card"
                onClick={() => navigate(`/equipment/${eq.equipmentId}`)}
              >
                {/* Risk Badge */}
                <div
                  className="risk-badge-corner"
                  style={{
                    backgroundColor: getRiskColor(eq.riskLevel),
                  }}
                >
                  <span className="risk-score">{eq.riskScore}%</span>
                </div>

                <div className="equipment-card-header">
                  <h3>{eq.equipmentName}</h3>
                  <p className="equipment-tag">{eq.equipmentTag}</p>
                </div>

                {/* Risk Level */}
                <div
                  className="risk-level-badge"
                  style={{
                    backgroundColor: getRiskBgColor(eq.riskLevel),
                    color: getRiskColor(eq.riskLevel),
                  }}
                >
                  {eq.riskLevel} RISK
                </div>

                {/* Risk Factors */}
                <div className="risk-factors-mini">
                  <h4>Risk Factors:</h4>
                  {Object.entries(eq.factors)
                    .sort(([, a], [, b]) => b - a)
                    .map(([key, value]) => (
                      <div key={key} className="factor-mini">
                        <span className="factor-mini-label">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="factor-mini-bar">
                          <div
                            className="factor-mini-fill"
                            style={{
                              width: `${value}%`,
                              backgroundColor:
                                value > 70
                                  ? '#dc3545'
                                  : value > 50
                                  ? '#fd7e14'
                                  : '#ffc107',
                            }}
                          />
                        </div>
                        <span className="factor-mini-value">{value}%</span>
                      </div>
                    ))}
                </div>

                <div className="top-recommendation">
                  <div
                    className="recommendation-priority"
                    style={{
                      color:
                        eq.recommendations[0].priority === 'URGENT'
                          ? '#dc3545'
                          : eq.recommendations[0].priority === 'HIGH'
                          ? '#fd7e14'
                          : eq.recommendations[0].priority === 'MEDIUM'
                          ? '#ffc107'
                          : '#28a745',
                    }}
                  >
                    {eq.recommendations[0].priority}
                  </div>
                  <p className="recommendation-text">
                    {eq.recommendations[0].action}
                  </p>
                </div>
              </Card>
            ))
          ) : (
            <div className="no-results">
              <p>No equipment found for this risk level</p>
            </div>
          )}
        </div>

        <div className="analysis-info">
          <p>
            Last analyzed: {new Date(analysisData.allResults[0]?.analyzedAt).toLocaleString()}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Total equipment analyzed: {analysisData.totalAnalyzed}
          </p>
        </div>
      </div>
    </>
  );
};

export default EquipmentAnalysis;