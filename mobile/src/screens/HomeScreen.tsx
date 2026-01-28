import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { useNoteStore } from '../store/noteStore';
import { NoteCard } from '../components/NoteCard';
import { Note } from '../services/api';

interface HomeScreenProps {
    navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
    const { notes, isLoading, error, fetchNotes, selectNote } = useNoteStore();

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleRefresh = useCallback(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleNotePress = useCallback((note: Note) => {
        selectNote(note);
        navigation.navigate('Note', { noteId: note.id });
    }, [selectNote, navigation]);

    const handleCreateNote = useCallback(() => {
        navigation.navigate('Note', { isNew: true });
    }, [navigation]);

    const renderNote = useCallback(({ item }: { item: Note }) => (
        <NoteCard
            note={item}
            onPress={() => handleNotePress(item)}
        />
    ), [handleNotePress]);

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No notes yet</Text>
            <Text style={styles.emptySubtitle}>
                Tap the + button to create your first note
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>VibeNotes</Text>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Text style={styles.settingsIcon}>⚙️</Text>
                </TouchableOpacity>
            </View>

            {/* Error Banner */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Notes List */}
            <FlatList
                data={notes}
                renderItem={renderNote}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={handleRefresh}
                        colors={['#6366f1']}
                        tintColor="#6366f1"
                    />
                }
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={handleCreateNote}
                activeOpacity={0.8}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#6366f1',
    },
    settingsButton: {
        padding: 8,
    },
    settingsIcon: {
        fontSize: 20,
    },
    errorBanner: {
        backgroundColor: '#fef2f2',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#fecaca',
    },
    errorText: {
        color: '#dc2626',
        fontSize: 14,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabIcon: {
        fontSize: 28,
        color: '#ffffff',
        fontWeight: '300',
    },
});
