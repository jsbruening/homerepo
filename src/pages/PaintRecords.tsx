import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaintRecords, createPaintRecord, updatePaintRecord, deletePaintRecord, getLocations } from '../lib/api';
import { PaintRecord, Location } from '../types';
import { useHouse } from '../contexts/HouseContext';
import { HomeModernIcon } from '@heroicons/react/24/outline';
import PaintRecordForm from '../components/paint/PaintRecordForm';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useLocation } from 'react-router-dom';

export default function PaintRecords() {
 const { currentHouse } = useHouse();
 const queryClient = useQueryClient();
 const location = useLocation();
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
 const [currentRecord, setCurrentRecord] = useState<PaintRecord | undefined>(undefined);

 const { data: locations = [] } = useQuery({
  queryKey: ['locations', currentHouse?.id],
  queryFn: () => currentHouse ? getLocations(currentHouse.id) : Promise.resolve([]),
  enabled: !!currentHouse
 });

 const locationMap = locations.reduce((acc, location) => {
  acc[location.id] = location.name;
  return acc;
 }, {} as Record<string, string>);

 const { data: paintRecords = [], isLoading } = useQuery({
  queryKey: ['paintRecords', currentHouse?.id] as const,
  queryFn: async () => {
   if (!currentHouse?.id) return [] as PaintRecord[];
   return getPaintRecords(currentHouse.id);
  },
  enabled: !!currentHouse?.id,
 });

 const createMutation = useMutation({
  mutationFn: (record: Omit<PaintRecord, 'id' | 'createdAt' | 'updatedAt'>) => createPaintRecord(record),
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['paintRecords', currentHouse?.id] });
   setIsModalOpen(false);
  }
 });

 const updateMutation = useMutation({
  mutationFn: ({ id, updates }: { id: string; updates: Partial<PaintRecord> }) =>
   updatePaintRecord({ ...updates, id } as PaintRecord),
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['paintRecords', currentHouse?.id] });
   setIsModalOpen(false);
  }
 });

 const deleteMutation = useMutation({
  mutationFn: deletePaintRecord,
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['paintRecords', currentHouse?.id] });
   setIsDeleteDialogOpen(false);
  }
 });

 // Handle editId from navigation state
 useEffect(() => {
  const state = location.state as { editId?: string } | null;
  if (state?.editId && paintRecords.length > 0) {
   const record = paintRecords.find(r => r.id === state.editId);
   if (record) {
    setCurrentRecord(record);
    setIsModalOpen(true);
   }
  }
 }, [location.state, paintRecords]);

 if (!currentHouse) {
  return (
   <div className="text-center py-12">
    <HomeModernIcon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-semibold text-gray-900">No House Selected</h3>
    <p className="mt-1 text-sm text-gray-500">
     Please select or create a house to manage paint records.
    </p>
   </div>
  );
 }

 const handleAddClick = () => {
  setCurrentRecord(undefined);
  setIsModalOpen(true);
 };

 const handleEditClick = (record: PaintRecord) => {
  setCurrentRecord(record);
  setIsModalOpen(true);
 };

 const handleDeleteClick = (record: PaintRecord) => {
  setCurrentRecord(record);
  setIsDeleteDialogOpen(true);
 };

 const handleSubmit = async (data: Omit<PaintRecord, 'id' | 'createdAt' | 'updatedAt' | 'manufacturer' | 'location'>) => {
  if (currentRecord?.id) {
   updateMutation.mutate({ id: currentRecord.id, updates: data });
  } else {
   createMutation.mutate({
    ...data,
    manufacturer: null,
    location: null
   });
  }
 };

 const handleDelete = () => {
  if (currentRecord?.id) {
   deleteMutation.mutate(currentRecord.id);
  }
 };

 return (
  <div>
   <div className="sm:flex sm:items-center">
    <div className="sm:flex-auto">
     <h1 className="text-2xl font-semibold text-gray-900">Paint Records</h1>
     <p className="mt-2 text-sm text-gray-700">
      Track your paint colors and finishes for different locations in your home.
     </p>
    </div>
    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
     <button
      type="button"
      className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
      onClick={handleAddClick}
     >
      Add Paint Record
     </button>
    </div>
   </div>

   {isLoading ? (
    <div className="mt-8 flex justify-center items-center py-12">
     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
   ) : paintRecords.length === 0 ? (
    <div className="mt-8 text-center py-12 bg-white rounded-lg shadow">
     <p className="text-sm text-gray-500">No paint records found. Add your first paint record to get started.</p>
    </div>
   ) : (
    <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
     <table className="min-w-full divide-y divide-gray-300">
      <thead className="bg-gray-50">
       <tr>
        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
         Manufacturer
        </th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
         Location
        </th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
         Color
        </th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
         Paint Type
        </th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
         Finish Type
        </th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
         Date
        </th>
        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
         <span className="sr-only">Actions</span>
        </th>
       </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
       {paintRecords.map((record: PaintRecord) => (
        <tr key={record.id}>
         <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
          {record.manufacturer?.name || 'Unknown'}
         </td>
         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {locationMap[record.locationId] || 'Unknown Location'}
         </td>
         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record.color}</td>
         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record.paintType}</td>
         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record.finishType}</td>
         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {new Date(record.date).toLocaleDateString()}
         </td>
         <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
          <button
           type="button"
           className="text-primary-600 hover:text-primary-900 mr-4"
           onClick={() => handleEditClick(record)}
          >
           Edit
          </button>
          <button
           type="button"
           className="text-red-600 hover:text-red-900"
           onClick={() => handleDeleteClick(record)}
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

   <Modal
    isOpen={isModalOpen}
    onClose={() => {
     setIsModalOpen(false);
     setCurrentRecord(undefined);
    }}
    title={currentRecord ? 'Edit Paint Record' : 'Add Paint Record'}
   >
    <PaintRecordForm
     initialData={currentRecord}
     onSubmit={handleSubmit}
     onCancel={() => {
      setIsModalOpen(false);
      setCurrentRecord(undefined);
     }}
     isSubmitting={createMutation.isPending || updateMutation.isPending}
    />
   </Modal>

   <ConfirmationDialog
    isOpen={isDeleteDialogOpen}
    onClose={() => {
     setIsDeleteDialogOpen(false);
     setCurrentRecord(undefined);
    }}
    onConfirm={handleDelete}
    title="Delete Paint Record"
    message="Are you sure you want to delete this paint record? This action cannot be undone."
   />
  </div>
 );
} 