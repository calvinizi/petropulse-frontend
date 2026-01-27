import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ChevronLeft, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useHttpClient } from '../../../hooks/HttpHook';
import { useLogin } from '../../../context/AuthContext';

import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Modal from '../../../components/common/Modal';
import ErrorModal from '../../../components/common/ErrorModal';


import "../../Equipment/EquipmentNew.css"; 

const SiteEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { token, role } = useLogin();
  
  const [loadedSite, setLoadedSite] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
      const fetchSite = async () => {
        try {
          const responseData = await sendRequest(
            `${process.env.REACT_APP_BACKEND_URL}/sites/${id}`,
            "GET",
            null,
            { Authorization: 'Bearer ' + token }
          );
          
          const site = responseData.site;
          setLoadedSite(site);
  
          reset({
            siteName: site.name ,
            siteCode: site.code,
            address: site.address,
            sitePurpose: site.purpose,
            siteDescription: site.description
          });
  
        } catch (error) {
          console.log(error);
        }
      };
  
      fetchSite();
    }, [id, sendRequest, token, reset]);


  const onSubmit =  async(data) => {
     if (role === 'Admin' || role === 'Supervisor') {
      try {
        await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/sites/${id}`,
          'PUT',
          JSON.stringify({
           name: data.siteName,
           address: data.address,
           purpose: data.sitePurpose,
           description: data.siteDescription
          }),
          { 
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token 
          }
        );
        navigate('/settings', { state: { refetch: true } });;
      } catch (error) {
        console.log(error);
      }
    } else {
      alert('You cannot perform this action');
      navigate('/settings');
    }
  };
  
 
  const showDeleteWarningHandler = (id, name) => {
    setSiteToDelete({ id, name });
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
    setSiteToDelete(null);
  };

  const confirmDeleteHandler = async () => {
    if (!siteToDelete) return;

    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/site/${siteToDelete.id}`,
        'DELETE',
        null,
        { Authorization: 'Bearer ' + token }
      );

      setShowConfirmModal(false);
      setSiteToDelete(null);
      navigate('/settings');
      
    } catch (error) {
      console.log('Error deleting work order:', error);
    }
  };



  if (isLoading && !loadedSite) {
    return <LoadingSpinner asOverlay />;
  }

  if (!loadedSite && !isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h2>Site not found</h2>
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
          Do you want to proceed and delete <strong>{siteToDelete?.name}</strong>? 
          This will also delete the equipments assigned to this site.
          Please note that this action cannot be undone.
        </p>
      </Modal>

      <div className="animate-fade-in">
        <div className="form-header" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => navigate('/settings')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <ChevronLeft />
              </button>
              <div>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Edit Site</h2>
                <p style={{ color: '#64748b', margin: '0.5rem 0 0', fontSize:'0.9rem' }}>
                  ID: {loadedSite?.code}
                </p>
              </div>
            </div>

            <Button 
              className="btn-danger" 
              icon={Trash2} 
              onClick={()=> showDeleteWarningHandler(loadedSite?.id, loadedSite?.name)}
            >
              Delete Site
            </Button>

          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ maxWidth: '800px' }}>
            <div className="card">
              <h3>Location Details</h3>

              <div className="form-grid">
                <div style={{ gridColumn: '1 / -1' }}>
                  <Input
                    label="Site Name"
                    placeholder={
                      errors.siteName
                        ? errors.siteName.message
                        : 'e.g. West Storage Hub'
                    }
                    {...register('siteName', {
                      required: 'Site name is required',
                      minLength: {
                        value: 3,
                        message: 'Name must be at least 3 characters',
                      },
                    })}
                  />
                  {errors.siteName && (
                    <span className="error-message">{errors.siteName.message}</span>
                  )}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <Input
                    label="Unique Site Code"
                    readOnly
                    style={{ cursor: 'not-allowed' }}
                    placeholder={
                      errors.siteCode
                        ? errors.siteCode.message
                        : 'e.g. SITE-001'
                    }
                    {...register('siteCode', {
                      required: 'Site code is required'
                    })}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <Input
                    label="Site Purpose"
                    placeholder={
                      errors.sitePurpose
                        ? errors.sitePurpose.message
                        : 'e.g. Primary Drilling, Storage, Logistics'
                    }
                    {...register('sitePurpose', {
                      required: 'Site purpose is required',
                    })}
                  />
                  {errors.sitePurpose && (
                    <span className="error-message">{errors.sitePurpose.message}</span>
                  )}
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Site Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder={
                      errors.siteDescription
                        ? errors.siteDescription.message
                        : 'Briefly describe the site operations...'
                    }
                    {...register('siteDescription', {
                      required: 'Description is required',
                    })}
                  />
                  {errors.siteDescription && (
                    <span className="error-message">{errors.siteDescription.message}</span>
                  )}
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Full Address / Coordinates</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder={
                      errors.address
                        ? errors.address.message
                        : '123 Energy Dr, Sector 4...'
                    }
                    {...register('address', {
                      required: 'Address or coordinates are required',
                      minLength: {
                        value: 10,
                        message: 'Please enter a valid address',
                      },
                    })}
                  />
                  {errors.address && (
                    <span className="error-message">{errors.address.message}</span>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => navigate('/settings')}
                >
                  Cancel
                </Button>
                <Button icon={Save} type="submit">
                  Update Site
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default SiteEdit;