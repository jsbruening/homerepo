import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlants, createPlant, updatePlant, deletePlant, getLocations } from '../lib/api';
import { Plant, Location } from '../types';
import { useHouse } from '../contexts/HouseContext';
import { HomeModernIcon, PlusIcon } from '@heroicons/react/24/outline';
import PlantForm from '../components/plants/PlantForm';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useLocation } from 'react-router-dom';

export default function PlantInventory() {
 const { currentHouse } = useHouse();
 const queryClient = useQueryClient();
 const location = useLocation();
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
 const [currentPlant, setCurrentPlant] = useState<Plant | undefined>(undefined);

 const { data: locations = [] } = useQuery({
  queryKey: ['locations', currentHouse?.id],
  queryFn: () => currentHouse ? getLocations(currentHouse.id) : Promise.resolve([]),
  enabled: !!currentHouse
 });

 const locationMap = locations.reduce((acc, location) => {
  acc[location.id] = location.name;
  return acc;
 }, {} as Record<string, string>);

 const { data: plants = [], isLoading } = useQuery({
  queryKey: ['plants', currentHouse?.id] as const,
  queryFn: async () => {
   if (!currentHouse?.id) return [] as Plant[];
   return getPlants(currentHouse.id);
  },
  enabled: !!currentHouse?.id,
 });

 const createMutation = useMutation({
  mutationFn: (plant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => createPlant(plant, currentHouse!.id),
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['plants', currentHouse?.id] });
   setIsModalOpen(false);
  }
 });

 const updateMutation = useMutation({
  mutationFn: ({ id, updates }: { id: string; updates: Partial<Plant> }) =>
   updatePlant(id, { ...updates, houseId: currentHouse!.id }),
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['plants', currentHouse?.id] });
   setIsModalOpen(false);
  }
 });

 const deleteMutation = useMutation({
  mutationFn: deletePlant,
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['plants', currentHouse?.id] });
   setIsDeleteDialogOpen(false);
  }
 });

 // Handle editId from navigation state
 useEffect(() => {
  const state = location.state as { editId?: string } | null;
  if (state?.editId && plants.length > 0) {
   const plant = plants.find(p => p.id === state.editId);
   if (plant) {
    setCurrentPlant(plant);
    setIsModalOpen(true);
   }
  }
 }, [location.state, plants]);

 if (!currentHouse) {
  return (
   <div className="text-center py-12">
    <HomeModernIcon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-semibold text-gray-900">No House Selected</h3>
    <p className="mt-1 text-sm text-gray-500">
     Please select or create a house to manage plants.
    </p>
   </div>
  );
 }

 const handleAddClick = () => {
  setCurrentPlant(undefined);
  setIsModalOpen(true);
 };

 const handleEditClick = (plant: Plant) => {
  setCurrentPlant(plant);
  setIsModalOpen(true);
 };

 const handleDeleteClick = (plant: Plant) => {
  setCurrentPlant(plant);
  setIsDeleteDialogOpen(true);
 };

 const handleSubmit = async (data: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (currentPlant?.id) {
   updateMutation.mutate({ id: currentPlant.id, updates: data });
  } else {
   createMutation.mutate(data);
  }
 };

 const handleDelete = () => {
  if (currentPlant?.id) {
   deleteMutation.mutate(currentPlant.id);
  }
 };

 // Group plants by location (indoor/outdoor)
 const indoorPlants = plants.filter((plant: Plant) => plant.type === 'indoor');
 const outdoorPlants = plants.filter((plant: Plant) => plant.type === 'outdoor');

 return (
  <div>
   <div className="sm:flex sm:items-center">
    <div className="sm:flex-auto">
     <h1 className="text-2xl font-semibold text-gray-900">Plants</h1>
     <p className="mt-2 text-sm text-gray-700">
      Track your plant collection and their care requirements.
     </p>
    </div>
    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
     <button
      type="button"
      className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
      onClick={handleAddClick}
     >
      Add Plant
     </button>
    </div>
   </div>

   {isLoading ? (
    <div className="mt-8 flex justify-center items-center py-12">
     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
   ) : plants.length === 0 ? (
    <div className="mt-8 text-center py-12 bg-white rounded-lg shadow">
     <p className="text-sm text-gray-500">No plants found. Add your first plant to get started.</p>
    </div>
   ) : (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
     {/* Indoor Plants */}
     <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Indoor Plants</h2>
      {indoorPlants.length === 0 ? (
       <div className="text-center py-6 bg-white rounded-lg shadow">
        <p className="text-sm text-gray-500">No indoor plants in your collection yet.</p>
       </div>
      ) : (
       <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
         <thead className="bg-gray-50">
          <tr>
           <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
            Name
           </th>
           <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
            Location
           </th>
           <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
            Sun Needs
           </th>
           <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
            <span className="sr-only">Actions</span>
           </th>
          </tr>
         </thead>
         <tbody className="divide-y divide-gray-200 bg-white">
          {indoorPlants.map((plant: Plant) => (
           <tr key={plant.id}>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
             {plant.name}
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
             {locationMap[plant.locationId] || 'Unknown Location'}
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{plant.sunRequirements}</td>
            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
             <button
              type="button"
              className="text-primary-600 hover:text-primary-900 mr-4"
              onClick={() => handleEditClick(plant)}
             >
              Edit
             </button>
             <button
              type="button"
              className="text-red-600 hover:text-red-900"
              onClick={() => handleDeleteClick(plant)}
             >
              Delete
             </button>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      )}
     </div>

     {/* Outdoor Plants */}
     <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Outdoor Plants</h2>
      {outdoorPlants.length === 0 ? (
       <div className="text-center py-6 bg-white rounded-lg shadow">
        <p className="text-sm text-gray-500">No outdoor plants in your collection yet.</p>
       </div>
      ) : (
       <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
         <thead className="bg-gray-50">
          <tr>
           <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
            Name
           </th>
           <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
            Location
           </th>
           <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
            Sun Needs
           </th>
           <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
            <span className="sr-only">Actions</span>
           </th>
          </tr>
         </thead>
         <tbody className="divide-y divide-gray-200 bg-white">
          {outdoorPlants.map((plant: Plant) => (
           <tr key={plant.id}>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
             {plant.name}
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
             {plant.type === 'outdoor' ? 'Outdoor' : locationMap[plant.locationId] || 'Unknown Location'}
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{plant.sunRequirements}</td>
            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
             <button
              type="button"
              className="text-primary-600 hover:text-primary-900 mr-4"
              onClick={() => handleEditClick(plant)}
             >
              Edit
             </button>
             <button
              type="button"
              className="text-red-600 hover:text-red-900"
              onClick={() => handleDeleteClick(plant)}
             >
              Delete
             </button>
            </td>
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
    title={currentPlant?.id ? "Edit Plant" : "Add Plant"}
    size="lg"
   >
    <PlantForm
     initialData={currentPlant}
     onSubmit={handleSubmit}
     onCancel={() => setIsModalOpen(false)}
     isSubmitting={createMutation.isPending || updateMutation.isPending}
    />
   </Modal>

   <ConfirmationDialog
    isOpen={isDeleteDialogOpen}
    onClose={() => setIsDeleteDialogOpen(false)}
    onConfirm={handleDelete}
    title="Delete Plant"
    message={`Are you sure you want to delete ${currentPlant?.name}? This action cannot be undone.`}
    confirmLabel="Delete"
    isDanger
   />
  </div>
 );
} 