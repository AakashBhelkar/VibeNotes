import { useEffect, useMemo } from 'react';
import { NoteList } from '@/components/NoteList';
import { NoteEditor } from '@/components/NoteEditor';
import { ExportMenu } from '@/components/ExportMenu';
import { NoteAttachments } from '@/components/NoteAttachments';
import { StorageQuotaDisplay } from '@/components/StorageQuotaDisplay';
import { useNotes } from '@/hooks/useNotes';
import { useSyncStatus } from '@/hooks/useSync';
import { Note, NoteVersion } from '@/lib/db';
import { Button } from '@/components/ui/button';
import {
    Cloud,
    CloudOff,
    RefreshCw,
    LogOut,
    Clock,
    Keyboard,
    Network,
    Activity,
    MessageSquare,
    Users,
    Search,
    FolderTree as FolderIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { ModeToggle } from '@/components/ModeToggle';
import { TemplateSelector } from '@/components/TemplateSelector';
import { TemplateService, Template } from '@/services/templateService';
import { WelcomeModal } from '@/components/WelcomeModal';
import { onboardingService } from '@/services/onboardingService';
import { sampleNotes } from '@/data/sampleNotes';
import { analyticsService } from '@/services/analyticsService';
import { VersionHistory } from '@/components/VersionHistory';
import { KeyboardShortcutsPanel } from '@/components/KeyboardShortcutsPanel';
import { ColorLabelPicker } from '@/components/ColorLabelPicker';
import { FolderTree } from '@/components/FolderTree';
import { GraphView } from '@/components/GraphView';
import { AdvancedSearchPanel, SearchFilters } from '@/components/AdvancedSearchPanel';
import { ActivityFeed } from '@/components/ActivityFeed';
import { CommentThread } from '@/components/CommentThread';
import { WorkspaceManager } from '@/components/WorkspaceManager';
import { CollaborationStatus } from '@/components/CollaboratorCursors';
import { useCollaboration } from '@/hooks/useCollaboration';
import { useModalManager } from '@/hooks/useModalManager';
import { useNotesPageState } from '@/hooks/useNotesPageState';

/**
 * Main Notes page with list and editor
 * Provides full note management interface with offline support
 */
export default function NotesPage() {
    const navigate = useNavigate();

    // Consolidated state management
    const { state: pageState, actions: pageActions } = useNotesPageState();
    const { selectedNote, selectedFolderId, errorMessage, showArchived, showFolders, distractionFreeMode } = pageState;
    const { selectNote, selectFolder, setError, toggleArchived, toggleFolders, toggleDistractionFree, exitDistractionFree, clearSelection } = pageActions;

    // Modal management
    const modals = useModalManager();

    const { notes, createNote, updateNote, deleteNote, searchNotes, refresh, fetchArchivedNotes, archivedNotes } = useNotes();
    const collaboration = useCollaboration(selectedNote?.id || null);
    const { isOnline, isSyncing, sync } = useSyncStatus();

    // Extract all unique tags from notes
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        notes.forEach(note => {
            note.tags?.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, [notes]);

    // Search filters handler for advanced search
    const handleSearchFiltersChange = (_filters: SearchFilters | null) => {
        // Filters are handled internally by AdvancedSearchPanel
    };

    // Check if this is the user's first visit
    useEffect(() => {
        if (onboardingService.isFirstVisit()) {
            modals.openModal('welcome');
        }
    }, [modals]);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + ? to show keyboard shortcuts
            if ((e.ctrlKey || e.metaKey) && e.key === '?') {
                e.preventDefault();
                modals.openModal('keyboardShortcuts');
            }
            // Ctrl/Cmd + Shift + F to toggle distraction-free mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                toggleDistractionFree();
            }
            // Escape to exit distraction-free mode
            if (e.key === 'Escape' && distractionFreeMode) {
                exitDistractionFree();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [distractionFreeMode, modals, toggleDistractionFree, exitDistractionFree]);

    const handleCreateNote = async (): Promise<void> => {
        try {
            const newNote = await createNote('Untitled', '');
            selectNote(newNote);
            setError(null);
            analyticsService.trackNoteCreated();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create note';
            setError(message);
        }
    };

    const handleDeleteNote = async (id: string): Promise<void> => {
        try {
            await deleteNote(id);
            if (selectedNote?.id === id) {
                clearSelection();
            }
            setError(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete note';
            setError(message);
        }
    };

    const handleTogglePin = async (id: string, isPinned: boolean): Promise<void> => {
        try {
            await updateNote(id, { isPinned });
            refresh();
            setError(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to pin note';
            setError(message);
        }
    };

    const handleToggleArchive = async (id: string, isArchived: boolean): Promise<void> => {
        try {
            await updateNote(id, { isArchived });
            if (selectedNote?.id === id) {
                clearSelection();
            }
            refresh();
            if (showArchived) {
                fetchArchivedNotes();
            }
            setError(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to archive note';
            setError(message);
        }
    };

    const handleToggleShowArchived = (): void => {
        toggleArchived();
        if (!showArchived) {
            fetchArchivedNotes();
        } else {
            refresh();
        }
    };

    const handleSaveNote = async (id: string, updates: Partial<Note>): Promise<void> => {
        try {
            await updateNote(id, updates);
            setError(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save note';
            setError(message);
        }
    };

    const handleLogout = (): void => {
        authService.logout();
        navigate('/login');
    };

    const handleSync = async (): Promise<void> => {
        try {
            await sync();
            setError(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to sync';
            setError(message);
        }
    };

    const handleImport = async (importedNotes: Partial<Note>[]): Promise<void> => {
        try {
            for (const note of importedNotes) {
                await createNote(note.title || 'Untitled', note.content || '', note.tags);
            }
            refresh();
            setError(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to import notes';
            setError(message);
        }
    };

    const handleSelectTemplate = async (template: Template): Promise<void> => {
        try {
            const noteData = TemplateService.createNoteFromTemplate(template);
            const newNote = await createNote(
                noteData.title || 'Untitled',
                noteData.content || '',
                noteData.tags
            );
            selectNote(newNote);
            setError(null);
            analyticsService.trackTemplateUsed(template.name, template.id.startsWith('custom-'));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create note from template';
            setError(message);
        }
    };

    const handleCreateDailyNote = async (): Promise<void> => {
        try {
            const dailyNoteData = TemplateService.createDailyNote();
            const newNote = await createNote(
                dailyNoteData.title || 'Untitled',
                dailyNoteData.content || '',
                dailyNoteData.tags
            );
            selectNote(newNote);
            setError(null);
            analyticsService.trackDailyNoteCreated();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create daily note';
            setError(message);
        }
    };

    const handleCreateSampleNotes = async (): Promise<void> => {
        try {
            if (!onboardingService.hasSampleNotes()) {
                // Create sample notes
                for (const sampleNote of sampleNotes) {
                    await createNote(sampleNote.title, sampleNote.content, sampleNote.tags);
                }
                onboardingService.markSampleNotesCreated();
                refresh();
            }
            onboardingService.completeOnboarding();
            analyticsService.trackOnboardingCompleted(!onboardingService.hasSampleNotes());
            setError(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create sample notes';
            setError(message);
        }
    };

    const handleRestoreVersion = async (version: NoteVersion): Promise<void> => {
        try {
            if (selectedNote) {
                await updateNote(selectedNote.id, {
                    title: version.title,
                    content: version.content,
                    tags: version.tags,
                });
                refresh();
                modals.closeModal();
                analyticsService.trackVersionRestored();
                setError(null);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to restore version';
            setError(message);
        }
    };


    return (
        <div className="h-screen flex flex-col">
            {/* Top Bar - Hidden in distraction-free mode */}
            {!distractionFreeMode && (
            <div className="h-14 border-b flex items-center justify-between px-4 bg-card">
                <h1 className="text-xl font-bold">VibeNotes</h1>

                <div className="flex items-center gap-2">
                    {/* Error Message */}
                    {errorMessage && (
                        <span className="text-sm text-destructive">{errorMessage}</span>
                    )}

                    {/* Online/Offline Indicator */}
                    <div className="flex items-center gap-2 text-sm">
                        {isOnline ? (
                            <Cloud className="h-4 w-4 text-green-500" />
                        ) : (
                            <CloudOff className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-muted-foreground">
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>

                    {/* Sync Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSync}
                        disabled={!isOnline || isSyncing}
                        aria-label="Sync notes"
                    >
                        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    </Button>

                    {/* Export Menu */}
                    <ExportMenu
                        note={selectedNote}
                        notes={notes}
                        onImport={handleImport}
                        onError={setError}
                    />

                    {/* Graph View */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => modals.openModal('graphView')}
                        aria-label="Graph view"
                        title="Graph View"
                    >
                        <Network className="h-4 w-4" />
                    </Button>

                    {/* Advanced Search */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => modals.openModal('advancedSearch')}
                        aria-label="Advanced search"
                        title="Advanced Search"
                    >
                        <Search className="h-4 w-4" />
                    </Button>

                    {/* Activity Feed */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => modals.openModal('activityFeed')}
                        aria-label="Activity feed"
                        title="Activity Feed"
                    >
                        <Activity className="h-4 w-4" />
                    </Button>

                    {/* Workspaces */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => modals.openModal('workspaces')}
                        aria-label="Workspaces"
                        title="Workspaces"
                    >
                        <Users className="h-4 w-4" />
                    </Button>

                    {/* Keyboard Shortcuts */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => modals.openModal('keyboardShortcuts')}
                        aria-label="Keyboard shortcuts"
                        title="Keyboard shortcuts (Ctrl+?)"
                    >
                        <Keyboard className="h-4 w-4" />
                    </Button>

                    {/* Theme Toggle */}
                    <ModeToggle />

                    {/* Logout */}
                    <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Note List Sidebar - Hidden in distraction-free mode */}
                {!distractionFreeMode && (
                <div className="w-full md:w-80 md:flex-shrink-0 flex flex-col border-r">
                    {/* Folder Tree Toggle */}
                    <div className="p-2 border-b flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleFolders}
                            className="w-full justify-start"
                        >
                            <FolderIcon className="h-4 w-4 mr-2" />
                            {showFolders ? 'Hide Folders' : 'Show Folders'}
                        </Button>
                    </div>

                    {/* Folder Tree */}
                    {showFolders && (
                        <div className="p-2 border-b max-h-48 overflow-y-auto">
                            <FolderTree
                                selectedFolderId={selectedFolderId}
                                onSelectFolder={selectFolder}
                                onError={setError}
                            />
                        </div>
                    )}

                    {/* Note List */}
                    <div className="flex-1 overflow-hidden">
                        <NoteList
                            notes={showArchived ? archivedNotes : notes}
                            selectedNote={selectedNote}
                            onSelectNote={selectNote}
                            onCreateNote={handleCreateNote}
                            onDeleteNote={handleDeleteNote}
                            onTogglePin={handleTogglePin}
                            onToggleArchive={handleToggleArchive}
                            onSearch={searchNotes}
                            showArchived={showArchived}
                            onToggleShowArchived={handleToggleShowArchived}
                            templateSelector={
                                <TemplateSelector
                                    onSelectTemplate={handleSelectTemplate}
                                    onCreateDailyNote={handleCreateDailyNote}
                                />
                            }
                        />
                    </div>
                </div>
                )}

                {/* Note Editor */}
                <div className={`flex-1 flex flex-col ${distractionFreeMode ? '' : 'border-r'}`}>
                    {/* Editor toolbar - Hidden in distraction-free mode */}
                    {!distractionFreeMode && selectedNote && (
                        <div className="border-b p-2 flex items-center gap-2">
                            <ColorLabelPicker
                                noteId={selectedNote.id}
                                onError={setError}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    modals.openModal('versionHistory');
                                    analyticsService.trackVersionHistoryViewed();
                                }}
                                title="Version History (Ctrl+H)"
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                History
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => modals.isOpen('comments') ? modals.closeModal() : modals.openModal('comments')}
                                title="Comments"
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Comments
                            </Button>
                            <div className="ml-auto">
                                <CollaborationStatus
                                    isConnected={collaboration.isConnected}
                                    isCollaborating={collaboration.isCollaborating}
                                    collaborators={collaboration.collaborators}
                                    error={collaboration.error}
                                />
                            </div>
                        </div>
                    )}
                    {/* Distraction-free mode exit hint */}
                    {distractionFreeMode && (
                        <div className="absolute top-2 right-2 text-xs text-muted-foreground opacity-50 hover:opacity-100 transition-opacity z-10">
                            Press Esc to exit
                        </div>
                    )}
                    <NoteEditor
                        note={selectedNote}
                        onSave={handleSaveNote}
                        onError={setError}
                    />
                </div>

                {/* Right Sidebar - Attachments - Hidden in distraction-free mode and on mobile */}
                {!distractionFreeMode && (
                <div className="hidden lg:block w-80 flex-shrink-0 overflow-y-auto p-4 bg-muted/30">
                    <StorageQuotaDisplay />
                    {selectedNote && (
                        <NoteAttachments
                            noteId={selectedNote.id}
                            onError={setError}
                        />
                    )}
                </div>
                )}
            </div>

            {/* Version History Modal */}
            {modals.isOpen('versionHistory') && selectedNote && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background rounded-lg shadow-lg w-full h-full sm:w-[90vw] sm:h-[80vh] max-w-6xl overflow-hidden">
                        <VersionHistory
                            noteId={selectedNote.id}
                            onRestore={handleRestoreVersion}
                            onClose={() => modals.closeModal()}
                        />
                    </div>
                </div>
            )}

            {/* Welcome Modal for First-Time Users */}
            <WelcomeModal
                open={modals.isOpen('welcome')}
                onClose={() => {
                    modals.closeModal();
                    onboardingService.completeOnboarding();
                }}
                onCreateSampleNotes={handleCreateSampleNotes}
            />

            {/* Keyboard Shortcuts Panel */}
            <KeyboardShortcutsPanel
                isOpen={modals.isOpen('keyboardShortcuts')}
                onClose={() => modals.closeModal()}
            />

            {/* Graph View Modal */}
            {modals.isOpen('graphView') && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background rounded-lg shadow-lg w-full h-full sm:w-[90vw] sm:h-[80vh] max-w-6xl flex flex-col overflow-hidden">
                        <GraphView
                            notes={notes}
                            onSelectNote={(noteId) => {
                                const note = notes.find(n => n.id === noteId);
                                if (note) selectNote(note);
                                modals.closeModal();
                            }}
                            onClose={() => modals.closeModal()}
                        />
                    </div>
                </div>
            )}

            {/* Advanced Search Panel */}
            {modals.isOpen('advancedSearch') && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background rounded-lg shadow-lg w-full sm:w-[90vw] max-w-2xl max-h-full sm:max-h-[80vh] overflow-y-auto">
                        <AdvancedSearchPanel
                            notes={notes}
                            allTags={allTags}
                            onFiltersChange={handleSearchFiltersChange}
                            onClose={() => modals.closeModal()}
                        />
                    </div>
                </div>
            )}

            {/* Activity Feed Panel */}
            {modals.isOpen('activityFeed') && (
                <ActivityFeed
                    onClose={() => modals.closeModal()}
                    onSelectNote={(noteId) => {
                        const note = notes.find(n => n.id === noteId);
                        if (note) selectNote(note);
                        modals.closeModal();
                    }}
                />
            )}

            {/* Comments Panel */}
            {modals.isOpen('comments') && selectedNote && (
                <CommentThread
                    noteId={selectedNote.id}
                    onClose={() => modals.closeModal()}
                />
            )}

            {/* Workspace Manager Modal */}
            {modals.isOpen('workspaces') && (
                <WorkspaceManager onClose={() => modals.closeModal()} />
            )}
        </div>
    );
}
