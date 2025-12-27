import request from '@/lib/api-client';
import { User } from '@/lib/types';

export async function login(email: string, password: string): Promise<{ token: string, user: User }> {
    const response = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    // The backend should ideally return the user object along with the token.
    // If not, another request would be needed to fetch user details.
    // For now, we assume a user object is part of the login response.
    return response;
}


export async function signup(fullName: string, email: string, password: string): Promise<{ success: boolean }> {
    return request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password }),
    });
}
