import { User } from '@/lib/types';
import request from '@/lib/api-client';

export async function getUsers(): Promise<User[]> {
  // Assuming there's a /users endpoint
  return request('/users');
}
