import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useForm } from 'react-hook-form';
import { useHttpClient } from '../../../hooks/HttpHook';
import { useLogin } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorModal from '../../../components/common/ErrorModal';
import "../../Equipment/EquipmentNew.css"; 

const SiteNew = () => {
  const navigate = useNavigate();
  const { isLoading, clearError, sendRequest, error } = useHttpClient();
  const { token, role } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (role === 'Admin' || role === 'Supervisor') {
      try {
        await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/sites`,
          'POST',
          JSON.stringify({
            name: data.siteName,
            purpose: data.sitePurpose,
            description: data.siteDescription,
            address: data.address,
          }),
          {
            Authorization: 'Bearer ' + token,
          }
        );

        navigate('/settings', { state: { refetch: true } });;
      } catch (error) {
        console.log(error);
      }
    } else {
      alert('You do not have permission to create sites.');
    }
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading ? <LoadingSpinner asOverlay /> : null}
      <div className="animate-fade-in">
      
      <div className="form-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Register New Site</h2>
            <p style={{ color: '#64748b', margin: '0.5rem 0 0' }}>
              Create a new location for equipment assignment.
            </p>
          </div>
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
                      : '123 Energy Dr, Sector 4, Offshore Platform Delta...'
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
                Create Site
              </Button>
            </div>
          </div>
        </div>
      </form>
      </div>
    </>
  );
};

export default SiteNew;