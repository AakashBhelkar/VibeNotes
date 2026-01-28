import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your computer's IP address for mobile device access
// Find your IP: Windows: ipconfig | Linux/Mac: ifconfig
const API_URL = process.env.API_URL || 'http://192.168.1.2:3000';

class ApiService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            async (config) => {
                const token = await AsyncStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    await AsyncStorage.removeItem('auth_token');
                    // Navigate to login screen
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth
    async login(email: string, password: string) {
        const response = await this.client.post('/auth/login', { email, password });
        const { token, user } = response.data;
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        return response.data;
    }

    async signup(email: string, password: string, displayName?: string) {
        const response = await this.client.post('/auth/signup', {
            email,
            password,
            displayName,
        });
        return response.data;
    }

    async logout() {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user');
    }

    // Notes
    async getNotes() {
        const response = await this.client.get('/notes');
        return response.data.notes;
    }

    async getNote(id: string) {
        const response = await this.client.get(`/notes/${id}`);
        return response.data.note;
    }

    async createNote(title: string, content: string, tags?: string[]) {
        const response = await this.client.post('/notes', { title, content, tags });
        return response.data.note;
    }

    async updateNote(id: string, updates: {
        title?: string;
        content?: string;
        tags?: string[];
        isPinned?: boolean;
        isArchived?: boolean;
    }) {
        const response = await this.client.put(`/notes/${id}`, updates);
        return response.data.note;
    }

    async deleteNote(id: string) {
        await this.client.delete(`/notes/${id}`);
    }

    // Sync
    async syncNotes(localNotes: Note[], lastSyncTime: string) {
        const response = await this.client.post('/notes/sync', {
            notes: localNotes,
            lastSync: lastSyncTime,
        });
        return response.data;
    }
}

export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
    isArchived: boolean;
    version: number;
    createdAt: string;
    updatedAt: string;
}

export const api = new ApiService();
