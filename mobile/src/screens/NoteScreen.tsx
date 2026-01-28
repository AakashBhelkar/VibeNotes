import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNoteStore } from '../store/noteStore';

interface NoteScreenProps {
    navigation: any;
    route: any;
}

export function NoteScreen({ navigation, route }: NoteScreenProps) {
    const { isNew, noteId } = route.params || {};
    const { selectedNote, createNote, updateNote, deleteNote, selectNote } = useNoteStore();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const contentInputRef = useRef<TextInput>(null);

    // Load note data
    useEffect(() => {
        if (!isNew && selectedNote) {
            setTitle(selectedNote.title);
            setContent(selectedNote.content);
            setTags(selectedNote.tags || []);
        }
    }, [isNew, selectedNote]);

    // Track changes
    useEffect(() => {
        if (!isNew && selectedNote) {
            const changed =
                title !== selectedNote.title ||
                content !== selectedNote.content ||
                JSON.stringify(tags) !== JSON.stringify(selectedNote.tags || []);
            setHasChanges(changed);
        } else if (isNew) {
            setHasChanges(title.length > 0 || content.length > 0);
        }
    }, [title, content, tags, isNew, selectedNote]);

    // Auto-save on back
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            if (hasChanges) {
                e.preventDefault();
                handleSave().then(() => {
                    navigation.dispatch(e.data.action);
                });
            }
        });

        return unsubscribe;
    }, [navigation, hasChanges, title, content, tags]);

    const handleSave = async () => {
        if (isSaving) return;

        setIsSaving(true);
        try {
            if (isNew) {
                if (title.trim() || content.trim()) {
                    await createNote(title || 'Untitled', content, tags);
                }
            } else if (selectedNote && hasChanges) {
                await updateNote(selectedNote.id, { title, content, tags });
            }
            setHasChanges(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to save note');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (selectedNote) {
                            try {
                                await deleteNote(selectedNote.id);
                                selectNote(null);
                                navigation.goBack();
                            } catch (error) {
                                Alert.alert('Error', 'Failed to delete note');
                            }
                        }
                    },
                },
            ]
        );
    };

    const handleAddTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const handleTogglePin = async () => {
        if (selectedNote) {
            try {
                await updateNote(selectedNote.id, { isPinned: !selectedNote.isPinned });
            } catch (error) {
                Alert.alert('Error', 'Failed to update note');
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>

                    <View style={styles.headerActions}>
                        {!isNew && (
                            <>
                                <TouchableOpacity
                                    onPress={handleTogglePin}
                                    style={styles.headerButton}
                                >
                                    <Text style={styles.headerIcon}>
                                        {selectedNote?.isPinned ? '📌' : '📍'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleDelete}
                                    style={styles.headerButton}
                                >
                                    <Text style={styles.headerIcon}>🗑️</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity
                            onPress={handleSave}
                            style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
                            disabled={!hasChanges || isSaving}
                        >
                            <Text style={[styles.saveText, !hasChanges && styles.saveTextDisabled]}>
                                {isSaving ? 'Saving...' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Title */}
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Note title"
                        placeholderTextColor="#9ca3af"
                        value={title}
                        onChangeText={setTitle}
                        returnKeyType="next"
                        onSubmitEditing={() => contentInputRef.current?.focus()}
                    />

                    {/* Tags */}
                    <View style={styles.tagsSection}>
                        <View style={styles.tagsList}>
                            {tags.map((tag, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.tag}
                                    onPress={() => handleRemoveTag(tag)}
                                >
                                    <Text style={styles.tagText}>{tag}</Text>
                                    <Text style={styles.tagRemove}>×</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.tagInputContainer}>
                            <TextInput
                                style={styles.tagInput}
                                placeholder="Add tag..."
                                placeholderTextColor="#9ca3af"
                                value={tagInput}
                                onChangeText={setTagInput}
                                onSubmitEditing={handleAddTag}
                                returnKeyType="done"
                            />
                        </View>
                    </View>

                    {/* Content */}
                    <TextInput
                        ref={contentInputRef}
                        style={styles.contentInput}
                        placeholder="Start writing..."
                        placeholderTextColor="#9ca3af"
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                    />
                </ScrollView>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        padding: 8,
        marginRight: 8,
    },
    headerIcon: {
        fontSize: 18,
    },
    saveButton: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#e5e5e5',
    },
    saveText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
    saveTextDisabled: {
        color: '#9ca3af',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    titleInput: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 16,
        padding: 0,
    },
    tagsSection: {
        marginBottom: 20,
    },
    tagsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 14,
        color: '#6366f1',
    },
    tagRemove: {
        fontSize: 16,
        color: '#9ca3af',
        marginLeft: 6,
    },
    tagInputContainer: {
        flexDirection: 'row',
    },
    tagInput: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        padding: 0,
    },
    contentInput: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
        minHeight: 300,
        padding: 0,
    },
});
