import { Equipment } from '@/lib/types';
import request from '@/lib/api-client';


export async function getAllEquipment(): Promise<Equipment[]> {
  return request('/equipment');
}

export async function getEquipmentById(id: number): Promise<Equipment> {
  return request(`/equipment/${id}`);
}

export async function createEquipment(equipment: Partial<Omit<Equipment, 'id'>>): Promise<Equipment> {
  return request('/equipment', {
    method: 'POST',
    body: JSON.stringify(equipment),
  });
}

export async function updateEquipment(id: number, equipment: Partial<Omit<Equipment, 'id'>>): Promise<Equipment> {
  return request(`/equipment/${id}`, {
    method: 'PUT', // Assuming PUT for updates
    body: JSON.stringify(equipment),
  });
}

export async function deleteEquipment(id: number): Promise<void> {
    return request(`/equipment/${id}`, {
        method: 'DELETE',
    });
}
