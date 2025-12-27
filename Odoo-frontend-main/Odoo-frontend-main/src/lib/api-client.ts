const API_BASE_URL = 'http://localhost:5050/api'

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const headers = new Headers(options.headers || {})
    headers.set('Content-Type', 'application/json')

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    const config: RequestInit = {
        ...options,
        headers
    }

    try {
        const response = await fetch(url, config)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
            return await response.json()
        }

        return {}
    } catch (error) {
        console.error('API Request Error:', error)
        throw error
    }
}

export default request