import apiClient from '@/lib/apiClient';

export interface SignupData {
    email: string;
    password: string;
    displayName?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        displayName: string | null;
    };
    token: string;
}

export const authService = {
    async signup(data: SignupData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/signup', data);
        return response.data;
    },

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    logout() {
        localStorage.removeItem('vibenote-token');
        localStorage.removeItem('vibenote-user');
    },

    saveAuth(data: AuthResponse) {
        localStorage.setItem('vibenote-token', data.token);
        localStorage.setItem('vibenote-user', JSON.stringify(data.user));
    },

    getUser() {
        const userStr = localStorage.getItem('vibenote-user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            // Clear corrupted data
            localStorage.removeItem('vibenote-user');
            localStorage.removeItem('vibenote-token');
            return null;
        }
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('vibenote-token');
    },
};
