import { useEffect, useMemo, useState } from 'react';
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
    Menu,
    ChevronLeft,
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

// MUI imports
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Drawer,
    Box,
    Divider,
    Chip,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';

const DRAWER_WIDTH = 320;

/**
 * Main Notes page with list and editor
 * Provides full note management interface with offline support
 */
export default function NotesPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Consolidated state management
    const { state: pageState, actions: pageActions } = useNotesPageState();
    const { selectedNote, selectedFolderId, errorMessage, showArchived, showFolders, distractionFreeMode } = pageState;
    const { selectNote, selectFolder, setError, toggleArchived, toggleFolders, toggleDistractionFree, exitDistractionFree, clearSelection } = pageActions;

    // Modal management
    const modals = useModalManager();

    // Drawer state for mobile
    const [drawerOpen, setDrawerOpen] = useState(!isMobile);

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


    // Sidebar content (reusable for both drawer modes)
    const sidebarContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Folder Tree Toggle */}
            <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFolders}
                    className="w-full justify-start"
                >
                    <FolderIcon className="h-4 w-4 mr-2" />
                    {showFolders ? 'Hide Folders' : 'Show Folders'}
                </Button>
            </Box>

            {/* Folder Tree */}
            {showFolders && (
                <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', maxHeight: 192, overflowY: 'auto' }}>
                    <FolderTree
                        selectedFolderId={selectedFolderId}
                        onSelectFolder={selectFolder}
                        onError={setError}
                    />
                </Box>
            )}

            {/* Note List */}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <NoteList
                    notes={showArchived ? archivedNotes : notes}
                    selectedNote={selectedNote}
                    onSelectNote={(note) => {
                        selectNote(note);
                        if (isMobile) setDrawerOpen(false);
                    }}
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
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* MUI AppBar - Hidden in distraction-free mode */}
            {!distractionFreeMode && (
                <AppBar
                    position="static"
                    color="default"
                    elevation={0}
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Toolbar variant="dense" sx={{ gap: 1 }}>
                        {/* Mobile menu button */}
                        {isMobile && (
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={() => setDrawerOpen(!drawerOpen)}
                                sx={{ mr: 1 }}
                            >
                                <Menu className="h-5 w-5" />
                            </IconButton>
                        )}

                        {/* Logo / Title */}
                        <Typography
                            variant="h6"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mr: 2,
                            }}
                        >
                            VibeNotes
                        </Typography>

                        {/* Status Chip */}
                        <Chip
                            icon={isOnline ? <Cloud className="h-3 w-3" /> : <CloudOff className="h-3 w-3" />}
                            label={isOnline ? 'Online' : 'Offline'}
                            size="small"
                            color={isOnline ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ mr: 1 }}
                        />

                        {/* Error Message */}
                        {errorMessage && (
                            <Chip
                                label={errorMessage}
                                size="small"
                                color="error"
                                onDelete={() => setError(null)}
                                sx={{ mr: 1 }}
                            />
                        )}

                        {/* Spacer */}
                        <Box sx={{ flexGrow: 1 }} />

                        {/* Action Group 1: Sync */}
                        <Tooltip title="Sync notes">
                            <span>
                                <IconButton
                                    onClick={handleSync}
                                    disabled={!isOnline || isSyncing}
                                    size="small"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                        {/* Action Group 2: Content */}
                        <ExportMenu
                            note={selectedNote}
                            notes={notes}
                            onImport={handleImport}
                            onError={setError}
                        />

                        <Tooltip title="Graph View">
                            <IconButton
                                onClick={() => modals.openModal('graphView')}
                                size="small"
                            >
                                <Network className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Advanced Search">
                            <IconButton
                                onClick={() => modals.openModal('advancedSearch')}
                                size="small"
                            >
                                <Search className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                        {/* Action Group 3: Collaboration */}
                        <Tooltip title="Activity Feed">
                            <IconButton
                                onClick={() => modals.openModal('activityFeed')}
                                size="small"
                            >
                                <Activity className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Workspaces">
                            <IconButton
                                onClick={() => modals.openModal('workspaces')}
                                size="small"
                            >
                                <Users className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                        {/* Action Group 4: Settings */}
                        <Tooltip title="Keyboard Shortcuts (Ctrl+?)">
                            <IconButton
                                onClick={() => modals.openModal('keyboardShortcuts')}
                                size="small"
                            >
                                <Keyboard className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>

                        <ModeToggle />

                        <Tooltip title="Logout">
                            <IconButton onClick={handleLogout} size="small">
                                <LogOut className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>
                    </Toolbar>
                </AppBar>
            )}

            {/* Main Content Area */}
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Drawer / Sidebar - Hidden in distraction-free mode */}
                {!distractionFreeMode && (
                    <Drawer
                        variant={isMobile ? 'temporary' : 'persistent'}
                        open={isMobile ? drawerOpen : true}
                        onClose={() => setDrawerOpen(false)}
                        sx={{
                            width: DRAWER_WIDTH,
                            flexShrink: 0,
                            '& .MuiDrawer-paper': {
                                width: DRAWER_WIDTH,
                                boxSizing: 'border-box',
                                position: isMobile ? 'fixed' : 'relative',
                                height: isMobile ? '100%' : 'auto',
                            },
                        }}
                    >
                        {/* Close button for mobile */}
                        {isMobile && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                                <IconButton onClick={() => setDrawerOpen(false)} size="small">
                                    <ChevronLeft className="h-5 w-5" />
                                </IconButton>
                            </Box>
                        )}
                        {sidebarContent}
                    </Drawer>
                )}

                {/* Note Editor */}
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        borderRight: distractionFreeMode ? 'none' : 1,
                        borderColor: 'divider',
                    }}
                >
                    {/* Editor toolbar - Hidden in distraction-free mode */}
                    {!distractionFreeMode && selectedNote && (
                        <Toolbar
                            variant="dense"
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                gap: 1,
                                minHeight: 48,
                            }}
                        >
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
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                History
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => modals.isOpen('comments') ? modals.closeModal() : modals.openModal('comments')}
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Comments
                            </Button>
                            <Box sx={{ flexGrow: 1 }} />
                            <CollaborationStatus
                                isConnected={collaboration.isConnected}
                                isCollaborating={collaboration.isCollaborating}
                                collaborators={collaboration.collaborators}
                                error={collaboration.error}
                            />
                        </Toolbar>
                    )}
                    {/* Distraction-free mode exit hint */}
                    {distractionFreeMode && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                fontSize: '0.75rem',
                                color: 'text.secondary',
                                opacity: 0.5,
                                transition: 'opacity 0.2s',
                                zIndex: 10,
                                '&:hover': { opacity: 1 },
                            }}
                        >
                            Press Esc to exit
                        </Box>
                    )}
                    <NoteEditor
                        note={selectedNote}
                        onSave={handleSaveNote}
                        onError={setError}
                    />
                </Box>

                {/* Right Sidebar - Attachments - Hidden in distraction-free mode and on mobile */}
                {!distractionFreeMode && (
                    <Box
                        sx={{
                            display: { xs: 'none', lg: 'block' },
                            width: DRAWER_WIDTH,
                            flexShrink: 0,
                            overflowY: 'auto',
                            p: 2,
                            bgcolor: 'action.hover',
                        }}
                    >
                        <StorageQuotaDisplay />
                        {selectedNote && (
                            <NoteAttachments
                                noteId={selectedNote.id}
                                onError={setError}
                            />
                        )}
                    </Box>
                )}
            </Box>

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
        </Box>
    );
}
