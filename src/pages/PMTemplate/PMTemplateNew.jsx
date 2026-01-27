import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ChevronLeft, CheckSquare, Square } from 'lucide-react';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

import { useForm, Controller } from 'react-hook-form';
import { useHttpClient } from '../../hooks/HttpHook';
import { useLogin } from '../../context/AuthContext';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorModal from '../../components/common/ErrorModal';

import '../WorkOrder/WorkOrderNew.css';

const PMTemplateNew = () => {
  const navigate = useNavigate();
  const { isLoading, clearError, sendRequest, error } = useHttpClient();
  const { token, role } = useLogin();
  const [equipmentData, setEquipmentData] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      triggerType: 'Calendar',
      equipment: [], 
    },
  });

  const selectedEquipment = watch('equipment');

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
      } catch (error) {}
    };
    fetchEquipments();
  }, [sendRequest, token]);

  const handleEquipmentChange = (e) => {
    const { value, checked } = e.target;
    let newSelection = [...(selectedEquipment || [])];

    if (value === 'All Equipment') {
      newSelection = checked ? 'All Equipment' : [];
    } else {
      if (checked) {
        newSelection = newSelection.filter(item => item !== 'All Equipment');
        newSelection.push(value);
      } else {
        newSelection = newSelection.filter(item => item !== value);
      }
    }
    setValue('equipment', newSelection, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    if (role === 'Admin' || role === 'Supervisor') {
      try {
        await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/pm-templates`,
          'POST',
          JSON.stringify({
            title: data.templateName,
            frequencyType: data.triggerType,
            frequencyValue: parseInt(data.frequencyValue),
            equipment: data.equipment,
            description: data.instructions,
          }),
          { Authorization: 'Bearer ' + token }
        );
        navigate('/pm-templates');
      } catch (error) {
        console.log(error);
      }
    } else {
      alert('You do not have permission to create PM templates.');
    }
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading ? <LoadingSpinner asOverlay /> : null}
      <div className="animate-fade-in">
        <div className="page-top-left">
          <button
            className="back-btn"
            onClick={() => navigate('/pm-templates')}
            aria-label="Go back"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="title-area">
            <h2>New PM Template</h2>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="form-card">
          <h3 className="section-title">Schedule Rules</h3>

          <div className="form-grid">
            <Input
              label="Template Name"
              placeholder={errors.templateName ? errors.templateName.message : 'e.g. Monthly Vibration Check'}
              {...register('templateName', {
                required: 'Template name is required',
                minLength: { value: 5, message: 'At least 5 characters required' },
              })}
            />

            <div className="form-group">
              <label className="form-label">Trigger Type</label>
              <Controller
                name="triggerType"
                control={control}
                rules={{ required: 'Please select a trigger type' }}
                render={({ field }) => (
                  <Select className="std-select" {...field}>
                    <option value="Calendar">Calendar Based (Days)</option>
                    <option value="Runtime">Runtime Based (Hours)</option>
                  </Select>
                )}
              />
            </div>

            <Input
              label="Frequency Value"
              type="number"
              placeholder={errors.frequencyValue ? errors.frequencyValue.message : 'e.g. 30'}
              {...register('frequencyValue', {
                required: 'Frequency value is required',
                min: { value: 1, message: 'Must be at least 1' },
              })}
            />
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Applies To Equipment</label>
            
            <div className="equipment-selection-box">
                <label className={`equipment-option all-option ${selectedEquipment?.includes('All Equipment') ? 'selected' : ''}`}>
                    <input 
                        type="checkbox" 
                        value="All Equipment"
                        checked={selectedEquipment?.includes('All Equipment')}
                        onChange={handleEquipmentChange}
                        className="hidden-checkbox"
                    />
                    <div className="custom-check">
                        {selectedEquipment?.includes('All Equipment') && <CheckSquare size={18} className="text-blue-600"/>}
                        {!selectedEquipment?.includes('All Equipment') && <Square size={18} className="text-gray-400"/>}
                    </div>
                    <span className="option-label">Apply to All Equipment</span>
                </label>

                <div className="equipment-list-scroll">
                    {equipmentData.map((eq) => {
                        const isChecked = selectedEquipment?.includes(eq.id);
                        return (
                            <label key={eq.id} className={`equipment-option ${isChecked ? 'selected' : ''}`}>
                                <input 
                                    type="checkbox" 
                                    value={eq.id} 
                                    checked={isChecked}
                                    onChange={handleEquipmentChange}
                                    disabled={selectedEquipment?.includes('All Equipment')}
                                    className="hidden-checkbox"
                                />
                                <div className="custom-check">
                                    {isChecked ? <CheckSquare size={18} className="text-blue-600"/> : <Square size={18} className="text-gray-400"/>}
                                </div>
                                <div className="option-text">
                                    <span className="eq-name">{eq.name}</span>
                                    <span className="eq-tag">{eq.tag}</span>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>
            
            <input 
                type="hidden" 
                {...register('equipment', { 
                    validate: (value) => (value && value.length > 0) || "Please select at least one equipment" 
                })} 
            />
            {errors.equipment && <span className="error-message">{errors.equipment.message}</span>}
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Standard Instructions</label>
            <textarea
              className="std-textarea"
              rows="4"
              placeholder={errors.instructions ? errors.instructions.message : 'Check oil levels, inspect seals...'}
              {...register('instructions', {
                required: 'Instructions are required',
                minLength: { value: 20, message: 'Please provide detailed instructions (min 20 chars)' },
              })}
            />
          </div>

          <div className="form-actions">
            <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button icon={Save} type="submit">Save Template</Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PMTemplateNew;