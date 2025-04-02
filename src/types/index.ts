export interface Location {
  id: string;
  name: string;
  description: string | null;
  houseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaintManufacturer {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recurrence {
  id: string;
  name: string;
  value: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaintRecord {
  id: string;
  manufacturerId: string;
  manufacturer: PaintManufacturer | null;
  locationId: string;
  location: Location | null;
  color: string;
  paintType: string;
  finishType: string;
  date: string;
  notes: string | null;
  houseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HomeService {
  id: string;
  serviceType: ServiceType | null;
  provider: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  recurrence: Recurrence | null;
  notes: string | null;
  houseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plant {
  id: string;
  name: string;
  locationId: string;
  type: 'indoor' | 'outdoor';
  sunRequirements: 'no sun' | 'partial shade' | 'full sun';
  maxHeight: number;
  maxWidth: number;
  notes?: string | null;
  houseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  details: string;
  dueDate: string;
  recurrence: Recurrence | null;
  completed: boolean;
  houseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface House {
  id: string;
  name: string;
  owners: string[];
  address: string;
  createdAt: string;
  updatedAt: string;
} 