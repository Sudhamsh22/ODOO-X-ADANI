import { EquipmentCategory } from '@/lib/types';
import request from '@/lib/api-client';

export async function getEquipmentCategories(): Promise<EquipmentCategory[]> {
  return request('/categories');
}

export async function createEquipmentCategory(category: { name: string, responsible: string, companyId: number }): Promise<EquipmentCategory> {
    return request('/categories', {
        method: 'POST',
        body: JSON.stringify(category),
    });
}

export async function updateEquipmentCategory(id: number, category: Partial<{ name: string, responsible: string, companyId: number }>): Promise<EquipmentCategory> {
    return request(`/categories/${id}`, {
        method: 'PUT', // Assuming PUT for updates
        body: JSON.stringify(category),
    });
}

export async function deleteEquipmentCategory(id: number): Promise<void> {
    return request(`/categories/${id}`, {
        method: 'DELETE',
    });
}
