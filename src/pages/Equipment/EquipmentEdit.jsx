import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ChevronLeft, Trash2, AlertCircle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import ImageUpload from '../../components/common/imageUpload';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ErrorModal from '../../components/common/ErrorModal';
import { useHttpClient } from '../../hooks/HttpHook';
import { useLogin } from '../../context/AuthContext';
import './EquipmentNew.css';

const EquipmentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { token, role } = useLogin();
  const [sites, setSites] = useState([]);
  const [loadedEquipment, setLoadedEquipment] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [updatedEquipmentData, setUpdatedEquipmentData] = useState(null);

  const showDeleteWarningHandler = (id, name) => {
    setEquipmentToDelete({ id, name });
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
    setEquipmentToDelete(null);
  };

  const { 
    register, 
    handleSubmit, 
    control,
    reset,
    formState: { errors }
  } = useForm();


  useEffect(() => {
    const fetchSites = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/sites`,
          "GET",
          null,
          {
            Authorization: 'Bearer ' + token
          }
        );
        setSites(responseData.sites);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSites();
  }, [sendRequest, token]);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/equipment/${id}`,
          "GET",
          null,
          {
            Authorization: 'Bearer ' + token
          }
        );
        
        const equipment = responseData.equipment;
        setLoadedEquipment(equipment);

        reset({
          equipmentName: equipment.name,
          equipmentId: equipment.tag,
          equipmentType: equipment.type,
          site: equipment.site._id || equipment.site,
          status: equipment.status,
          criticality: equipment.criticality,
          downtimeCost: equipment.downtimeCostPerHour,
          description: equipment.description || '',
          manufacturer: equipment.manufacturer,
          modelNumber: equipment.model,
          serialNumber: equipment.serialNumber,
          installDate: equipment.installDate ? equipment.installDate.split('T')[0] : '',
        });

      } catch (error) {
        console.log(error);
      }
    };

    fetchEquipment();
  }, [id, sendRequest, token, reset]);

  const onSubmit = async (data) => {
    console.log('Updating Equipment:', data);

    if (role === 'Admin' || role === 'Supervisor') {
      try {
        const formData = new FormData();
        formData.append('name', data.equipmentName);
        formData.append('type', data.equipmentType);
        formData.append('site', data.site);
        formData.append('status', data.status);
        formData.append('criticality', data.criticality);
        formData.append('downtimeCostPerHour', data.downtimeCost);
        formData.append('description', data.description);
        formData.append('manufacturer', data.manufacturer);
        formData.append('model', data.modelNumber);
        formData.append('serialNumber', data.serialNumber);
        formData.append('installDate', data.installDate);
        
        if (data.equipmentImage && data.equipmentImage instanceof File) {
          formData.append('photo', data.equipmentImage);
        }

        await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/equipment/${id}`,
          "PUT", 
          formData,
          {
            Authorization: 'Bearer ' + token
          }
        );

        const statusChanged = data.status !== loadedEquipment.status;
        const isNonOperational = ['Maintenance', 'Critical', 'Down'].includes(data.status);
        
        if (statusChanged && isNonOperational) {
          setUpdatedEquipmentData({
            id: id,
            name: data.equipmentName,
            status: data.status
          });
          setShowWorkOrderModal(true);
        } else {
          navigate('/equipment');
        }

      } catch (error) {
        console.log(error);
      }
    } else {
      alert("You do not have permission to edit equipment.");
    }
  };

  const handleCreateWorkOrder = () => {
    setShowWorkOrderModal(false);
    navigate(`/workorders/new`);
  };

  const handleSkipWorkOrder = () => {
    setShowWorkOrderModal(false);
    navigate('/equipment');
  };

  const confirmDeleteHandler = async () => {
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/equipment/${id}`,
        'DELETE',
        null,
        { Authorization: 'Bearer ' + token }
      );

      setShowConfirmModal(false);
      setEquipmentToDelete(null);

      navigate(-1);
      
    } catch (error) {
      console.log('Error deleting equipment:', error);
    }
  };

  if (isLoading && !loadedEquipment) {
    return <LoadingSpinner asOverlay />;
  }

  if (!loadedEquipment && !isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h2>Equipment not found</h2>
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
          Do you want to proceed and delete <strong>{equipmentToDelete?.name}</strong>? 
          This will also delete all associated work orders. 
          Please note that this action cannot be undone.
        </p>
      </Modal>

      {/* Work order modal */}
      {showWorkOrderModal && (
        <>
          <div className='wo-create'  onClick={handleSkipWorkOrder}>
            <div className='click' onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertCircle size={24} color="#f59e0b" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                  Create Work Order?
                </h3>
              </div>
              
              <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
                You edited <strong>{updatedEquipmentData?.name}</strong> to <strong>{updatedEquipmentData?.status}</strong> status. 
                Would you like to create a work order to address this?
              </p>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button 
                  variant="secondary" 
                  onClick={handleSkipWorkOrder}
                  style={{ minWidth: '100px' }}
                >
                  No, Skip
                </Button>
                <Button 
                  onClick={handleCreateWorkOrder}
                  style={{ minWidth: '100px' }}
                >
                  Yes, Create
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      
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
              <h2>Edit Equipment</h2>
              <p className="subtitle">
                ID: {loadedEquipment?.tag}
              </p>
            </div>

          <Button 
            onClick={() => showDeleteWarningHandler(loadedEquipment?.id, loadedEquipment?.name)}
            className="btn-danger"
            icon={Trash2}
          >
            Retire Asset
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="equipment-form-layout">
          <div className="main-form-section">
            <div className="card">
              <h3>Edit Details</h3>
              
              <div className="form-grid">
                <Input 
                  label="Equipment Name" 
                  placeholder={errors.equipmentName ? errors.equipmentName.message : "e.g. Centrifugal Pump A-7"}
                  {...register('equipmentName', { 
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                />
                  
                <Input 
                  label="Equipment Tag / ID" 
                  readOnly
                  style={{color:'#64748b'}}
                  {...register('equipmentId')}
                />

                <Input 
                  label="Equipment Type" 
                  placeholder={errors.equipmentType ? errors.equipmentType.message : "e.g. Pump"}
                  {...register('equipmentType', { 
                    required: 'Type is required',
                    minLength: { value: 2, message: 'Type must be at least 2 characters' }
                  })}
                />
                
                <div className="form-group">
                  <label className="form-label">Site Location</label>
                  <Controller
                    name="site"
                    control={control}
                    rules={{ required: 'Site is required' }}
                    render={({ field }) => (
                      <Select className="form-control" value={field.value} onChange={field.onChange}>
                        <option value="">Select Site...</option>
                        {sites.map((site) => (
                          <option key={site.id} value={site.id}>{site.name}</option>
                        ))}
                      </Select> 
                    )}
                  />
                  {errors.site && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.site.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Current Status</label>
                  <Controller
                    name="status"
                    control={control}
                    rules={{ required: 'Status is required' }}
                    render={({field}) => (
                      <Select className="form-control" value={field.value} onChange={field.onChange}> 
                        <option value="">Select Status...</option>
                        <option value="Operational">Operational</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Critical">Critical</option>
                        <option value="Down">Down</option>
                      </Select>
                    )}
                  />
                  {errors.status && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.status.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Criticality</label>
                  <Controller
                    name="criticality"
                    control={control}
                    rules={{ required: 'Criticality is required' }}
                    render={({field}) => (
                      <Select className="form-control" value={field.value} onChange={field.onChange}> 
                        <option value="">Select Criticality...</option>
                        <option value="A">High (A)</option>
                        <option value="B">Medium (B)</option>
                        <option value="C">Low (C)</option>
                      </Select>
                    )}
                  />
                  {errors.criticality && <span style={{color: 'red', fontSize: '0.8rem'}}>{errors.criticality.message}</span>}
                </div>

                <Input 
                  label="Downtime Cost ($/Hour)" 
                  type="number"
                  placeholder={errors.downtimeCost ? errors.downtimeCost.message : "e.g. 1500"}
                  {...register('downtimeCost', { 
                    required: 'Cost is required',
                    min: { value: 0, message: 'Cost must be positive' }
                  })}
                />
              </div>

              <div style={{marginTop: '1.5rem'}}>
                <Input 
                  label="Description" 
                  placeholder={errors.description ? errors.description.message : "Brief description..."}
                  {...register('description', { 
                    minLength: { value: 5, message: 'Description must be at least 5 characters' }
                  })}
                />
              </div>
              
              <h3 style={{marginTop: '2rem', marginBottom: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem'}}>
                Technical Details
              </h3>
              
              <div className="form-grid">
                <Input 
                  label="Manufacturer" 
                  placeholder={errors.manufacturer ? errors.manufacturer.message : "e.g. Grundfos"}
                  {...register('manufacturer', { required: 'Manufacturer is required' })} 
                />
                <Input 
                  label="Model Number" 
                  placeholder={errors.modelNumber ? errors.modelNumber.message : "e.g. M-100"}
                  {...register('modelNumber', { required: 'Model number is required' })} 
                />
                <Input 
                  label="Serial Number" 
                  placeholder={errors.serialNumber ? errors.serialNumber.message : "e.g. SN-12345"}
                  {...register('serialNumber', { required: 'Serial number is required' })} 
                />
                <Input 
                  label="Install Date" 
                  type="date" 
                  {...register('installDate', { required: 'Install date is required' })} 
                />
              </div>

              <div className="form-actions">
                <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
                <Button icon={Save} type="submit">Update Equipment</Button>
              </div>
            </div>
          </div>

          <div className="side-form-section">
            <Controller
              name="equipmentImage"
              control={control}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <ImageUpload
                  id="equipmentImage"
                  onChange={onChange}
                  value={value || (loadedEquipment?.photo ? `${loadedEquipment.photo}` : null)}
                  error={error?.message}
                  center
                />
              )}
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default EquipmentEdit;