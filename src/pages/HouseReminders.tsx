import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CheckCircleIcon, PlusIcon, HomeModernIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReminders, createReminder, updateReminder, deleteReminder, completeReminder } from '../lib/api';
import { Reminder } from '../types';
import { useHouse } from '../contexts/HouseContext';
import ReminderForm from '../components/reminders/ReminderForm';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';

// Add a safe date formatting helper
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  try {
    // Ensure we're working with a valid date string
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch {
    return '';
  }
};

export default function HouseReminders() {
  const { currentHouse } = useHouse();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<Partial<Reminder> | undefined>(undefined);

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders', currentHouse?.id],
    queryFn: () => currentHouse ? getReminders(currentHouse.id) : Promise.resolve([]),
    enabled: !!currentHouse
  });

  const createMutation = useMutation({
    mutationFn: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!currentHouse?.id) {
        throw new Error('No house selected');
      }
      return createReminder(reminder, currentHouse.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', currentHouse?.id] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Reminder> }) =>
      updateReminder(id, { ...updates, houseId: currentHouse!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', currentHouse?.id] });
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', currentHouse?.id] });
      setIsDeleteDialogOpen(false);
    }
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => completeReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', currentHouse?.id] });
    }
  });

  const handleAddClick = () => {
    setCurrentReminder(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (reminder: Reminder) => {
    setCurrentReminder(reminder);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (reminder: Reminder) => {
    setCurrentReminder(reminder);
    setIsDeleteDialogOpen(true);
  };

  const handleCompleteToggle = (reminder: Reminder) => {
    if (reminder.id) {
      completeMutation.mutate(reminder.id);
    }
  };

  const handleSubmit = async (data: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentHouse) return;

    if (currentReminder?.id) {
      updateMutation.mutate({
        id: currentReminder.id,
        updates: { ...data, houseId: currentHouse.id }
      });
    } else {
      createMutation.mutate({ ...data, houseId: currentHouse.id });
    }
  };

  const handleDelete = () => {
    if (currentReminder?.id) {
      deleteMutation.mutate(currentReminder.id);
    }
  };

  const getRecurrenceBadgeClasses = (recurrence: Reminder['recurrence']) => {
    if (!recurrence) return 'bg-gray-100 text-gray-800';

    switch (recurrence.value) {
      case 'daily':
        return 'bg-emerald-100 text-emerald-800';
      case 'weekly':
        return 'bg-violet-100 text-violet-800';
      case 'monthly':
        return 'bg-sky-100 text-sky-800';
      case 'quarterly':
        return 'bg-amber-100 text-amber-800';
      case 'annual':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentHouse) {
    return (
      <div className="text-center py-12">
        <HomeModernIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No House Selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please select or create a house to manage reminders.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">House Reminders</h1>
          <p className="mt-2 text-sm text-gray-700">
            Keep track of all your house-related tasks and recurring maintenance reminders.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddClick}
          >
            Add Reminder
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-sm text-gray-500">Loading reminders...</span>
        </div>
      ) : reminders.length === 0 ? (
        <div className="mt-8 text-center py-12 bg-white rounded-lg shadow">
          <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reminders</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first reminder
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddClick}
            >
              Add Reminder
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <ul role="list" className="divide-y divide-gray-200 bg-white shadow rounded-lg overflow-hidden">
            {reminders.map((reminder) => (
              <li key={reminder.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 pt-1">
                    <button
                      className="rounded-full p-1 hover:bg-gray-100"
                      onClick={() => handleCompleteToggle(reminder)}
                    >
                      <CheckCircleIcon
                        className={`h-6 w-6 ${reminder.completed ? 'text-green-500' : 'text-gray-400'}`}
                      />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${reminder.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {reminder.title}
                      </p>
                      <div className="ml-4 flex flex-shrink-0 items-center space-x-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRecurrenceBadgeClasses(reminder.recurrence)}`}>
                          {reminder.recurrence?.name || 'One-time'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(reminder.dueDate)}
                        </span>
                      </div>
                    </div>
                    <p className={`mt-1 text-sm ${reminder.completed ? 'text-gray-500' : 'text-gray-700'}`}>
                      {reminder.details}
                    </p>
                    <div className="mt-2 flex items-center space-x-4">
                      <button
                        className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                        onClick={() => handleEditClick(reminder)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                        onClick={() => handleDeleteClick(reminder)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentReminder?.id ? "Edit Reminder" : "Add Reminder"}
        size="lg"
      >
        <ReminderForm
          initialData={currentReminder}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          houseId={currentHouse.id}
        />
      </Modal>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Reminder"
        message={`Are you sure you want to delete "${currentReminder?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDanger
      />
    </div>
  );
} 