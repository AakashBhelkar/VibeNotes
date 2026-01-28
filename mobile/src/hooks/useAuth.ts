import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: {
        email: string;
        displayName: string;
    } | null;
    error: string | null;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        error: null,
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            const userData = await AsyncStorage.getItem('user');

            if (token && userData) {
                setState({
                    isAuthenticated: true,
                    isLoading: false,
                    user: JSON.parse(userData),
                    error: null,
                });
            } else {
                setState({
                    isAuthenticated: false,
                    isLoading: false,
                    user: null,
                    error: null,
                });
            }
        } catch (error) {
            setState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: 'Failed to check auth status',
            });
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            const result = await api.login(email, password);
            setState({
                isAuthenticated: true,
                isLoading: false,
                user: result.user,
                error: null,
            });
            return { success: true };
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed';
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: message,
            }));
            return { success: false, error: message };
        }
    }, []);

    const signup = useCallback(async (
        email: string,
        password: string,
        displayName: string
    ) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            await api.signup(email, password, displayName);
            // Auto-login after signup
            return login(email, password);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Signup failed';
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: message,
            }));
            return { success: false, error: message };
        }
    }, [login]);

    const logout = useCallback(async () => {
        setState((prev) => ({ ...prev, isLoading: true }));

        try {
            await api.logout();
            setState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: null,
            });
        } catch (error) {
            // Even if API call fails, clear local auth state
            setState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: null,
            });
        }
    }, []);

    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    return {
        ...state,
        login,
        signup,
        logout,
        checkAuth,
        clearError,
    };
}
