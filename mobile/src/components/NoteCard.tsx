import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Note } from '../services/api';

interface NoteCardProps {
    note: Note;
    onPress: () => void;
}

export function NoteCard({ note, onPress }: NoteCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const getPreview = (content: string) => {
        // Remove markdown formatting for preview
        const plain = content
            .replace(/#{1,6}\s/g, '')
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/`/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/\n/g, ' ')
            .trim();

        return plain.length > 100 ? plain.substring(0, 100) + '...' : plain;
    };

    return (
        <TouchableOpacity
            style={[styles.card, note.isPinned && styles.pinnedCard]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Pin indicator */}
            {note.isPinned && (
                <View style={styles.pinBadge}>
                    <Text style={styles.pinIcon}>📌</Text>
                </View>
            )}

            {/* Title */}
            <Text style={styles.title} numberOfLines={1}>
                {note.title || 'Untitled'}
            </Text>

            {/* Preview */}
            {note.content && (
                <Text style={styles.preview} numberOfLines={2}>
                    {getPreview(note.content)}
                </Text>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                    <View style={styles.tags}>
                        {note.tags.slice(0, 3).map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                        {note.tags.length > 3 && (
                            <Text style={styles.moreTags}>+{note.tags.length - 3}</Text>
                        )}
                    </View>
                )}

                {/* Date */}
                <Text style={styles.date}>{formatDate(note.updatedAt)}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    pinnedCard: {
        borderLeftWidth: 3,
        borderLeftColor: '#6366f1',
    },
    pinBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    pinIcon: {
        fontSize: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 6,
        paddingRight: 24,
    },
    preview: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
        marginRight: 8,
    },
    tag: {
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginRight: 6,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 12,
        color: '#6366f1',
    },
    moreTags: {
        fontSize: 12,
        color: '#9ca3af',
        marginLeft: 4,
    },
    date: {
        fontSize: 12,
        color: '#9ca3af',
    },
});
