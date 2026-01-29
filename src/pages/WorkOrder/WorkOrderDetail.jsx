import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Printer,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ImageUpload from '../../components/common/imageUpload';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorModal from '../../components/common/ErrorModal';
import { useHttpClient } from '../../hooks/HttpHook';
import { useLogin } from '../../context/AuthContext';

import './WorkOrderDetail.css';

const WorkOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { token, role } = useLogin();

  const [isJobCompleted, setIsJobCompleted] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [workOrder, setWorkOrder] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      endDate: new Date().toISOString().slice(0, 16)
    },
  });

  const fetchWorkOrder = useCallback(async () => {
    try {
      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/workorders/${id}`,
        'GET',
        null,
        { Authorization: 'Bearer ' + token }
      );
      setWorkOrder(responseData.workOrder);
      
      if (responseData.workOrder?.status === 'Completed') {
        setIsJobCompleted(true);
      } else {
        setIsJobCompleted(false);
      }
    } catch (error) {
      console.log(error);
    }
  }, [id, sendRequest, token]);

  useEffect(() => {
    fetchWorkOrder();
  }, [fetchWorkOrder]);

  // Print/Download as PDF function
  const handlePrint = () => {
    window.print();
  };

  const onSubmitCompletion = async (data) => {
    if (role === 'Viewer') {
      setPermissionError('You do not have permission to complete work orders.');
      return;
    }

    setIsSubmitting(true); 

    try {
      const formData = new FormData();
      formData.append('startedAt', data.startDate);
      formData.append('completedAt', data.endDate);
      formData.append('laborHours', parseFloat(data.laborHours));
      formData.append('notes', data.notes);
      
      if (data.completionImage) {
        formData.append('photo', data.completionImage);
      }

      const responseData = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/workorders/${id}/complete`,
        'PATCH',
        formData,
        { Authorization: 'Bearer ' + token }
      );

      setWorkOrder(responseData.workOrder);
      setIsJobCompleted(true);
      setShowCompleteModal(false);
      reset();

      await fetchWorkOrder();

      console.log('Work order completed successfully');
    } catch (error) {
      console.log('Error completing work order:', error);
    } finally {
      setIsSubmitting(false); 
    }
  };

  if (!workOrder && isLoading) {
    return <LoadingSpinner asOverlay />;
  }

  if (!workOrder && !isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h2>Work Order not found</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <ErrorModal error={permissionError} onClear={() => setPermissionError(null)} />
      {(isLoading || isSubmitting) && <LoadingSpinner asOverlay />} 
      
      <div className="animate-fade-in">
        <div className="page-top-left no-print">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="title-area">
            <h2>{workOrder.tag}</h2>
            <p className="subtitle">{workOrder.title}</p>
          </div>

          <Button variant="secondary" icon={Printer} onClick={handlePrint}>
            Print
          </Button>
          {!isJobCompleted && workOrder.status === 'In-Progress' && role === "Technician" && (
          <Button
            icon={CheckCircle}
            onClick={() => setShowCompleteModal(true)}
            disabled={isSubmitting}
            style={{ marginLeft: 'auto' }}
          >
            Complete Job
          </Button>
        )}
        </div>

        {/* Print-only header */}
        <div className="print-only print-header">
          <h1>Work Order Report</h1>
          <p><strong>{workOrder.tag}</strong> - {workOrder.title}</p>
          <p className="print-date">Printed: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="wo-detail-grid">
          <div className="detail-card">
            <h3>Job Information</h3>
            <div className="info-row">
              <span className="label">Status:</span>
              <StatusBadge status={workOrder.status} />
            </div>
            <div className="info-row">
              <span className="label">Priority:</span>
              <StatusBadge status={workOrder.priority} />
            </div>
            <div className="info-row">
              <span className="label">Equipment:</span>
              <span>{workOrder.equipment?.name || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Description:</span>
              <p style={{ marginTop: '0.5rem', lineHeight: '1.5' }}>
                {workOrder.description || 'No description available'}
              </p>
            </div>
          </div>

          <div className="detail-card">
            <h3>Scheduling</h3>
            <div className="info-block">
              <User size={16} className="icon" />
              <div>
                <p className="sub-label">Assigned To</p>
                <p>{workOrder.assignedTo?.name || 'Unassigned'}</p>
              </div>
            </div>
            
            <div className="info-block">
              <User size={16} className="icon" />
              <div>
                <p className="sub-label">Created By</p>
                <p>{workOrder.createdBy?.name || 'System'}</p>
              </div>
            </div>

            <div className="info-block">
              <Calendar size={16} className="icon" />
              <div>
                <p className="sub-label">Due Date</p>
                <p>{workOrder.dueDate ? new Date(workOrder.dueDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {workOrder.status === 'Completed' && (
          <div className="completion-section animate-fade-in">
            <h3 className="section-header">
              <CheckCircle size={20} className="text-emerald-600" /> Completion Report
            </h3>

            <div className="report-card">
              <div className="report-grid">
                <div className="report-item">
                  <span className="rep-label">Started</span>
                  <span className="rep-value">
                    {workOrder.startedAt
                      ? new Date(workOrder.startedAt).toLocaleString()
                      : '-'}
                  </span>
                </div>
                <div className="report-item">
                  <span className="rep-label">Completed</span>
                  <span className="rep-value">
                    {workOrder.completedAt 
                      ? new Date(workOrder.completedAt).toLocaleString()
                      : '-'}
                  </span>
                </div>
                <div className="report-item">
                  <span className="rep-label">Labor Hours</span>
                  <span className="rep-value">
                    {workOrder.laborHours || 0} hrs
                  </span>
                </div>
              </div>

              <div className="report-notes">
                <span className="rep-label">Technician Notes</span>
                <p>{workOrder.notes || 'No notes provided'}</p>
              </div>

              {workOrder.photo && (
                <div className="report-image">
                  <span className="rep-label">Proof of Work</span>
                  <div className="img-preview-box">
                    <img
                      src={`${workOrder.photo}`}
                      alt="Completion Proof"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <Modal
          show={showCompleteModal}
          onCancel={() => !isSubmitting && setShowCompleteModal(false)}
          header="Complete Job: Final Details"
          footer={
            <div className="modal-actions">
              <Button 
                variant="secondary" 
                onClick={() => setShowCompleteModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit(onSubmitCompletion)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit & Close Job'} 
              </Button>
            </div>
          }
        >
          <div className="form-row">
            <div style={{ flex: 1 }}>
              <label className="modal-label">Start Date</label>
              <Input
                type="datetime-local"
                className="modal-input"
                disabled={isSubmitting}
                {...register('startDate', { required: 'Start date is required' })}
              />
              {errors.startDate && (
                <span className="error-message">{errors.startDate.message}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label className="modal-label">Completion Date</label>
              <Input
                type="datetime-local"
                className="modal-input"
                disabled={isSubmitting}
                {...register('endDate', {
                  required: 'Completion date is required',
                  validate: (value) =>
                    !watch('startDate') || value >= watch('startDate')
                      ? true
                      : 'End date cannot be before start date',
                })}
              />
              {errors.endDate && (
                <span className="error-message">{errors.endDate.message}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="modal-label">Total Labor Hours</label>
            <div className="input-with-icon">
              <Clock size={16} className="input-icon" />
              <Input
                type="number"
                step="0.1"
                className="modal-input has-icon"
                placeholder="e.g. 2.5"
                disabled={isSubmitting}
                {...register('laborHours', {
                  required: 'Labor hours required',
                  min: { value: 0.1, message: 'Minimum 0.1 hours' },
                })}
              />
            </div>
            {errors.laborHours && (
              <span className="error-message">{errors.laborHours.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="modal-label">Job Notes / Resolution</label>
            <textarea
              className="modal-textarea"
              rows="4"
              placeholder="Describe repairs performed, parts replaced, findings..."
              disabled={isSubmitting} 
              {...register('notes', {
                required: 'Please add completion notes',
                minLength: { value: 20, message: 'At least 20 characters required' },
              })}
            />
            {errors.notes && (
              <span className="error-message">{errors.notes.message}</span>
            )}
          </div>
          <div className="form-group">
            <Controller
              name="completionImage"
              control={control}
              rules={{
                validate: {
                  fileSize: (value) => {
                    if (!value) return true;
                    return value.size <= 5000000 || "File size must be less than 5MB";
                  },
                  fileType: (value) => {
                    if (!value) return true;
                    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                    return validTypes.includes(value.type) || "Only JPG, JPEG, and PNG files are allowed";
                  }
                },
              }}
              render={({ field, fieldState }) => (
                <ImageUpload
                  ref={field.ref}
                  id="completionImage"
                  onChange={field.onChange}
                  value={field.value}
                  error={fieldState.error?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>
        </Modal>
      </div>
    </>
  );
};

export default WorkOrderDetail;