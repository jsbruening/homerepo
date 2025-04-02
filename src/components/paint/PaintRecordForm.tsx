import { useForm } from 'react-hook-form';
import { FormInput } from '../FormInput';
import { FormSelect } from '../FormSelect';
import FormLayout from '../FormLayout';
import { PaintRecord, Room, PaintManufacturer } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { getRooms, getPaintManufacturers } from '../../lib/api';
import { useHouse } from '../../contexts/HouseContext';

interface PaintRecordFormProps {
 initialData?: Partial<PaintRecord>;
 onSubmit: (data: Omit<PaintRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
 onCancel: () => void;
 isSubmitting?: boolean;
}

interface FormData {
 manufacturerId: string;
 roomId: string;
 color: string;
 finish_type: string;
 paint_type: string;
}

export default function PaintRecordForm({
 initialData,
 onSubmit,
 onCancel,
 isSubmitting = false
}: PaintRecordFormProps) {
 const { currentHouse } = useHouse();

 console.log('Initial Data:', initialData);
 console.log('Initial Data Manufacturer:', initialData?.manufacturer);
 console.log('Initial Data Room:', initialData?.room);

 const { data: rooms = [] } = useQuery({
  queryKey: ['rooms', currentHouse?.id],
  queryFn: () => {
   if (!currentHouse?.id) return Promise.resolve([]);
   return getRooms(currentHouse.id);
  },
  enabled: !!currentHouse?.id
 });

 const { data: manufacturers = [] } = useQuery({
  queryKey: ['paintManufacturers'],
  queryFn: getPaintManufacturers
 });

 console.log('Rooms:', rooms);
 console.log('Manufacturers:', manufacturers);

 const roomOptions = rooms.map(room => ({
  value: room.id,
  label: room.name
 }));

 const manufacturerOptions = manufacturers.map(manufacturer => ({
  value: manufacturer.id,
  label: manufacturer.name
 }));

 const paintTypeOptions = [
  { value: 'interior', label: 'Interior' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'trim', label: 'Trim' }
 ];

 const finishTypeOptions = [
  { value: 'flat', label: 'Flat' },
  { value: 'eggshell', label: 'Eggshell' },
  { value: 'satin', label: 'Satin' },
  { value: 'semi-gloss', label: 'Semi-Gloss' },
  { value: 'gloss', label: 'Gloss' }
 ];

 const exteriorLocationOptions = [
  { value: 'garage_door', label: 'Garage Door' },
  { value: 'trim', label: 'Trim' },
  { value: 'walls', label: 'Walls' }
 ];

 console.log('Room Options:', roomOptions);
 console.log('Manufacturer Options:', manufacturerOptions);

 const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
  defaultValues: {
   manufacturerId: initialData?.manufacturer?.id || '',
   roomId: initialData?.paint_type === 'exterior' ? initialData?.room?.name || '' : initialData?.room?.id || '',
   color: initialData?.color || '',
   paint_type: initialData?.paint_type || 'interior',
   finish_type: initialData?.finish_type || 'flat'
  }
 });

 const formValues = watch();
 console.log('Form Values:', formValues);
 console.log('Form Errors:', errors);

 const handleFormSubmit = handleSubmit(async (formData) => {
  const manufacturer = manufacturers.find(m => m.id === formData.manufacturerId);

  let room = null;
  if (formData.paint_type === 'exterior') {
   // For exterior paint, create a room object with the location name
   room = {
    id: '',
    name: formData.roomId, // roomId contains the location value for exterior paint
    description: '',
    houseId: currentHouse?.id || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
   };
  } else {
   // For interior paint, find the actual room
   room = rooms.find(r => r.id === formData.roomId);
  }

  if (!manufacturer || !room) {
   throw new Error('Invalid manufacturer or room');
  }

  const paintRecord: Omit<PaintRecord, 'id' | 'createdAt' | 'updatedAt'> = {
   manufacturer,
   room,
   color: formData.color,
   finish: formData.finish_type,
   paint_type: formData.paint_type,
   finish_type: formData.finish_type,
   date: initialData?.date || new Date().toISOString(),
   notes: initialData?.notes || null,
   houseId: currentHouse?.id || ''
  };

  console.log('Submitting paint record:', paintRecord);
  await onSubmit(paintRecord);
 });

 return (
  <FormLayout
   title={initialData?.id ? 'Edit Paint' : 'Add Paint'}
   description="Record the paint details for a room in your home"
   onSubmit={handleFormSubmit}
   onCancel={onCancel}
   isSubmitting={isSubmitting}
  >
   <div className="space-y-4">
    <FormSelect
     id="paint_type"
     label="Paint Type"
     options={paintTypeOptions}
     value={formValues.paint_type}
     {...register('paint_type', { required: 'Paint type is required' })}
     error={errors.paint_type?.message}
    />

    {formValues.paint_type === 'exterior' ? (
     <FormSelect
      id="roomId"
      label="Location"
      options={exteriorLocationOptions}
      value={formValues.roomId}
      {...register('roomId', { required: 'Location is required' })}
      error={errors.roomId?.message}
     />
    ) : (
     <FormSelect
      id="roomId"
      label="Room"
      options={roomOptions}
      value={formValues.roomId}
      {...register('roomId', { required: 'Room is required' })}
      error={errors.roomId?.message}
     />
    )}

    <FormSelect
     id="manufacturerId"
     label="Manufacturer"
     options={manufacturerOptions}
     value={formValues.manufacturerId}
     {...register('manufacturerId', { required: 'Manufacturer is required' })}
     error={errors.manufacturerId?.message}
    />
    <FormSelect
     id="finish_type"
     label="Finish"
     options={finishTypeOptions}
     value={formValues.finish_type}
     {...register('finish_type', { required: 'Finish is required' })}
     error={errors.finish_type?.message}
    />
    <FormInput
     id="color"
     label="Color"
     {...register('color', { required: 'Color is required' })}
     error={errors.color?.message}
    />
   </div>
  </FormLayout>
 );
} 