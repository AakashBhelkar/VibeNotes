import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { api } from '../services/api';

interface LoginScreenProps {
    navigation: any;
    onLogin: () => void;
}

export function LoginScreen({ navigation, onLogin }: LoginScreenProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (!isLogin && !displayName.trim()) {
            Alert.alert('Error', 'Please enter your display name');
            return;
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                await api.login(email, password);
            } else {
                await api.signup(email, password, displayName);
                await api.login(email, password);
            }
            onLogin();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Authentication failed';
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.content}>
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logo}>
                            <Text style={styles.logoText}>V</Text>
                        </View>
                        <Text style={styles.appName}>VibeNotes</Text>
                        <Text style={styles.tagline}>Your thoughts, organized</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Text style={styles.title}>
                            {isLogin ? 'Welcome back' : 'Create account'}
                        </Text>

                        {!isLogin && (
                            <TextInput
                                style={styles.input}
                                placeholder="Display name"
                                placeholderTextColor="#9ca3af"
                                value={displayName}
                                onChangeText={setDisplayName}
                                autoCapitalize="words"
                            />
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#9ca3af"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#9ca3af"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {isLogin ? 'Sign In' : 'Sign Up'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.switchButton}
                            onPress={() => setIsLogin(!isLogin)}
                        >
                            <Text style={styles.switchText}>
                                {isLogin
                                    ? "Don't have an account? Sign up"
                                    : 'Already have an account? Sign in'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    keyboardAvoid: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoText: {
        fontSize: 40,
        fontWeight: '700',
        color: '#ffffff',
    },
    appName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    tagline: {
        fontSize: 16,
        color: '#6b7280',
    },
    form: {
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1f2937',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#6366f1',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: '#a5b4fc',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    switchButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    switchText: {
        color: '#6366f1',
        fontSize: 14,
    },
});
