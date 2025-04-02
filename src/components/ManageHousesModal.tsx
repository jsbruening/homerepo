import { useState } from 'react';
import Modal from './Modal';
import { House } from '../types/house';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useHouse } from '../contexts/HouseContext';

interface ManageHousesModalProps {
 isOpen: boolean;
 onClose: () => void;
}

export default function ManageHousesModal({ isOpen, onClose }: ManageHousesModalProps) {
 const { houses, addHouse, updateHouse, deleteHouse } = useHouse();
 const [editingHouse, setEditingHouse] = useState<House | null>(null);
 const [newHouse, setNewHouse] = useState({
  name: '',
  owners: [''],
  address: ''
 });

 return (
  <Modal isOpen={isOpen} onClose={onClose} title="Manage Houses" size="lg">
   <div className="space-y-6">
    {/* List existing houses */}
    <div className="space-y-4">
     {houses.map((house) => (
      <div key={house.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
       <div>
        <h4 className="font-medium">{house.name}</h4>
        <p className="text-sm text-gray-500">{house.address}</p>
        <p className="text-sm text-gray-500">{house.owners.join(', ')}</p>
       </div>
       <div className="flex gap-2">
        <button
         onClick={() => setEditingHouse(house)}
         className="p-2 text-gray-400 hover:text-gray-500"
        >
         <PencilIcon className="h-5 w-5" />
        </button>
        <button
         onClick={() => deleteHouse(house.id)}
         className="p-2 text-gray-400 hover:text-red-500"
        >
         <TrashIcon className="h-5 w-5" />
        </button>
       </div>
      </div>
     ))}
    </div>

    {/* Add new house form */}
    <div className="border-t pt-6">
     <h3 className="text-lg font-medium">Add New House</h3>
     <form className="mt-4 space-y-4">
      <div>
       <label className="block text-sm font-medium text-gray-700">
        House Name
       </label>
       <input
        type="text"
        value={newHouse.name}
        onChange={(e) => setNewHouse({ ...newHouse, name: e.target.value })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
       />
      </div>
      <div>
       <label className="block text-sm font-medium text-gray-700">
        Address
       </label>
       <input
        type="text"
        value={newHouse.address}
        onChange={(e) => setNewHouse({ ...newHouse, address: e.target.value })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
       />
      </div>
      <div>
       <label className="block text-sm font-medium text-gray-700">
        Owners
       </label>
       <input
        type="text"
        value={newHouse.owners.join(', ')}
        onChange={(e) => setNewHouse({ ...newHouse, owners: e.target.value.split(',').map(s => s.trim()) })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        placeholder="Enter names separated by commas"
       />
      </div>
      <button
       type="submit"
       className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
       <PlusIcon className="h-5 w-5 mr-2" />
       Add House
      </button>
     </form>
    </div>
   </div>
  </Modal>
 );
} 