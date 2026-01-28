import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { NoteScreen } from '../screens/NoteScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    Note: { isNew?: boolean; noteId?: string };
    Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            setIsAuthenticated(!!token);
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#ffffff' },
                    animation: 'slide_from_right',
                }}
            >
                {isAuthenticated ? (
                    <>
                        <Stack.Screen name="Home">
                            {(props) => <HomeScreen {...props} />}
                        </Stack.Screen>
                        <Stack.Screen name="Note">
                            {(props) => <NoteScreen {...props} />}
                        </Stack.Screen>
                        <Stack.Screen name="Settings">
                            {(props) => (
                                <SettingsScreen {...props} onLogout={handleLogout} />
                            )}
                        </Stack.Screen>
                    </>
                ) : (
                    <Stack.Screen name="Login">
                        {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
                    </Stack.Screen>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
});
