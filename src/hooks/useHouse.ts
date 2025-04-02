import { useState, useEffect } from 'react';
import { House } from '../types';
import { getHouses } from '../lib/api';

export function useHouse() {
  const [houses, setHouses] = useState<House[]>([]);
  const [currentHouse, setCurrentHouse] = useState<House | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHouses() {
      try {
        const data = await getHouses();
        setHouses(data);
        if (data.length > 0 && !currentHouse) {
          setCurrentHouse(data[0]);
        }
      } catch (error) {
        console.error('Error loading houses:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadHouses();
  }, []);

  return {
    houses,
    currentHouse,
    setCurrentHouse,
    isLoading
  };
} 