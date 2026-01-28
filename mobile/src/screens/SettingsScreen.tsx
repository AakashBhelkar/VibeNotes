import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Switch,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface SettingsScreenProps {
    navigation: any;
    onLogout: () => void;
}

interface UserData {
    email: string;
    displayName: string;
}

export function SettingsScreen({ navigation, onLogout }: SettingsScreenProps) {
    const [user, setUser] = useState<UserData | null>(null);
    const [autoSync, setAutoSync] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);

    useEffect(() => {
        loadUserData();
        loadSettings();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    };

    const loadSettings = async () => {
        try {
            const settings = await AsyncStorage.getItem('settings');
            if (settings) {
                const parsed = JSON.parse(settings);
                setAutoSync(parsed.autoSync ?? true);
                setNotifications(parsed.notifications ?? true);
                setDarkMode(parsed.darkMode ?? false);
                setBiometricEnabled(parsed.biometricEnabled ?? false);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const saveSettings = async (key: string, value: boolean) => {
        try {
            const settings = await AsyncStorage.getItem('settings');
            const parsed = settings ? JSON.parse(settings) : {};
            parsed[key] = value;
            await AsyncStorage.setItem('settings', JSON.stringify(parsed));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    const handleToggleAutoSync = (value: boolean) => {
        setAutoSync(value);
        saveSettings('autoSync', value);
    };

    const handleToggleNotifications = (value: boolean) => {
        setNotifications(value);
        saveSettings('notifications', value);
    };

    const handleToggleDarkMode = (value: boolean) => {
        setDarkMode(value);
        saveSettings('darkMode', value);
    };

    const handleToggleBiometric = (value: boolean) => {
        setBiometricEnabled(value);
        saveSettings('biometricEnabled', value);
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await api.logout();
                        onLogout();
                    },
                },
            ]
        );
    };

    const handleClearCache = () => {
        Alert.alert(
            'Clear Cache',
            'This will clear local cache but keep your notes. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('cache');
                            Alert.alert('Success', 'Cache cleared successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear cache');
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollView}>
                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.card}>
                        <View style={styles.profileRow}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                </Text>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.displayName}>
                                    {user?.displayName || 'User'}
                                </Text>
                                <Text style={styles.email}>{user?.email || ''}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Sync Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sync</Text>
                    <View style={styles.card}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Auto Sync</Text>
                                <Text style={styles.settingDescription}>
                                    Automatically sync notes when online
                                </Text>
                            </View>
                            <Switch
                                value={autoSync}
                                onValueChange={handleToggleAutoSync}
                                trackColor={{ false: '#e5e5e5', true: '#a5b4fc' }}
                                thumbColor={autoSync ? '#6366f1' : '#f4f3f4'}
                            />
                        </View>
                    </View>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.card}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Notifications</Text>
                                <Text style={styles.settingDescription}>
                                    Receive push notifications
                                </Text>
                            </View>
                            <Switch
                                value={notifications}
                                onValueChange={handleToggleNotifications}
                                trackColor={{ false: '#e5e5e5', true: '#a5b4fc' }}
                                thumbColor={notifications ? '#6366f1' : '#f4f3f4'}
                            />
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Dark Mode</Text>
                                <Text style={styles.settingDescription}>
                                    Use dark theme
                                </Text>
                            </View>
                            <Switch
                                value={darkMode}
                                onValueChange={handleToggleDarkMode}
                                trackColor={{ false: '#e5e5e5', true: '#a5b4fc' }}
                                thumbColor={darkMode ? '#6366f1' : '#f4f3f4'}
                            />
                        </View>
                    </View>
                </View>

                {/* Security Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Security</Text>
                    <View style={styles.card}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Biometric Login</Text>
                                <Text style={styles.settingDescription}>
                                    Use fingerprint or Face ID
                                </Text>
                            </View>
                            <Switch
                                value={biometricEnabled}
                                onValueChange={handleToggleBiometric}
                                trackColor={{ false: '#e5e5e5', true: '#a5b4fc' }}
                                thumbColor={biometricEnabled ? '#6366f1' : '#f4f3f4'}
                            />
                        </View>
                    </View>
                </View>

                {/* Data Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data</Text>
                    <View style={styles.card}>
                        <TouchableOpacity
                            style={styles.actionRow}
                            onPress={handleClearCache}
                        >
                            <Text style={styles.actionLabel}>Clear Cache</Text>
                            <Text style={styles.actionChevron}>›</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* App Version */}
                <Text style={styles.version}>VibeNotes v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        fontSize: 24,
        color: '#6366f1',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    profileInfo: {
        flex: 1,
    },
    displayName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    email: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
    },
    settingDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e5e5',
        marginHorizontal: 16,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    actionLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
    },
    actionChevron: {
        fontSize: 20,
        color: '#9ca3af',
    },
    logoutButton: {
        marginHorizontal: 16,
        marginTop: 32,
        backgroundColor: '#fee2e2',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#dc2626',
    },
    version: {
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 14,
        marginTop: 24,
        marginBottom: 32,
    },
});
