import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotes } from '@/hooks/useNotes';
import { noteStorage } from '@/services/noteStorage';
import { authService } from '@/services/authService';
import { Note } from '@/lib/db';

// Mock dependencies
vi.mock('@/services/noteStorage');
vi.mock('@/services/authService');

describe('useNotes - Advanced Filtering', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    const mockNotes: Note[] = [
        {
            id: '1',
            userId: 'user-123',
            title: 'React Tutorial',
            content: 'Learn React hooks and components',
            tags: ['react', 'javascript', 'tutorial'],
            isPinned: false,
            isArchived: false,
            version: 1,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-15'),
        },
        {
            id: '2',
            userId: 'user-123',
            title: 'TypeScript Guide',
            content: 'Advanced TypeScript patterns',
            tags: ['typescript', 'javascript'],
            isPinned: true,
            isArchived: false,
            version: 1,
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-02-10'),
        },
        {
            id: '3',
            userId: 'user-123',
            title: 'Python Basics',
            content: 'Introduction to Python programming',
            tags: ['python', 'tutorial'],
            isPinned: false,
            isArchived: false,
            version: 1,
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date('2024-03-05'),
        },
    ];

    beforeEach(() => {
        vi.mocked(authService.getUser).mockReturnValue(mockUser);
        vi.mocked(noteStorage.getAll).mockResolvedValue(mockNotes);
    });

    describe('filterNotes', () => {
        it('should filter by search query', async () => {
            const { result } = renderHook(() => useNotes());

            await act(async () => {
                await result.current.filterNotes({ searchQuery: 'react' });
            });

            expect(result.current.notes).toHaveLength(1);
            expect(result.current.notes[0].title).toBe('React Tutorial');
        });

        it('should filter by single tag', async () => {
            const { result } = renderHook(() => useNotes());

            await act(async () => {
                await result.current.filterNotes({ tags: ['python'] });
            });

            expect(result.current.notes).toHaveLength(1);
            expect(result.current.notes[0].title).toBe('Python Basics');
        });

        it('should filter by multiple tags with AND logic', async () => {
            const { result } = renderHook(() => useNotes());

            await act(async () => {
                await result.current.filterNotes({ tags: ['javascript', 'tutorial'] });
            });

            expect(result.current.notes).toHaveLength(1);
            expect(result.current.notes[0].title).toBe('React Tutorial');
        });

        it('should filter by date range', async () => {
            const { result } = renderHook(() => useNotes());

            await act(async () => {
                await result.current.filterNotes({
                    dateRange: {
                        from: new Date('2024-02-01'),
                        to: new Date('2024-03-31'),
                    },
                });
            });

            expect(result.current.notes).toHaveLength(2);
            expect(result.current.notes.map((n: Note) => n.title)).toContain('TypeScript Guide');
            expect(result.current.notes.map((n: Note) => n.title)).toContain('Python Basics');
        });

        it('should combine search query and tags', async () => {
            const { result } = renderHook(() => useNotes());

            await act(async () => {
                await result.current.filterNotes({
                    searchQuery: 'tutorial',
                    tags: ['react'],
                });
            });

            expect(result.current.notes).toHaveLength(1);
            expect(result.current.notes[0].title).toBe('React Tutorial');
        });

        it('should combine all filters', async () => {
            const { result } = renderHook(() => useNotes());

            await act(async () => {
                await result.current.filterNotes({
                    searchQuery: 'react',
                    tags: ['javascript'],
                    dateRange: {
                        from: new Date('2024-01-01'),
                        to: new Date('2024-01-31'),
                    },
                });
            });

            expect(result.current.notes).toHaveLength(1);
            expect(result.current.notes[0].title).toBe('React Tutorial');
        });

        it('should return all notes when no filters applied', async () => {
            const { result } = renderHook(() => useNotes());

            await act(async () => {
                await result.current.filterNotes({});
            });

            expect(result.current.notes).toHaveLength(3);
        });

        it('should return empty array when no notes match', async () => {
            const { result } = renderHook(() => useNotes());

            await act(async () => {
                await result.current.filterNotes({ searchQuery: 'nonexistent' });
            });

            expect(result.current.notes).toHaveLength(0);
        });

        it('should be case-insensitive for search query', async () => {
            const { result } = renderHook(() => useNotes());

            await act(async () => {
                await result.current.filterNotes({ searchQuery: 'REACT' });
            });

            expect(result.current.notes).toHaveLength(1);
            expect(result.current.notes[0].title).toBe('React Tutorial');
        });
    });

    describe('getAllTags', () => {
        it('should return all unique tags sorted alphabetically', async () => {
            const { result } = renderHook(() => useNotes());

            // Wait for notes to load
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            const tags = result.current.getAllTags();

            expect(tags).toEqual(['javascript', 'python', 'react', 'tutorial', 'typescript']);
        });

        it('should return empty array when no notes', async () => {
            vi.mocked(noteStorage.getAll).mockResolvedValue([]);

            const { result } = renderHook(() => useNotes());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            const tags = result.current.getAllTags();

            expect(tags).toEqual([]);
        });

        it('should not include duplicate tags', async () => {
            const { result } = renderHook(() => useNotes());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            const tags = result.current.getAllTags();
            const uniqueTags = [...new Set(tags)];

            expect(tags).toEqual(uniqueTags);
        });
    });

    describe('Edge Cases', () => {
        it('should handle notes with no tags', async () => {
            const notesWithoutTags: Note[] = [
                {
                    id: '4',
                    userId: 'user-123',
                    title: 'No Tags Note',
                    content: 'This note has no tags',
                    tags: [],
                    isPinned: false,
                    isArchived: false,
                    version: 1,
                    createdAt: new Date('2024-04-01'),
                    updatedAt: new Date('2024-04-01'),
                },
            ];

            vi.mocked(noteStorage.getAll).mockResolvedValue(notesWithoutTags);

            const { result } = renderHook(() => useNotes());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            expect(result.current.notes).toHaveLength(1);
        });

        it('should handle empty search query', async () => {
            const { result } = renderHook(() => useNotes());

            await act(async () => {
                await result.current.filterNotes({ searchQuery: '' });
            });

            expect(result.current.notes).toHaveLength(3);
        });

        it('should handle whitespace-only search query', async () => {
            const { result } = renderHook(() => useNotes());

            await act(async () => {
                await result.current.filterNotes({ searchQuery: '   ' });
            });

            expect(result.current.notes).toHaveLength(3);
        });

        it('should handle empty tags array', async () => {
            const { result } = renderHook(() => useNotes());

            await act(async () => {
                await result.current.filterNotes({ tags: [] });
            });

            expect(result.current.notes).toHaveLength(3);
        });
    });
});
