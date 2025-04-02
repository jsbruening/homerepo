import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { FormInput } from '../FormInput';
import { FormSelect } from '../FormSelect';
import { FormTextarea } from '../FormTextarea';
import FormLayout from '../FormLayout';
import { PaintRecord } from '../../types';
import { getLocations, getPaintManufacturers } from '../../lib/api';
import { useHouse } from '../../contexts/HouseContext';

interface FormData {
 manufacturerId: string;
 locationId: string;
 color: string;
 paintType: string;
 finishType: string;
 date: string;
 notes?: string;
}

interface PaintFormProps {
 initialData?: PaintRecord;
 onSubmit: (data: Omit<PaintRecord, 'id' | 'createdAt' | 'updatedAt' | 'manufacturer' | 'location'>) => void;
 onCancel: () => void;
 isSubmitting?: boolean;
}

export default function PaintRecordForm({
 initialData,
 onSubmit,
 onCancel,
 isSubmitting = false
}: PaintFormProps) {
 const { currentHouse } = useHouse();
 const [error, setError] = useState<string | null>(null);

 const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
  defaultValues: initialData ? {
   manufacturerId: initialData.manufacturerId,
   locationId: initialData.locationId,
   color: initialData.color,
   paintType: initialData.paintType,
   finishType: initialData.finishType,
   date: initialData.date,
   notes: initialData.notes || ''
  } : undefined
 });

 const { data: manufacturers = [] } = useQuery({
  queryKey: ['manufacturers'],
  queryFn: getPaintManufacturers
 });

 const { data: locations = [] } = useQuery({
  queryKey: ['locations', currentHouse?.id],
  queryFn: () => currentHouse ? getLocations(currentHouse.id) : Promise.resolve([]),
  enabled: !!currentHouse
 });

 const manufacturerOptions = manufacturers.map(manufacturer => ({
  value: manufacturer.id,
  label: manufacturer.name
 }));

 const locationOptions = locations.map(location => ({
  value: location.id,
  label: location.name
 }));

 const onValid = async (data: FormData) => {
  try {
   if (!currentHouse?.id) {
    throw new Error('No house selected');
   }

   if (!data.locationId) {
    throw new Error('Location is required');
   }

   const formattedDate = new Date(data.date).toISOString();

   const formattedData: Omit<PaintRecord, 'id' | 'createdAt' | 'updatedAt' | 'manufacturer' | 'location'> = {
    manufacturerId: data.manufacturerId,
    locationId: data.locationId,
    color: data.color,
    paintType: data.paintType,
    finishType: data.finishType,
    date: formattedDate,
    notes: data.notes || null,
    houseId: currentHouse.id
   };

   onSubmit(formattedData);
  } catch (error) {
   console.error('Error saving paint record:', error);
   setError('Failed to save paint record. Please try again.');
  }
 };

 return (
  <FormLayout
   title={initialData ? 'Edit Paint Record' : 'Add Paint Record'}
   description="Record the paint details for a location in your home"
   onSubmit={handleSubmit(onValid)}
   onCancel={onCancel}
   isSubmitting={isSubmitting}
  >
   <div className="space-y-4">
    {error && (
     <div className="text-red-500 text-sm">{error}</div>
    )}

    <FormSelect
     id="manufacturerId"
     label="Manufacturer"
     options={manufacturerOptions}
     error={errors.manufacturerId?.message}
     {...register('manufacturerId', { required: 'Manufacturer is required' })}
    />

    <FormSelect
     id="locationId"
     label="Location"
     options={locationOptions}
     error={errors.locationId?.message}
     {...register('locationId', { required: 'Location is required' })}
    />

    <FormInput
     id="color"
     label="Color"
     error={errors.color?.message}
     {...register('color', { required: 'Color is required' })}
    />

    <FormSelect
     id="paintType"
     label="Paint Type"
     options={[
      { value: 'interior', label: 'Interior' },
      { value: 'exterior', label: 'Exterior' }
     ]}
     error={errors.paintType?.message}
     {...register('paintType', { required: 'Paint type is required' })}
    />

    <FormSelect
     id="finishType"
     label="Finish Type"
     options={[
      { value: 'flat', label: 'Flat' },
      { value: 'eggshell', label: 'Eggshell' },
      { value: 'satin', label: 'Satin' },
      { value: 'semi-gloss', label: 'Semi-Gloss' },
      { value: 'gloss', label: 'Gloss' }
     ]}
     error={errors.finishType?.message}
     {...register('finishType', { required: 'Finish type is required' })}
    />

    <FormInput
     id="date"
     label="Date"
     type="date"
     error={errors.date?.message}
     {...register('date', { required: 'Date is required' })}
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