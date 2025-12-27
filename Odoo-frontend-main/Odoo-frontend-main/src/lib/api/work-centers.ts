import { WorkCenter } from '@/lib/types';
import request from '@/lib/api-client';

export async function getWorkCenters(): Promise<WorkCenter[]> {
  return request('/workcenters');
}

export async function createWorkCenter(workCenter: Omit<WorkCenter, 'id'>): Promise<WorkCenter> {
    return request('/workcenters', {
        method: 'POST',
        body: JSON.stringify(workCenter),
    });
}

export async function updateWorkCenter(id: number, workCenter: Partial<Omit<WorkCenter, 'id'>>): Promise<WorkCenter> {
    return request(`/workcenters/${id}`, {
        method: 'PUT', // Assuming PUT for updates
        body: JSON.stringify(workCenter),
    });
}

export async function deleteWorkCenter(id: number): Promise<void> {
    return request(`/workcenters/${id}`, {
        method: 'DELETE',
    });
}
