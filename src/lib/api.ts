import { supabase } from './supabase';
import { PaintRecord, HomeService, Plant, Reminder, Room, House, PaintManufacturer, ServiceType, Recurrence } from '../types';

// Paint Records API
export async function getRooms(houseId: string): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('house_id', houseId)
    .order('name');

  if (error) throw error;
  return data.map(room => ({
    id: room.id,
    name: room.name,
    description: room.description,
    houseId: room.house_id,
    createdAt: room.created_at,
    updatedAt: room.updated_at
  }));
}

export async function getPaintManufacturers(): Promise<PaintManufacturer[]> {
  const { data, error } = await supabase
    .from('paint_manufacturers')
    .select('*')
    .order('name');

  if (error) throw error;
  return data.map(manufacturer => ({
    id: manufacturer.id,
    name: manufacturer.name,
    description: manufacturer.description,
    createdAt: manufacturer.created_at,
    updatedAt: manufacturer.updated_at
  }));
}

export const getServiceTypes = async (): Promise<ServiceType[]> => {
  const { data, error } = await supabase
    .from('service_types')
    .select('*')
    .order('name');

  if (error) throw new Error(error.message);
  return (data || []).map(type => ({
    id: type.id,
    name: type.name,
    description: type.description,
    category: type.category,
    createdAt: type.created_at,
    updatedAt: type.updated_at
  }));
};

export async function getPaintRecords(houseId: string): Promise<PaintRecord[]> {
  const { data, error } = await supabase
    .from('paint_records')
    .select(`
      *,
      manufacturer:paint_manufacturers!manufacturer_id(*)
    `)
    .eq('house_id', houseId)
    .order('painted_at', { ascending: false });

  if (error) throw error;
  return data.map(record => ({
    id: record.id,
    manufacturer: {
      id: record.manufacturer.id,
      name: record.manufacturer.name,
      description: record.manufacturer.description,
      createdAt: record.manufacturer.created_at,
      updatedAt: record.manufacturer.updated_at
    },
    room: record.paint_type === 'exterior' ? {
      id: '',
      name: record.location || '',
      description: '',
      houseId: record.house_id,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    } : {
      id: record.room_id,
      name: record.room?.name || '',
      description: record.room?.description || '',
      houseId: record.room?.house_id || '',
      createdAt: record.room?.created_at || record.created_at,
      updatedAt: record.room?.updated_at || record.updated_at
    },
    color: record.color_name,
    finish: record.color_code,
    paint_type: record.paint_type,
    finish_type: record.finish_type,
    date: record.painted_at,
    notes: record.notes,
    houseId: record.house_id,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  }));
}

export async function createPaintRecord(record: Omit<PaintRecord, 'id' | 'createdAt' | 'updatedAt'>, houseId: string): Promise<PaintRecord> {
  const { data, error } = await supabase
    .from('paint_records')
    .insert({
      manufacturer_id: record.manufacturer.id,
      room_id: record.paint_type === 'exterior' ? null : record.room.id,
      location: record.paint_type === 'exterior' ? record.room.name : null,
      color_name: record.color,
      color_code: record.finish,
      paint_type: record.paint_type,
      finish_type: record.finish_type,
      painted_at: record.date,
      notes: record.notes,
      house_id: houseId
    })
    .select(`
      *,
      manufacturer:paint_manufacturers(*),
      room:rooms(*)
    `)
    .single();

  if (error) {
    console.error('Error creating paint record:', error);
    throw error;
  }

  return {
    id: data.id,
    manufacturer: {
      id: data.manufacturer.id,
      name: data.manufacturer.name,
      description: data.manufacturer.description,
      createdAt: data.manufacturer.created_at,
      updatedAt: data.manufacturer.updated_at
    },
    room: data.room ? {
      id: data.room.id,
      name: data.room.name,
      description: data.room.description,
      houseId: data.room.house_id,
      createdAt: data.room.created_at,
      updatedAt: data.room.updated_at
    } : {
      id: '',
      name: data.location || '',
      description: '',
      houseId: '',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    },
    color: data.color_name,
    finish: data.color_code,
    paint_type: data.paint_type,
    finish_type: data.finish_type,
    date: data.painted_at,
    notes: data.notes,
    houseId: data.house_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function updatePaintRecord(id: string, record: Partial<PaintRecord>): Promise<PaintRecord> {
  const updateData: any = {
    manufacturer_id: record.manufacturer?.id,
    color_name: record.color,
    color_code: record.finish,
    paint_type: record.paint_type,
    finish_type: record.finish_type,
    painted_at: record.date,
    notes: record.notes,
    house_id: record.houseId
  };

  // Handle room data based on paint type
  if (record.paint_type === 'exterior') {
    updateData.room_id = null;
    updateData.location = record.room?.name;
  } else if (record.room?.id) {
    updateData.room_id = record.room.id;
    updateData.location = null;
  }

  const { data, error } = await supabase
    .from('paint_records')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      manufacturer:paint_manufacturers!manufacturer_id(*)
    `)
    .single();

  if (error) {
    console.error('Error updating paint record:', error);
    throw error;
  }

  return {
    id: data.id,
    manufacturer: {
      id: data.manufacturer.id,
      name: data.manufacturer.name,
      description: data.manufacturer.description,
      createdAt: data.manufacturer.created_at,
      updatedAt: data.manufacturer.updated_at
    },
    room: data.paint_type === 'exterior' ? {
      id: '',
      name: data.location || '',
      description: '',
      houseId: data.house_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } : {
      id: data.room_id,
      name: data.room?.name || '',
      description: data.room?.description || '',
      houseId: data.room?.house_id || '',
      createdAt: data.room?.created_at || data.created_at,
      updatedAt: data.room?.updated_at || data.updated_at
    },
    color: data.color_name,
    finish: data.color_code,
    paint_type: data.paint_type,
    finish_type: data.finish_type,
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
    roomId: plant.location,
    type: plant.type,
    sunRequirements: plant.sun_requirements,
    maxHeight: plant.max_height,
    maxWidth: plant.max_width,
    lastWatered: plant.last_watered,
    nextWatering: plant.next_watering,
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
      location: plant.roomId,
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
    roomId: data.location,
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
      location: plant.roomId,
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
        location: plant.roomId,
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
      roomId: data.location,
      type: data.type,
      sunRequirements: data.sun_requirements,
      maxHeight: data.max_height,
      maxWidth: data.max_width,
      houseId: data.house_id,
      notes: data.notes,
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
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function createHouse(house: Omit<House, 'id' | 'createdAt' | 'updatedAt'>): Promise<House> {
  const { data, error } = await supabase
    .from('houses')
    .insert([{
      name: house.name,
      address: house.address,
      owners: house.owners
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateHouse(id: string, house: Partial<House>): Promise<House> {
  const { data, error } = await supabase
    .from('houses')
    .update({
      name: house.name,
      address: house.address,
      owners: house.owners
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
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