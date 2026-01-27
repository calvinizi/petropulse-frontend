import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ChevronLeft, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorModal from '../../components/common/ErrorModal';
import { useForm, Controller } from 'react-hook-form';
import { useHttpClient } from '../../hooks/HttpHook';
import { useLogin } from '../../context/AuthContext';
import './WorkOrderNew.css';

const WorkOrderEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { token, role } = useLogin();

  const [equipmentData, setEquipmentData] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loadedWorkOrder, setLoadedWorkOrder] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [workOrderToDelete, setWorkOrderToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      priority: '',
      equipment: '',
      scheduledStartDate: '',
      dueDate: '',
      description: '',
      assignedTechnician: '',
      estimatedHours: ''
    }
  });

  useEffect(() => {
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
  }, [sendRequest, token]);

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
    const fetchWorkOrder = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/workorders/${id}`,
          "GET",
          null,
          { Authorization: 'Bearer ' + token }
        );
        
        const workOrder = responseData.workOrder;
        setLoadedWorkOrder(workOrder);

        const formatDate = (date) => {
          if (!date) return '';
          return new Date(date).toISOString().split('T')[0];
        };

        reset({
          title: workOrder.title,
          priority: workOrder.priority,
          equipment: workOrder.equipment?.id || workOrder.equipment?._id || '',
          scheduledStartDate: formatDate(workOrder.scheduledStart),
          dueDate: formatDate(workOrder.dueDate),
          description: workOrder.description || '',
          assignedTechnician: workOrder.assignedTo?.id || workOrder.assignedTo?._id || 'Randomize',
          estimatedHours: workOrder.estimatedDuration || 0
        });

      } catch (error) {
        console.log(error);
      }
    };

    fetchWorkOrder();
  }, [id, sendRequest, token, reset]);

  const onSubmit = async (data) => {
    if (role === 'Admin' || role === 'Supervisor') {
      try {
        await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/workorders/${id}`,
          'PUT',
          JSON.stringify({
            title: data.title,
            priority: data.priority,
            equipment: data.equipment,
            scheduledStart: data.scheduledStartDate,
            dueDate: data.dueDate,
            description: data.description,
            assignedTo: data.assignedTechnician,
            estimatedDuration: parseFloat(data.estimatedHours),
          }),
          { 
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token 
          }
        );
        navigate('/workorders');
      } catch (error) {
        console.log(error);
      }
    } else {
      alert('You cannot perform this action');
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

      setShowConfirmModal(false);
      setWorkOrderToDelete(null);
      navigate('/workorders');
      
    } catch (error) {
      console.log('Error deleting work order:', error);
    }
  };

  if (isLoading && !loadedWorkOrder) {
    return <LoadingSpinner asOverlay />;
  }

  if (!loadedWorkOrder && !isLoading) {
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
      {isLoading && <LoadingSpinner asOverlay />}

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
            <h2>Edit Work Order</h2>
            <p className="subtitle">{loadedWorkOrder?.tag}</p>
          </div>

          <Button
            className="btn-danger"
            icon={Trash2}
            onClick={() => showDeleteWarningHandler(loadedWorkOrder?.id, loadedWorkOrder?.title)}
          >
            Delete Order
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="form-card">
          <h3 className="section-title">Job Details</h3>

          <div className="form-grid">
            <Input
              label="Work Order Title"
              placeholder={
                errors.title ? errors.title.message : 'e.g. Pump Seal Replacement'
              }
              {...register('title', {
                required: 'Work Order Title is required',
                minLength: {
                  value: 5,
                  message: 'Title must be at least 5 characters',
                },
              })}
            />

            <div className="form-group">
              <label className="form-label">Priority</label>
              <Controller
                name="priority"
                control={control}
                rules={{ required: 'Priority is required' }}
                render={({ field }) => (
                  <Select className="std-select" {...field}>
                    <option value="">Select Priority...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </Select>
                )}
              />
              {errors.priority && (
                <span className="error-message">{errors.priority.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Target Equipment</label>
              <Controller
                name="equipment"
                control={control}
                rules={{ required: 'Please select equipment' }}
                render={({ field }) => (
                  <Select className="std-select" {...field}>
                    <option value="">Select Equipment...</option>
                    {equipmentData.map((equipment) => (
                      <option key={equipment._id} value={equipment._id}>
                        {equipment.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.equipment && (
                <span className="error-message">{errors.equipment.message}</span>
              )}
            </div>

            <Input
              label="Scheduled Start Date"
              type="date"
              {...register('scheduledStartDate', {
                required: 'Scheduled Start Date is required',
              })}
            />

            <Input
              label="Due Date"
              type="date"
              {...register('dueDate', {
                required: 'Due Date is required',
              })}
            />
            
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Description / Instructions</label>
            <textarea
              className="std-textarea"
              rows="4"
              placeholder={
                errors.description
                  ? errors.description.message
                  : 'Describe the issue and steps to fix...'
              }
              {...register('description', {
                required: 'Description is required',
                minLength: {
                  value: 10,
                  message: 'Please provide at least 10 characters',
                },
              })}
            />
          </div>

          <h3 className="section-title" style={{ marginTop: '2rem' }}>
            Assignment
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Assigned Technician</label>
              <Controller
                name="assignedTechnician"
                control={control}
                render={({ field }) => (
                  <Select className="std-select" {...field}>
                    <option value="Randomize">Randomize (Auto-Assign)</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </div>

            <Input
              label="Estimated Hours"
              type="number"
              placeholder={errors.estimatedHours ? errors.estimatedHours.message : '0'}
              {...register('estimatedHours', {
                required: 'Estimated hours is required',
                min: {
                  value: 0.5,
                  message: 'Minimum 0.5 hours',
                },
              })}
            />
          </div>

          <div className="form-actions">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button icon={Save} type="submit">
              Update Order
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default WorkOrderEdit;