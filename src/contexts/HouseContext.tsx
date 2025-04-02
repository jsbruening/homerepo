import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { House } from '../types';
import { getHouses, createHouse, updateHouse, deleteHouse } from '../lib/api';

interface HouseContextType {
 currentHouse: House | null;
 setCurrentHouse: (house: House | null) => void;
 houses: House[];
 isLoading: boolean;
 createHouse: (house: Omit<House, 'id' | 'createdAt' | 'updatedAt'>) => void;
 updateHouse: (id: string, updates: Partial<House>) => void;
 deleteHouse: (id: string) => void;
}

const HouseContext = createContext<HouseContextType | null>(null);

export function HouseProvider({ children }: { children: ReactNode }) {
 const [currentHouse, setCurrentHouse] = useState<House | null>(null);
 const queryClient = useQueryClient();

 const { data: houses = [], isLoading } = useQuery({
  queryKey: ['houses'],
  queryFn: getHouses
 });

 const createMutation = useMutation({
  mutationFn: createHouse,
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['houses'] });
  }
 });

 const updateMutation = useMutation({
  mutationFn: ({ id, updates }: { id: string; updates: Partial<House> }) =>
   updateHouse(id, updates),
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['houses'] });
  }
 });

 const deleteMutation = useMutation({
  mutationFn: deleteHouse,
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['houses'] });
  }
 });

 // Set first house as current if none selected
 useEffect(() => {
  if (!currentHouse && houses.length > 0) {
   setCurrentHouse(houses[0]);
  }
 }, [currentHouse, houses]);

 const value = {
  currentHouse,
  setCurrentHouse,
  houses,
  isLoading,
  createHouse: (house: Omit<House, 'id' | 'createdAt' | 'updatedAt'>) => {
   createMutation.mutate(house);
  },
  updateHouse: (id: string, updates: Partial<House>) => {
   updateMutation.mutate({ id, updates });
  },
  deleteHouse: (id: string) => {
   deleteMutation.mutate(id);
  }
 };

 return (
  <HouseContext.Provider value={value}>
   {children}
  </HouseContext.Provider>
 );
}

export function useHouse() {
 const context = useContext(HouseContext);
 if (!context) {
  throw new Error('useHouse must be used within a HouseProvider');
 }
 return context;
} 