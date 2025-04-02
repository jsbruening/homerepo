import { useForm } from 'react-hook-form';
import { FormInput } from '../FormInput';
import { FormSelect } from '../FormSelect';
import { FormTextarea } from '../FormTextarea';
import FormLayout from '../FormLayout';
import { HomeService, ServiceType, Recurrence } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { getServiceTypes, getRecurrences } from '../../lib/api';

interface HomeServiceFormProps {
 initialData?: Partial<HomeService>;
 onSubmit: (data: Omit<HomeService, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
 onCancel: () => void;
 isSubmitting?: boolean;
}

interface FormData {
 serviceTypeId: string;
 provider: string;
 date: string;
 status: 'scheduled' | 'completed' | 'cancelled';
 recurrenceId: string;
 notes: string;
}

const statusOptions = [
 { value: 'scheduled', label: 'Scheduled' },
 { value: 'completed', label: 'Completed' },
 { value: 'cancelled', label: 'Cancelled' },
];

export default function HomeServiceForm({
 initialData,
 onSubmit,
 onCancel,
 isSubmitting = false
}: HomeServiceFormProps) {
 const { data: serviceTypes = [], isLoading: isLoadingServiceTypes } = useQuery({
  queryKey: ['serviceTypes'],
  queryFn: getServiceTypes
 });

 const { data: recurrences = [], isLoading: isLoadingRecurrences } = useQuery({
  queryKey: ['recurrences'],
  queryFn: getRecurrences
 });

 const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
  defaultValues: {
   serviceTypeId: initialData?.serviceType?.id || '',
   provider: initialData?.provider || '',
   date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
   status: initialData?.status || 'scheduled',
   recurrenceId: initialData?.recurrence?.id || '',
   notes: initialData?.notes || '',
  }
 });

 const formValues = watch();
 console.log('Form Values:', formValues);
 console.log('Initial Data:', initialData);

 const handleFormSubmit = handleSubmit(async (data) => {
  // Convert the date string to ISO format and find the recurrence object
  const selectedRecurrence = recurrences.find(r => r.id === data.recurrenceId);
  const selectedServiceType = serviceTypes.find(st => st.id === data.serviceTypeId);

  const formattedData: Omit<HomeService, 'id' | 'createdAt' | 'updatedAt'> = {
   serviceType: selectedServiceType || null,
   provider: data.provider,
   date: new Date(data.date).toISOString(),
   status: data.status,
   recurrence: selectedRecurrence || null,
   notes: data.notes,
   houseId: initialData?.houseId || '' // This will be set by the parent component
  };

  await onSubmit(formattedData);
 });

 const serviceTypeOptions = serviceTypes.map(type => ({
  value: type.id,
  label: type.name
 }));

 const recurrenceOptions = recurrences.map(recurrence => ({
  value: recurrence.id,
  label: recurrence.name
 }));

 return (
  <FormLayout
   title={initialData?.id ? 'Edit Service' : 'Schedule Service'}
   description="Schedule a service for your home"
   onSubmit={handleFormSubmit}
   onCancel={onCancel}
   isSubmitting={isSubmitting}
  >
   <div className="space-y-4">
    <FormSelect
     id="serviceTypeId"
     label="Service Type"
     options={serviceTypeOptions}
     value={formValues.serviceTypeId}
     error={errors.serviceTypeId?.message}
     disabled={isLoadingServiceTypes}
     {...register('serviceTypeId', { required: 'Service type is required' })}
    />

    <FormInput
     id="provider"
     label="Provider"
     error={errors.provider?.message}
     {...register('provider', { required: 'Provider is required' })}
    />

    <FormInput
     id="date"
     label="Date"
     type="date"
     error={errors.date?.message}
     {...register('date', { required: 'Date is required' })}
    />

    <FormSelect
     id="status"
     label="Status"
     options={statusOptions}
     value={formValues.status}
     error={errors.status?.message}
     {...register('status', { required: 'Status is required' })}
    />

    <FormSelect
     id="recurrenceId"
     label="Recurrence"
     options={recurrenceOptions}
     value={formValues.recurrenceId}
     error={errors.recurrenceId?.message}
     disabled={isLoadingRecurrences}
     {...register('recurrenceId', { required: 'Recurrence is required' })}
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