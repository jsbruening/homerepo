export interface House {
  id: string;
  name: string;
  owners: string[];
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HouseContextType {
  currentHouse: House | null;
  setCurrentHouse: (house: House | null) => void;
  houses: House[];
  isLoading: boolean;
} 