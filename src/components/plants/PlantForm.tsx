import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { FormInput } from '../FormInput';
import { FormSelect } from '../FormSelect';
import { FormTextarea } from '../FormTextarea';
import FormLayout from '../FormLayout';
import { Plant, Room } from '../../types';
import { getPlantTypes, getSunRequirements, getRooms, createPlant, updatePlant } from '../../lib/api';
import { useHouse } from '../../contexts/HouseContext';

interface FormData {
 name: string;
 roomId: string;
 type: 'indoor' | 'outdoor';
 sunRequirements: 'no sun' | 'partial shade' | 'full sun';
 maxHeight: number;
 maxWidth: number;
 notes?: string;
}

interface PlantFormProps {
 initialData?: Plant;
 onSubmit: (data: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => void;
 onCancel: () => void;
 isSubmitting?: boolean;
}

export function PlantForm({ initialData, onSubmit, onCancel, isSubmitting = false }: PlantFormProps) {
 const { currentHouse } = useHouse();
 const [error, setError] = useState<string | null>(null);

 const { data: typeOptions = [], isLoading: isLoadingTypes } = useQuery({
  queryKey: ['plantTypes'],
  queryFn: getPlantTypes
 });

 const { data: sunRequirementOptions = [], isLoading: isLoadingSunRequirements } = useQuery({
  queryKey: ['sunRequirements'],
  queryFn: getSunRequirements
 });

 const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
  queryKey: ['rooms', currentHouse?.id],
  queryFn: () => getRooms(currentHouse?.id || ''),
  enabled: !!currentHouse?.id
 });

 const roomOptions = rooms.map(room => ({
  value: room.id,
  label: room.name
 }));

 const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
  defaultValues: {
   name: initialData?.name || '',
   roomId: initialData?.roomId || '',
   type: initialData?.type || 'indoor',
   sunRequirements: initialData?.sunRequirements || 'partial shade',
   maxHeight: initialData?.maxHeight || 0,
   maxWidth: initialData?.maxWidth || 0,
   notes: initialData?.notes || ''
  }
 });

 const formValues = watch();

 const onValid = async (data: FormData) => {
  try {
   const formattedData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'> = {
    name: data.name,
    type: data.type,
    sunRequirements: data.sunRequirements,
    maxHeight: data.maxHeight,
    maxWidth: data.maxWidth,
    notes: data.notes || null,
    roomId: data.type === 'indoor' ? data.roomId : '',
    houseId: currentHouse?.id || ''
   };

   if (initialData) {
    await updatePlant(initialData.id, formattedData);
   } else {
    await createPlant(formattedData, currentHouse?.id || '');
   }
   onSubmit(formattedData);
  } catch (error) {
   console.error('Error saving plant:', error);
   setError('Failed to save plant. Please try again.');
  }
 };

 const onInvalid = (errors: any) => {
  console.error('Validation errors:', errors);
  setError('Please fix the validation errors and try again.');
 };

 const handleFormSubmit = handleSubmit(onValid, onInvalid);

 const onSubmitForm = (e: React.FormEvent) => {
  e.preventDefault();
  handleFormSubmit(e as unknown as React.BaseSyntheticEvent);
 };

 return (
  <FormLayout
   title={initialData?.id ? 'Edit Plant' : 'Add Plant'}
   description="Add a plant to your inventory"
   onSubmit={onSubmitForm}
   onCancel={onCancel}
   isSubmitting={isSubmitting}
  >
   <div className="space-y-4">
    {error && (
     <div className="text-red-500 text-sm">{error}</div>
    )}

    <FormInput
     id="name"
     label="Plant Name"
     value={formValues.name}
     error={errors.name?.message}
     {...register('name', { required: 'Plant name is required' })}
    />

    <FormSelect
     id="type"
     label="Type"
     options={[
      { value: 'indoor', label: 'Indoor' },
      { value: 'outdoor', label: 'Outdoor' }
     ]}
     value={formValues.type}
     error={errors.type?.message}
     disabled={isLoadingTypes}
     {...register('type', { required: 'Type is required' })}
    />

    {formValues.type === 'indoor' && (
     <FormSelect
      id="roomId"
      label="Room"
      options={roomOptions}
      value={formValues.roomId}
      error={errors.roomId?.message}
      disabled={isLoadingRooms}
      {...register('roomId', {
       required: formValues.type === 'indoor' ? 'Room is required for indoor plants' : false
      })}
     />
    )}

    <FormSelect
     id="sunRequirements"
     label="Sun Requirements"
     options={[
      { value: 'no sun', label: 'No Sun' },
      { value: 'partial shade', label: 'Partial Shade' },
      { value: 'full sun', label: 'Full Sun' }
     ]}
     value={formValues.sunRequirements}
     error={errors.sunRequirements?.message}
     disabled={isLoadingSunRequirements}
     {...register('sunRequirements', { required: 'Sun requirements is required' })}
    />

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
     <FormInput
      id="maxHeight"
      label="Max Height (ft)"
      type="number"
      step="0.1"
      min="0"
      error={errors.maxHeight?.message}
      {...register('maxHeight', { required: 'Max height is required', min: 0 })}
     />

     <FormInput
      id="maxWidth"
      label="Max Width (ft)"
      type="number"
      step="0.1"
      min="0"
      error={errors.maxWidth?.message}
      {...register('maxWidth', { required: 'Max width is required', min: 0 })}
     />
    </div>

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