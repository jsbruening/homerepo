import { useForm } from 'react-hook-form';
import { FormInput } from '../FormInput';
import { FormSelect } from '../FormSelect';
import { FormTextarea } from '../FormTextarea';
import FormLayout from '../FormLayout';
import { Reminder, Recurrence } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { getRecurrences } from '../../lib/api';

interface ReminderFormProps {
 initialData?: Partial<Reminder>;
 onSubmit: (data: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
 onCancel: () => void;
 isSubmitting?: boolean;
 houseId: string;
}

export default function ReminderForm({
 initialData,
 onSubmit,
 onCancel,
 isSubmitting = false,
 houseId
}: ReminderFormProps) {
 const { data: recurrences = [] } = useQuery({
  queryKey: ['recurrences'],
  queryFn: getRecurrences
 });

 const recurrenceOptions = recurrences.map(recurrence => ({
  value: recurrence.id,
  label: recurrence.name
 }));

 const { register, handleSubmit, watch, formState: { errors } } = useForm({
  defaultValues: {
   title: initialData?.title || '',
   details: initialData?.details || '',
   dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
   recurrence: initialData?.recurrence?.id || '',
   completed: initialData?.completed || false,
  }
 });

 const formValues = watch();

 const handleFormSubmit = handleSubmit(async (data) => {
  // Find the selected recurrence
  const selectedRecurrence = data.recurrence ? recurrences.find(r => r.id === data.recurrence) : null;
  const formattedData = {
   title: data.title,
   details: data.details,
   dueDate: data.dueDate,
   recurrence: selectedRecurrence || null,
   completed: data.completed,
   houseId
  };
  await onSubmit(formattedData);
 });

 return (
  <FormLayout
   title={initialData?.id ? 'Edit Reminder' : 'Add Reminder'}
   description="Create a reminder for your home maintenance tasks"
   onSubmit={handleFormSubmit}
   onCancel={onCancel}
   isSubmitting={isSubmitting}
  >
   <div className="space-y-4">
    <FormInput
     id="title"
     label="Title"
     error={errors.title?.message}
     {...register('title', { required: 'Title is required' })}
    />

    <FormTextarea
     id="details"
     label="Details"
     error={errors.details?.message}
     {...register('details', { required: 'Details are required' })}
    />

    <FormInput
     id="dueDate"
     label="Due Date"
     type="date"
     error={errors.dueDate?.message}
     {...register('dueDate', { required: 'Due date is required' })}
    />

    <FormSelect
     id="recurrence"
     label="Recurrence"
     options={recurrenceOptions}
     value={formValues.recurrence}
     error={errors.recurrence?.message}
     {...register('recurrence')}
    />

    <div className="flex items-center">
     <input
      id="completed"
      type="checkbox"
      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
      {...register('completed')}
     />
     <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
      Mark as completed
     </label>
    </div>
   </div>
  </FormLayout>
 );
} 