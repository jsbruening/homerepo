import { useState } from 'react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHomeServices, createHomeService, updateHomeService, deleteHomeService } from '../lib/api';
import { HomeService } from '../types';
import { useHouse } from '../contexts/HouseContext';
import { HomeModernIcon, PlusIcon } from '@heroicons/react/24/outline';
import HomeServiceForm from '../components/services/HomeServiceForm';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';

export default function HomeServices() {
  const { currentHouse } = useHouse();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<HomeService> | undefined>(undefined);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['homeServices', currentHouse?.id],
    queryFn: async () => {
      if (!currentHouse?.id) return [];
      return getHomeServices(currentHouse.id);
    },
    enabled: !!currentHouse?.id
  });

  const createMutation = useMutation({
    mutationFn: (service: Omit<HomeService, 'id' | 'createdAt' | 'updatedAt'>) =>
      createHomeService(service, currentHouse!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeServices', currentHouse?.id] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<HomeService> }) =>
      updateHomeService(id, { ...updates, houseId: currentHouse!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeServices', currentHouse?.id] });
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHomeService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeServices', currentHouse?.id] });
      setIsDeleteDialogOpen(false);
    }
  });

  if (!currentHouse) {
    return (
      <div className="text-center py-12">
        <HomeModernIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No House Selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please select or create a house to manage home services.
        </p>
      </div>
    );
  }

  const handleAddClick = () => {
    setCurrentService(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (service: HomeService) => {
    setCurrentService(service);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (service: HomeService) => {
    setCurrentService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: Omit<HomeService, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (currentService?.id) {
      updateMutation.mutate({
        id: currentService.id,
        updates: { ...data, houseId: currentHouse.id }
      });
    } else {
      createMutation.mutate({ ...data, houseId: currentHouse.id });
    }
  };

  const handleDelete = () => {
    if (currentService?.id) {
      deleteMutation.mutate(currentService.id);
    }
  };

  const getStatusBadgeClasses = (status: HomeService['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecurrenceBadgeClasses = (recurrence: HomeService['recurrence']) => {
    if (!recurrence) return 'bg-gray-100 text-gray-800';

    switch (recurrence.value) {
      case 'daily':
        return 'bg-green-100 text-green-800';
      case 'weekly':
        return 'bg-indigo-100 text-indigo-800';
      case 'monthly':
        return 'bg-blue-100 text-blue-800';
      case 'quarterly':
        return 'bg-yellow-100 text-yellow-800';
      case 'annual':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Group services by status
  const scheduledServices = services.filter(service => service.status === 'scheduled');
  const completedServices = services.filter(service => service.status === 'completed');

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Home Services</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track all maintenance and service appointments for your home.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
            onClick={handleAddClick}
          >
            Schedule Service
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="mt-8 text-center py-12 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">No service records found. Schedule your first service.</p>
        </div>
      ) : (
        <div className="mt-8">
          {/* Scheduled Services */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Scheduled Services</h2>
            {scheduledServices.length === 0 ? (
              <div className="text-center py-6 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-500">No scheduled services.</p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Service Type
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Provider
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Recurrence
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {scheduledServices.map((service) => (
                      <tr key={service.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {service.serviceType?.name || 'Unknown Service Type'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{service.provider}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {format(new Date(service.date), 'MMM d, yyyy')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRecurrenceBadgeClasses(service.recurrence)}`}>
                            {service.recurrence?.name || 'One-time'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            type="button"
                            className="text-primary-600 hover:text-primary-900 mr-4"
                            onClick={() => handleEditClick(service)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteClick(service)}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Completed Services */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Service History</h2>
            {completedServices.length === 0 ? (
              <div className="text-center py-6 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-500">No service history available.</p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Service Type
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Provider
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Recurrence
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {completedServices.map((service) => (
                      <tr key={service.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {service.serviceType?.name || 'Unknown Service Type'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{service.provider}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {format(new Date(service.date), 'MMM d, yyyy')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRecurrenceBadgeClasses(service.recurrence)}`}>
                            {service.recurrence?.name || 'One-time'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{service.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentService?.id ? "Edit Service" : "Schedule Service"}
        size="lg"
      >
        <HomeServiceForm
          initialData={currentService}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Cancel Service"
        message={`Are you sure you want to cancel the ${currentService?.serviceType?.name || 'unknown'} service with ${currentService?.provider || 'unknown provider'}? This action cannot be undone.`}
        confirmLabel="Delete"
        isDanger
      />
    </div>
  );
} 