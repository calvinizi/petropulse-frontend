import React, { useState, useEffect, useCallback } from 'react';
import { useHttpClient } from '../../hooks/HttpHook';
import { useLogin } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorModal from '../../components/common/ErrorModal';
import Modal from '../../components/common/Modal';
import './PredictiveMaintenanceWidget.css';

const PredictiveMaintenanceWidget = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { token } = useLogin();

  const [data, setData] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const fetchPredictiveData = useCallback(async () => {
    try {
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/predictive/dashboard-summary`,
        'GET',
        null,
        {
          Authorization: 'Bearer ' + token
        }
      );
      setData(responseData.data);
    } catch (err) {
      console.error('Error fetching predictive data:', err);
    }
  }, [sendRequest, token]);

  useEffect(() => {
    fetchPredictiveData();
  }, [fetchPredictiveData]);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL': return '#dc3545';
      case 'HIGH': return '#fd7e14';
      case 'MEDIUM': return '#ffc107';
      case 'LOW': return '#28a745';
      default: return '#6c757d';
    }
  };

  const showEquipmentDetails = (equipment) => {
    setSelectedEquipment(equipment);
  };

  const closeEquipmentDetails = () => {
    setSelectedEquipment(null);
  };

  if (isLoading) {
    return (
      <Card>
        <div className="predictive-widget-loading">
          <LoadingSpinner />
          <p>Analyzing equipment...</p>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />

      <Card>
        <div className="predictive-widget">
          {/* Header */}
          <div className="predictive-header">
            <h3>Predictive Maintenance</h3>
            <button className="predictive-refresh-btn" onClick={fetchPredictiveData}>
              REFRESH
            </button>
          </div>

          {/* Summary Stats */}
          <div className="predictive-risk-summary">
            <div className="predictive-stat-card critical">
              <div className="predictive-stat-number">{data.criticalRisk}</div>
              <div className="predictive-stat-label">Critical</div>
            </div>
            <div className="predictive-stat-card high">
              <div className="predictive-stat-number">{data.highRisk}</div>
              <div className="predictive-stat-label">High</div>
            </div>
            <div className="predictive-stat-card medium">
              <div className="predictive-stat-number">{data.mediumRisk}</div>
              <div className="predictive-stat-label">Medium</div>
            </div>
            <div className="predictive-stat-card low">
              <div className="predictive-stat-number">{data.lowRisk}</div>
              <div className="predictive-stat-label">Low</div>
            </div>
          </div>

          {/* Potential Cost */}
          {data.totalPotentialCost > 0 && (
            <div className="predictive-cost-alert">
              <span className="predictive-cost-icon">💰</span>
              <div>
                <strong>Potential Cost at Risk:</strong>
                <div className="predictive-cost-amount">
                  NGN {data.totalPotentialCost.toLocaleString()}
                </div>
                <small>If high-risk equipment fails</small>
              </div>
            </div>
          )}

          {/* Top 5 Highest Risk */}
          <div className="predictive-high-risk-list">
            <h4>Top Priority Equipment</h4>
            {data.top5HighestRisk.length === 0 ? (
              <p className="predictive-no-risk">All equipment in good condition!</p>
            ) : (
              <div className="predictive-equipment-list">
                {data.top5HighestRisk.map((equipment, index) => (
                  <div
                    key={equipment.equipmentId}
                    className="predictive-equipment-card"
                    onClick={() => showEquipmentDetails(equipment)}
                  >
                    <div className="predictive-equipment-rank">#{index + 1}</div>
                    <div className="predictive-equipment-info">
                      <div className="predictive-equipment-name">
                        {equipment.equipmentName}
                      </div>
                      <div className="predictive-equipment-tag">{equipment.equipmentTag}</div>
                    </div>
                    <div className="predictive-equipment-risk">
                      <div
                        className="predictive-risk-badge"
                        style={{ backgroundColor: getRiskColor(equipment.riskLevel) }}
                      />
                      <div className="predictive-risk-label">{equipment.riskLevel}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Last Updated */}
          <div className="predictive-widget-footer">
            <small>
              Last analyzed: {new Date(data.lastAnalyzed).toLocaleString()}
            </small>
          </div>
        </div>
      </Card>

      <Modal
        show={!!selectedEquipment}
        onCancel={closeEquipmentDetails}
        header={selectedEquipment?.equipmentName}
        headerClass="predictive-modal-header" 
        contentClass="predictive-modal-content-inner"
        footer={null} 
        className="predictive-modal"
      >
        <p className="predictive-modal-tag">{selectedEquipment?.equipmentTag}</p>

        <div className="predictive-modal-risk-score">
          <div
            className="predictive-risk-circle"
            style={{ borderColor: getRiskColor(selectedEquipment?.riskLevel) }}
          >
            <div className="predictive-risk-score-big">{selectedEquipment?.riskScore}%</div>
            <div className="predictive-risk-level-big">{selectedEquipment?.riskLevel}</div>
          </div>
        </div>

        <div className="predictive-risk-factors">
          <h4>Risk Factors:</h4>
          <div className="predictive-factor-bars">
            {selectedEquipment && Object.entries(selectedEquipment.factors).map(([key, value]) => (
              <div key={key} className="predictive-factor-bar">
                <div className="predictive-factor-label">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="predictive-factor-progress">
                  <div
                    className="predictive-factor-fill"
                    style={{
                      width: `${value}%`,
                      backgroundColor: value > 70 ? '#dc3545' : value > 50 ? '#fd7e14' : '#ffc107'
                    }}
                  />
                </div>
                <div className="predictive-factor-value">{value}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="predictive-recommendations">
          <h4>Recommendations:</h4>
          {selectedEquipment?.recommendations.map((rec, idx) => (
            <div key={idx} className={`predictive-recommendation ${rec.priority.toLowerCase()}`}>
              <div className="predictive-rec-priority">{rec.priority}</div>
              <div className="predictive-rec-action">{rec.action}</div>
              <div className="predictive-rec-reason">{rec.reason}</div>
              {rec.estimatedCost > 0 && (
                <div className="predictive-rec-cost">
                  Potential cost if ignored: NGN {rec.estimatedCost.toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default PredictiveMaintenanceWidget;