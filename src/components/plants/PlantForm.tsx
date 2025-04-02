import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { FormInput } from '../FormInput';
import { FormSelect } from '../FormSelect';
import { FormTextarea } from '../FormTextarea';
import FormLayout from '../FormLayout';
import { Plant } from '../../types';
import { getPlantTypes, getSunRequirements, getLocations, createPlant, updatePlant } from '../../lib/api';
import { useHouse } from '../../contexts/HouseContext';

interface FormData {
 name: string;
 locationId: string;
 type: 'indoor' | 'outdoor';
 sunRequirements: 'no sun' | 'partial shade' | 'full sun';
 maxHeight: number;
 maxWidth: number;
 notes?: string;
}

interface PlantFormProps {
 initialData?: Plant;
 onSubmit: (data: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
 onCancel: () => void;
 isSubmitting?: boolean;
}

export default function PlantForm({
 initialData,
 onSubmit,
 onCancel,
 isSubmitting = false
}: PlantFormProps) {
 const { currentHouse } = useHouse();
 const [error, setError] = useState<string | null>(null);

 const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  defaultValues: initialData ? {
   name: initialData.name,
   locationId: initialData.locationId,
   type: initialData.type,
   sunRequirements: initialData.sunRequirements,
   maxHeight: initialData.maxHeight,
   maxWidth: initialData.maxWidth,
   notes: initialData.notes || ''
  } : undefined
 });

 const { data: locations = [] } = useQuery({
  queryKey: ['locations', currentHouse?.id],
  queryFn: () => currentHouse ? getLocations(currentHouse.id) : Promise.resolve([]),
  enabled: !!currentHouse
 });

 const locationOptions = locations.map(location => ({
  value: location.id,
  label: location.name
 }));

 const onValid = async (data: FormData) => {
  try {
   await onSubmit({
    name: data.name,
    locationId: data.locationId,
    type: data.type,
    sunRequirements: data.sunRequirements,
    maxHeight: data.maxHeight,
    maxWidth: data.maxWidth,
    notes: data.notes || null,
    houseId: currentHouse?.id || ''
   });
  } catch (error) {
   console.error('Error saving plant:', error);
   setError('Failed to save plant. Please try again.');
  }
 };

 return (
  <FormLayout
   title={initialData ? 'Edit Plant' : 'Add Plant'}
   description="Record the details of a plant in your home"
   onSubmit={handleSubmit(onValid)}
   onCancel={onCancel}
   isSubmitting={isSubmitting}
  >
   <div className="space-y-4">
    {error && (
     <div className="text-red-500 text-sm">{error}</div>
    )}

    <FormInput
     id="name"
     label="Name"
     error={errors.name?.message}
     {...register('name', { required: 'Name is required' })}
    />

    <FormSelect
     id="locationId"
     label="Location"
     options={locationOptions}
     error={errors.locationId?.message}
     {...register('locationId', { required: 'Location is required' })}
    />

    <FormSelect
     id="type"
     label="Type"
     options={[
      { value: 'indoor', label: 'Indoor' },
      { value: 'outdoor', label: 'Outdoor' }
     ]}
     error={errors.type?.message}
     {...register('type', { required: 'Type is required' })}
    />

    <FormSelect
     id="sunRequirements"
     label="Sun Requirements"
     options={[
      { value: 'no sun', label: 'No Sun' },
      { value: 'partial shade', label: 'Partial Shade' },
      { value: 'full sun', label: 'Full Sun' }
     ]}
     error={errors.sunRequirements?.message}
     {...register('sunRequirements', { required: 'Sun requirements are required' })}
    />

    <FormInput
     id="maxHeight"
     label="Maximum Height (inches)"
     type="number"
     error={errors.maxHeight?.message}
     {...register('maxHeight', { required: 'Maximum height is required' })}
    />

    <FormInput
     id="maxWidth"
     label="Maximum Width (inches)"
     type="number"
     error={errors.maxWidth?.message}
     {...register('maxWidth', { required: 'Maximum width is required' })}
    />

    <FormTextarea
     id="notes"
     label="Notes"
     error={errors.notes?.message}
     {...register('notes')}
    />
   </div>
  </FormLayout>
 );
} 