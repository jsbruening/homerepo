import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import Modal from '../Modal';
import { House } from '../../types';
import { useHouse } from '../../contexts/HouseContext';
import ConfirmationDialog from '../ConfirmationDialog';
import { Dialog } from '@headlessui/react';
import { HomeModernIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { FormInput } from '../FormInput';
import FormLayout from '../FormLayout';
import { createHouse, updateHouse, deleteHouse } from '../../lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface ManageHousesModalProps {
 isOpen: boolean;
 onClose: () => void;
}

export default function ManageHousesModal({ isOpen, onClose }: ManageHousesModalProps) {
 const queryClient = useQueryClient();
 const { houses } = useHouse();
 const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
 const [houseToDelete, setHouseToDelete] = useState<House | null>(null);
 const [editingHouse, setEditingHouse] = useState<House | null>(null);
 const { register, handleSubmit, reset, formState: { errors } } = useForm({
  defaultValues: {
   name: '',
   address: '',
   owners: ''
  }
 });

 const handleFormSubmit = async (data: any) => {
  try {
   const owners = data.owners.split(',').map((owner: string) => owner.trim()).filter(Boolean);
   if (editingHouse) {
    await updateHouse(editingHouse.id, { ...data, owners });
   } else {
    await createHouse({ ...data, owners });
   }
   queryClient.invalidateQueries({ queryKey: ['houses'] });
   reset();
   setEditingHouse(null);
  } catch (error) {
   console.error('Error saving house:', error);
  }
 };

 const handleEdit = (house: House) => {
  setEditingHouse(house);
  reset({
   name: house.name,
   address: house.address || '',
   owners: house.owners.join(', ')
  });
 };

 const handleDelete = (house: House) => {
  setHouseToDelete(house);
  setIsDeleteDialogOpen(true);
 };

 const handleDeleteConfirm = async () => {
  if (houseToDelete) {
   try {
    await deleteHouse(houseToDelete.id);
    queryClient.invalidateQueries({ queryKey: ['houses'] });
    setIsDeleteDialogOpen(false);
    setHouseToDelete(null);
   } catch (error) {
    console.error('Error deleting house:', error);
   }
  }
 };

 return (
  <>
   <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Manage Houses"
   >
    <div className="mt-4">
     <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-4">
       <FormInput
        id="house-name"
        label="House Name"
        {...register('name', { required: 'House name is required' })}
        error={errors.name?.message}
       />
       <FormInput
        id="house-address"
        label="Address"
        {...register('address')}
        error={errors.address?.message}
       />
       <FormInput
        id="house-owners"
        label="Owners"
        placeholder="Enter owners separated by commas"
        {...register('owners')}
        error={errors.owners?.message}
       />
      </div>

      {/* Form Buttons */}
      <div className="mt-6 flex justify-end gap-x-4">
       <button
        type="button"
        onClick={onClose}
        className="rounded-md px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
       >
        Cancel
       </button>
       <button
        type="submit"
        className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
       >
        {editingHouse ? 'Update' : 'Create'}
       </button>
      </div>
     </form>

     {/* Houses List */}
     <div className="mt-8 border-t border-gray-200">
      <div className="mt-6">
       <h3 className="text-base font-semibold leading-6 text-gray-900">Your Houses</h3>
       <ul className="mt-4 divide-y divide-gray-100">
        {houses.map((house) => (
         <li key={house.id} className="flex items-center justify-between py-4">
          <div className="flex min-w-0 gap-x-4">
           <HomeModernIcon className="h-5 w-5 flex-none text-gray-400" />
           <div className="min-w-0 flex-auto">
            <p className="text-sm font-semibold leading-6 text-gray-900">{house.name}</p>
            {house.address && (
             <p className="mt-1 truncate text-sm leading-5 text-gray-500">{house.address}</p>
            )}
           </div>
          </div>
          <div className="flex shrink-0 gap-x-2">
           <button
            type="button"
            onClick={() => handleEdit(house)}
            className="rounded-md p-2 hover:bg-gray-50"
           >
            <PencilSquareIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
           </button>
           <button
            type="button"
            onClick={() => handleDelete(house)}
            className="rounded-md p-2 hover:bg-gray-50"
           >
            <TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
           </button>
          </div>
         </li>
        ))}
       </ul>
      </div>
     </div>
    </div>
   </Modal>

   <ConfirmationDialog
    isOpen={isDeleteDialogOpen}
    onClose={() => setIsDeleteDialogOpen(false)}
    onConfirm={handleDeleteConfirm}
    title="Delete House"
    message={`Are you sure you want to delete ${houseToDelete?.name}? This will also delete all associated records.`}
    confirmLabel="Delete"
    isDanger
   />
  </>
 );
} 