import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaintRecords, createPaintRecord, updatePaintRecord, deletePaintRecord } from '../lib/api';
import { PaintRecord } from '../types';
import PaintRecordForm from '../components/paint/PaintRecordForm';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useHouse } from '../contexts/HouseContext';

export default function PaintRecords() {
 const { currentHouse } = useHouse();
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
 const [currentRecord, setCurrentRecord] = useState<Partial<PaintRecord> | undefined>(undefined);

 const queryClient = useQueryClient();

 const { data: paintRecords = [], isLoading } = useQuery({
  queryKey: ['paintRecords', currentHouse?.id],
  queryFn: () => {
   if (!currentHouse?.id) return Promise.resolve([]);
   return getPaintRecords(currentHouse.id);
  },
  enabled: !!currentHouse?.id
 });

 const createMutation = useMutation({
  mutationFn: (data: Omit<PaintRecord, 'id' | 'createdAt' | 'updatedAt'>) =>
   createPaintRecord(data, currentHouse?.id || ''),
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['paintRecords', currentHouse?.id] });
   setIsModalOpen(false);
  }
 });

 const updateMutation = useMutation({
  mutationFn: (data: { id: string; updates: Partial<PaintRecord> }) =>
   updatePaintRecord(data.id, data.updates),
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['paintRecords', currentHouse?.id] });
   setIsModalOpen(false);
  }
 });

 const deleteMutation = useMutation({
  mutationFn: (id: string) => deletePaintRecord(id),
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['paintRecords', currentHouse?.id] });
   setIsDeleteDialogOpen(false);
  }
 });

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

 const handleSubmit = async (data: Omit<PaintRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (currentRecord?.id) {
   updateMutation.mutate({
    id: currentRecord.id,
    updates: {
     manufacturer: data.manufacturer,
     room: data.room,
     color: data.color,
     finish: data.finish,
     date: data.date,
     notes: data.notes,
     houseId: currentHouse?.id || ''
    }
   });
  } else {
   createMutation.mutate({
    ...data,
    houseId: currentHouse?.id || ''
   });
  }
 };

 const handleDelete = () => {
  if (currentRecord?.id) {
   deleteMutation.mutate(currentRecord.id);
  }
 };

 if (!currentHouse) {
  return (
   <div className="text-center py-12">
    <p className="text-gray-500">Please select a house first</p>
   </div>
  );
 }

 return (
  <div>
   <div className="sm:flex sm:items-center">
    <div className="sm:flex-auto">
     <h1 className="text-2xl font-semibold text-gray-900">Paint</h1>
     <p className="mt-2 text-sm text-gray-700">
      Track paint colors used in different rooms of your home.
     </p>
    </div>
    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
     <button
      type="button"
      className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
      onClick={handleAddClick}
     >
      Add Paint
     </button>
    </div>
   </div>

   {isLoading ? (
    <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
     <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
     </div>
    </div>
   ) : paintRecords.length === 0 ? (
    <div className="mt-8 text-center py-12 bg-white rounded-lg shadow">
     <p className="text-sm text-gray-500">No paint found. Add one to get started.</p>
    </div>
   ) : (
    <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
     <table className="min-w-full divide-y divide-gray-300">
      <thead className="bg-gray-50">
       <tr>
        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
         Room
        </th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
         Color
        </th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
         Manufacturer
        </th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
         Finish
        </th>
        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
         <span className="sr-only">Actions</span>
        </th>
       </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
       {paintRecords.map((record) => (
        <tr key={record.id}>
         <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
          {record.room?.name || 'Unknown Room'}
         </td>
         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record.color}</td>
         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record.manufacturer?.name || 'Unknown Manufacturer'}</td>
         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record.finish}</td>
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
    onClose={() => setIsModalOpen(false)}
    title={currentRecord?.id ? "Edit Paint" : "Add Paint"}
    size="lg"
   >
    <PaintRecordForm
     initialData={currentRecord}
     onSubmit={handleSubmit}
     onCancel={() => setIsModalOpen(false)}
     isSubmitting={createMutation.isPending || updateMutation.isPending}
    />
   </Modal>

   <ConfirmationDialog
    isOpen={isDeleteDialogOpen}
    onClose={() => setIsDeleteDialogOpen(false)}
    onConfirm={handleDelete}
    title="Delete Paint"
    message={`Are you sure you want to delete ${currentRecord?.color} (${currentRecord?.finish}) for ${currentRecord?.room?.name || 'Unknown Room'}? This action cannot be undone.`}
    confirmLabel="Delete"
    isDanger
   />
  </div>
 );
} 