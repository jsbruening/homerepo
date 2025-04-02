export interface House {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface HouseContextType {
  currentHouse: House | null;
  setCurrentHouse: (house: House | null) => void;
  houses: House[];
  isLoading: boolean;
} 