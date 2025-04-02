import { supabase } from './supabase';
import { PaintRecord, HomeService, Plant, Reminder, House, PaintManufacturer, ServiceType, Recurrence, Location } from '../types';
import { Database } from '../types/database.types';

type Tables = Database['public']['Tables'];
type PaintRecordRow = Tables['paint_records']['Row'];
type HomeServiceRow = Tables['home_services']['Row'];
type PlantRow = Tables['plants']['Row'];
type ReminderRow = Tables['reminders']['Row'];
type DbHouse = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

// Paint Records API
export async function getLocations(houseId: string): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('house_id', houseId)
    .order('name');

  if (error) throw error;
  return data.map(location => ({
    id: location.id,
    name: location.name,
    description: location.description,
    houseId: location.house_id,
    createdAt: location.created_at,
    updatedAt: location.updated_at
  }));
}

interface SupabasePaintManufacturer {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface SupabaseServiceType {
  id: string;
  name: string;
  description: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseHouse {
  id: string;
  name: string;
  owners: string[];
  address: string;
  created_at: string;
  updated_at: string;
}

export async function getPaintManufacturers(): Promise<PaintManufacturer[]> {
  const { data, error } = await supabase
    .from('paint_manufacturers')
    .select('id, name, description, created_at, updated_at')
    .order('name');

  if (error) throw error;
  return (data || []).map((manufacturer) => ({
    id: manufacturer.id,
    name: manufacturer.name,
    description: manufacturer.description,
    createdAt: manufacturer.created_at,
    updatedAt: manufacturer.updated_at
  }));
}

export async function getServiceTypes(): Promise<ServiceType[]> {
  const { data, error } = await supabase
    .from('service_types')
    .select('id, name, description, category, created_at, updated_at')
    .order('name');

  if (error) throw error;
  return (data || []).map((type) => ({
    id: type.id,
    name: type.name,
    description: type.description,
    category: type.category,
    createdAt: type.created_at,
    updatedAt: type.updated_at
  }));
}

interface SupabasePaintRecord {
  id: string;
  manufacturer_id: string;
  manufacturer: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  } | null;
  location_id: string;
  location: {
    id: string;
    name: string;
    description: string | null;
    house_id: string;
    created_at: string;
    updated_at: string;
  } | null;
  color_name: string;
  color_code: string;
  paint_type: string;
  finish_type: string;
  painted_at: string;
  notes: string | null;
  house_id: string;
  created_at: string;
  updated_at: string;
}

export async function getPaintRecords(houseId: string): Promise<PaintRecord[]> {
  console.log('Fetching paint records for house:', houseId);
  
  const { data, error } = await supabase
    .from('paint_records')
    .select(`
      id,
      manufacturer_id,
      manufacturer:paint_manufacturers!manufacturer_id (
        id,
        name,
        created_at,
        updated_at
      ),
      location_id,
      location:locations!location_id (
        id,
        name,
        description,
        house_id,
        created_at,
        updated_at
      ),
      color_name,
      color_code,
      paint_type,
      finish_type,
      painted_at,
      notes,
      house_id,
      created_at,
      updated_at
    `)
    .eq('house_id', houseId)
    .order('painted_at', { ascending: false });

  if (error) {
    console.error('Error fetching paint records:', error);
    throw error;
  }

  console.log('Raw paint records data:', JSON.stringify(data, null, 2));

  const mappedRecords = ((data || []) as unknown as SupabasePaintRecord[]).map(record => ({
    id: record.id,
    manufacturerId: record.manufacturer_id,
    manufacturer: record.manufacturer ? {
      id: record.manufacturer.id,
      name: record.manufacturer.name,
      description: null,
      createdAt: record.manufacturer.created_at,
      updatedAt: record.manufacturer.updated_at
    } : null,
    locationId: record.location_id,
    location: record.location ? {
      id: record.location.id,
      name: record.location.name,
      description: record.location.description,
      houseId: record.location.house_id,
      createdAt: record.location.created_at,
      updatedAt: record.location.updated_at
    } : null,
    color: record.color_name || record.color_code,
    paintType: record.paint_type,
    finishType: record.finish_type,
    date: record.painted_at,
    notes: record.notes,
    houseId: record.house_id,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  }));

  console.log('Mapped paint records:', JSON.stringify(mappedRecords, null, 2));
  return mappedRecords;
}

export async function createPaintRecord(record: Omit<PaintRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaintRecord> {
  // Validate location exists
  const { data: location, error: locationError } = await supabase
    .from('locations')
    .select('id, name')
    .eq('id', record.locationId)
    .single();

  if (locationError || !location) {
    throw new Error('Invalid location selected');
  }

  // Create paint record
  const { data, error } = await supabase
    .from('paint_records')
    .insert([{
      manufacturer_id: record.manufacturerId,
      location_id: record.locationId,
      color_name: record.color,
      paint_type: record.paintType,
      finish_type: record.finishType,
      painted_at: record.date,
      notes: record.notes,
      house_id: record.houseId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select(`
      id,
      manufacturer_id,
      manufacturer:manufacturer_id (
        id,
        name,
        description,
        created_at,
        updated_at
      ),
      location_id,
      location:location_id (
        id,
        name,
        description,
        house_id,
        created_at,
        updated_at
      ),
      color_name,
      paint_type,
      finish_type,
      painted_at,
      notes,
      house_id,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    console.error('Error creating paint record:', error);
    throw error;
  }

  return {
    id: data.id,
    manufacturerId: data.manufacturer_id,
    manufacturer: data.manufacturer ? {
      id: data.manufacturer.id,
      name: data.manufacturer.name,
      description: data.manufacturer.description,
      createdAt: data.manufacturer.created_at,
      updatedAt: data.manufacturer.updated_at
    } : null,
    locationId: data.location_id,
    location: data.location ? {
      id: data.location.id,
      name: data.location.name,
      description: data.location.description,
      houseId: data.location.house_id,
      createdAt: data.location.created_at,
      updatedAt: data.location.updated_at
    } : null,
    color: data.color_name,
    paintType: data.paint_type,
    finishType: data.finish_type,
    date: data.painted_at,
    notes: data.notes,
    houseId: data.house_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function updatePaintRecord(record: PaintRecord): Promise<PaintRecord> {
  const { data, error } = await supabase
    .from('paint_records')
    .update({
      manufacturer_id: record.manufacturerId,
      location_id: record.locationId,
      room_id: record.locationId, // Using locationId as room_id since they are the same
      color_name: record.color,
      color_code: record.color, // Using color as color_code for now
      paint_type: record.paintType,
      finish_type: record.finishType,
      painted_at: record.date, // Ensure date is properly set
      notes: record.notes
    })
    .eq('id', record.id)
    .select(`
      id,
      manufacturer_id,
      manufacturer:paint_manufacturers!manufacturer_id (
        id,
        name,
        created_at,
        updated_at
      ),
      location_id,
      location:locations!location_id (
        id,
        name,
        description,
        house_id,
        created_at,
        updated_at
      ),
      color_name,
      color_code,
      paint_type,
      finish_type,
      painted_at,
      notes,
      house_id,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    console.error('Error updating paint record:', error);
    throw error;
  }

  return {
    id: data.id,
    manufacturerId: data.manufacturer_id,
    manufacturer: data.manufacturer ? {
      id: data.manufacturer.id,
      name: data.manufacturer.name,
      description: null,
      createdAt: data.manufacturer.created_at,
      updatedAt: data.manufacturer.updated_at
    } : null,
    locationId: data.location_id,
    location: data.location ? {
      id: data.location.id,
      name: data.location.name,
      description: data.location.description,
      houseId: data.location.house_id,
      createdAt: data.location.created_at,
      updatedAt: data.location.updated_at
    } : null,
    color: data.color_name || data.color_code,
    paintType: data.paint_type,
    finishType: data.finish_type,
    date: data.painted_at,
    notes: data.notes,
    houseId: data.house_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export const deletePaintRecord = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('paint_records')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Home Services API
export async function getRecurrences(): Promise<Recurrence[]> {
  const { data, error } = await supabase
    .from('recurrences')
    .select('*')
    .order('name');

  if (error) throw error;
  return data.map(recurrence => ({
    id: recurrence.id,
    name: recurrence.name,
    value: recurrence.value,
    description: recurrence.description,
    createdAt: recurrence.created_at,
    updatedAt: recurrence.updated_at
  }));
}

export async function getHomeServices(houseId: string): Promise<HomeService[]> {
  const { data, error } = await supabase
    .from('home_services')
    .select(`
      *,
      service_type:service_types!service_type_id(*),
      recurrence:recurrences!recurrence_id(*)
    `)
    .eq('house_id', houseId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data.map(service => ({
    id: service.id,
    serviceType: service.service_type ? {
      id: service.service_type.id,
      name: service.service_type.name,
      description: service.service_type.description,
      category: service.service_type.category,
      createdAt: service.service_type.created_at,
      updatedAt: service.service_type.updated_at
    } : null,
    provider: service.provider,
    date: service.date,
    status: service.status,
    recurrence: service.recurrence ? {
      id: service.recurrence.id,
      name: service.recurrence.name,
      value: service.recurrence.value,
      description: service.recurrence.description,
      createdAt: service.recurrence.created_at,
      updatedAt: service.recurrence.updated_at
    } : null,
    notes: service.notes,
    houseId: service.house_id,
    createdAt: service.created_at,
    updatedAt: service.updated_at
  }));
}

export async function createHomeService(service: Omit<HomeService, 'id' | 'createdAt' | 'updatedAt'>, houseId: string): Promise<HomeService> {
  const { data, error } = await supabase
    .from('home_services')
    .insert({
      service_type_id: service.serviceType?.id,
      provider: service.provider,
      date: service.date,
      status: service.status,
      recurrence_id: service.recurrence?.id,
      notes: service.notes,
      house_id: houseId
    })
    .select(`
      *,
      service_type:service_types(*),
      recurrence:recurrences(*)
    `)
    .single();

  if (error) throw error;
  return {
    id: data.id,
    serviceType: data.service_type ? {
      id: data.service_type.id,
      name: data.service_type.name,
      description: data.service_type.description,
      category: data.service_type.category,
      createdAt: data.service_type.created_at,
      updatedAt: data.service_type.updated_at
    } : null,
    provider: data.provider,
    date: data.date,
    status: data.status,
    recurrence: data.recurrence ? {
      id: data.recurrence.id,
      name: data.recurrence.name,
      value: data.recurrence.value,
      description: data.recurrence.description,
      createdAt: data.recurrence.created_at,
      updatedAt: data.recurrence.updated_at
    } : null,
    notes: data.notes,
    houseId: data.house_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function updateHomeService(id: string, service: Partial<HomeService>): Promise<HomeService> {
  const { data, error } = await supabase
    .from('home_services')
    .update({
      service_type_id: service.serviceType?.id,
      provider: service.provider,
      date: service.date,
      status: service.status,
      recurrence_id: service.recurrence?.id,
      notes: service.notes,
      house_id: service.houseId
    })
    .eq('id', id)
    .select(`
      *,
      service_type:service_types!service_type_id(*),
      recurrence:recurrences!recurrence_id(*)
    `)
    .single();

  if (error) {
    console.error('Error updating home service:', error);
    throw error;
  }

  return {
    id: data.id,
    serviceType: data.service_type ? {
      id: data.service_type.id,
      name: data.service_type.name,
      description: data.service_type.description,
      category: data.service_type.category,
      createdAt: data.service_type.created_at,
      updatedAt: data.service_type.updated_at
    } : null,
    provider: data.provider,
    date: data.date,
    status: data.status,
    recurrence: data.recurrence ? {
      id: data.recurrence.id,
      name: data.recurrence.name,
      value: data.recurrence.value,
      description: data.recurrence.description,
      createdAt: data.recurrence.created_at,
      updatedAt: data.recurrence.updated_at
    } : null,
    notes: data.notes,
    houseId: data.house_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export const deleteHomeService = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('home_services')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Plants API
export async function getPlantTypes(): Promise<{ value: string; label: string }[]> {
  const { data, error } = await supabase
    .from('plants')
    .select('type')
    .not('type', 'is', null)
    .order('type');

  if (error) throw error;
  
  return [...new Set(data.map(item => item.type))].map((type: string) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1)
  }));
}

export async function getSunRequirements(): Promise<{ value: string; label: string }[]> {
  const { data, error } = await supabase
    .from('plants')
    .select('sun_requirements')
    .not('sun_requirements', 'is', null)
    .order('sun_requirements');

  if (error) throw error;
  
  return [...new Set(data.map(item => item.sun_requirements))].map((req: string) => ({
    value: req,
    label: req.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }));
}

export async function getPlants(houseId: string): Promise<Plant[]> {
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('house_id', houseId)
    .order('name');

  if (error) throw error;
  return data.map(plant => ({
    id: plant.id,
    name: plant.name,
    locationId: plant.location,
    type: plant.type,
    sunRequirements: plant.sun_requirements,
    maxHeight: plant.max_height,
    maxWidth: plant.max_width,
    notes: plant.notes,
    houseId: plant.house_id,
    createdAt: plant.created_at,
    updatedAt: plant.updated_at
  }));
}

export async function createPlant(plant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>, houseId: string): Promise<Plant> {
  const { data, error } = await supabase
    .from('plants')
    .insert({
      name: plant.name,
      location: plant.locationId,
      type: plant.type,
      sun_requirements: plant.sunRequirements,
      max_height: plant.maxHeight,
      max_width: plant.maxWidth,
      notes: plant.notes,
      house_id: houseId
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating plant:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    locationId: data.location,
    type: data.type,
    sunRequirements: data.sun_requirements,
    maxHeight: data.max_height,
    maxWidth: data.max_width,
    notes: data.notes,
    houseId: data.house_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function updatePlant(id: string, plant: Partial<Plant>): Promise<Plant> {
  try {
    console.log('Updating plant with values:', {
      id,
      name: plant.name,
      location: plant.locationId,
      type: plant.type,
      sun_requirements: plant.sunRequirements,
      max_height: plant.maxHeight,
      max_width: plant.maxWidth,
      house_id: plant.houseId,
      notes: plant.notes
    });

    const { data, error } = await supabase
      .from('plants')
      .update({
        name: plant.name,
        location: plant.locationId,
        type: plant.type,
        sun_requirements: plant.sunRequirements,
        max_height: plant.maxHeight,
        max_width: plant.maxWidth,
        house_id: plant.houseId,
        notes: plant.notes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating plant:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      locationId: data.location,
      type: data.type,
      sunRequirements: data.sun_requirements,
      maxHeight: data.max_height,
      maxWidth: data.max_width,
      notes: data.notes,
      houseId: data.house_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error updating plant:', error);
    throw error;
  }
}

export const deletePlant = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('plants')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Reminders API
export async function getReminders(houseId: string): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select(`
      *,
      recurrence:recurrences!recurrence_id(*)
    `)
    .eq('house_id', houseId)
    .order('due_date');

  if (error) throw error;
  return data.map(reminder => ({
    id: reminder.id,
    title: reminder.title,
    details: reminder.details,
    dueDate: reminder.due_date,
    recurrence: reminder.recurrence ? {
      id: reminder.recurrence.id,
      name: reminder.recurrence.name,
      value: reminder.recurrence.value,
      description: reminder.recurrence.description,
      createdAt: reminder.recurrence.created_at,
      updatedAt: reminder.recurrence.updated_at
    } : null,
    completed: reminder.completed,
    houseId: reminder.house_id,
    createdAt: reminder.created_at,
    updatedAt: reminder.updated_at
  }));
}

export async function createReminder(reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>, houseId: string): Promise<Reminder> {
  const { data, error } = await supabase
    .from('reminders')
    .insert({
      title: reminder.title,
      details: reminder.details,
      due_date: reminder.dueDate,
      recurrence_id: reminder.recurrence?.id,
      completed: reminder.completed,
      house_id: houseId
    })
    .select(`
      *,
      recurrence:recurrences!recurrence_id(*)
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    title: data.title,
    details: data.details,
    dueDate: data.due_date,
    recurrence: data.recurrence ? {
      id: data.recurrence.id,
      name: data.recurrence.name,
      value: data.recurrence.value,
      description: data.recurrence.description,
      createdAt: data.recurrence.created_at,
      updatedAt: data.recurrence.updated_at
    } : null,
    completed: data.completed,
    houseId: data.house_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function updateReminder(id: string, reminder: Partial<Reminder>): Promise<Reminder> {
  const { data, error } = await supabase
    .from('reminders')
    .update({
      title: reminder.title,
      details: reminder.details,
      due_date: reminder.dueDate,
      recurrence_id: reminder.recurrence?.id,
      completed: reminder.completed,
      house_id: reminder.houseId
    })
    .eq('id', id)
    .select(`
      *,
      recurrence:recurrences!recurrence_id(*)
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    title: data.title,
    details: data.details,
    dueDate: data.due_date,
    recurrence: data.recurrence ? {
      id: data.recurrence.id,
      name: data.recurrence.name,
      value: data.recurrence.value,
      description: data.recurrence.description,
      createdAt: data.recurrence.created_at,
      updatedAt: data.recurrence.updated_at
    } : null,
    completed: data.completed,
    houseId: data.house_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export const completeReminder = async (id: string): Promise<Reminder> => {
  const { data, error } = await supabase
    .from('reminders')
    .update({ completed: true })
    .eq('id', id)
    .select(`
      *,
      recurrence:recurrences!recurrence_id(*)
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    title: data.title,
    details: data.details,
    dueDate: data.due_date,
    recurrence: data.recurrence ? {
      id: data.recurrence.id,
      name: data.recurrence.name,
      value: data.recurrence.value,
      description: data.recurrence.description,
      createdAt: data.recurrence.created_at,
      updatedAt: data.recurrence.updated_at
    } : null,
    completed: data.completed,
    houseId: data.house_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const deleteReminder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Houses API
export async function getHouses(): Promise<House[]> {
  const { data, error } = await supabase
    .from('houses')
    .select('id, name, owners, address, created_at, updated_at');

  if (error) throw error;
  return (data || []).map((house) => ({
    id: house.id,
    name: house.name,
    owners: house.owners,
    address: house.address,
    createdAt: house.created_at,
    updatedAt: house.updated_at
  }));
}

export async function createHouse(house: Omit<House, 'id' | 'createdAt' | 'updatedAt'>): Promise<House> {
  const { data, error } = await supabase
    .from('houses')
    .insert([{
      name: house.name,
      owners: house.owners,
      address: house.address,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating house:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    owners: data.owners,
    address: data.address,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function updateHouse(id: string, house: Partial<House>): Promise<House> {
  const { data, error } = await supabase
    .from('houses')
    .update({
      ...(house.name && { name: house.name }),
      ...(house.owners && { owners: house.owners }),
      ...(house.address && { address: house.address }),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating house:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    owners: data.owners,
    address: data.address,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function deleteHouse(id: string): Promise<void> {
  const { error } = await supabase
    .from('houses')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}