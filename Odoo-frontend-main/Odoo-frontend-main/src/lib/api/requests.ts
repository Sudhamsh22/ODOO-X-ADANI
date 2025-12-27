import { MaintenanceRequest, MaintenanceRequestStatus } from '@/lib/types';
import request from '@/lib/api-client';


export async function getRequests(filters: Record<string, string> = {}): Promise<MaintenanceRequest[]> {
  const query = new URLSearchParams(filters);
  return request(`/requests?${query}`);
}

export async function getRequestById(id: number): Promise<MaintenanceRequest> {
  return request(`/requests/${id}`);
}

export async function createRequest(req: Partial<Omit<MaintenanceRequest, 'id'>>): Promise<MaintenanceRequest> {
  return request('/requests', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function updateRequest(id: number, req: Partial<Omit<MaintenanceRequest, 'id'>>): Promise<MaintenanceRequest> {
  return request(`/requests/${id}`, {
    method: 'PUT', // Assuming PUT for updates
    body: JSON.stringify(req),
  });
}

export async function updateRequestStatus(id: number, status: MaintenanceRequestStatus): Promise<MaintenanceRequest> {
    return request(`/requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
}


export async function deleteRequest(id: number): Promise<void> {
  return request(`/requests/${id}`, {
    method: 'DELETE',
  });
}
