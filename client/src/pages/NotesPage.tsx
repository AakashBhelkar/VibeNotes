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
    FileText,
    Archive,
    Star,
    Tag,
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
    IconButton,
    Typography,
    Drawer,
    Box,
    Divider,
    Avatar,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Badge,
    InputAdornment,
    TextField,
    Paper,
    Tooltip,
    useMediaQuery,
    useTheme,
    Snackbar,
    Alert,
} from '@mui/material';

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 72;

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
    badge?: number;
}

/**
 * Main Notes page with Pabbly-style UI
 */
export default function NotesPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Sidebar state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeNavItem, setActiveNavItem] = useState('notes');

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

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

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

    // Get user info
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
            return {};
        }
    }, []);

    // Navigation items
    const navItems: NavItem[] = [
        { id: 'notes', label: 'All Notes', icon: <FileText className="h-5 w-5" />, onClick: () => { setActiveNavItem('notes'); if (showArchived) toggleArchived(); } },
        { id: 'starred', label: 'Starred', icon: <Star className="h-5 w-5" />, onClick: () => setActiveNavItem('starred') },
        { id: 'archive', label: 'Archive', icon: <Archive className="h-5 w-5" />, onClick: () => { setActiveNavItem('archive'); if (!showArchived) { toggleArchived(); fetchArchivedNotes(); } } },
        { id: 'tags', label: 'Tags', icon: <Tag className="h-5 w-5" />, badge: allTags.length, onClick: () => setActiveNavItem('tags') },
    ];

    const toolItems: NavItem[] = [
        { id: 'graph', label: 'Graph View', icon: <Network className="h-5 w-5" />, onClick: () => modals.openModal('graphView') },
        { id: 'activity', label: 'Activity', icon: <Activity className="h-5 w-5" />, onClick: () => modals.openModal('activityFeed') },
        { id: 'workspaces', label: 'Workspaces', icon: <Users className="h-5 w-5" />, onClick: () => modals.openModal('workspaces') },
    ];

    // Check if this is the user's first visit
    useEffect(() => {
        if (onboardingService.isFirstVisit()) {
            modals.openModal('welcome');
        }
    }, [modals]);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === '?') {
                e.preventDefault();
                modals.openModal('keyboardShortcuts');
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                toggleDistractionFree();
            }
            if (e.key === 'Escape' && distractionFreeMode) {
                exitDistractionFree();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [distractionFreeMode, modals, toggleDistractionFree, exitDistractionFree]);

    // Handle search
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            searchNotes(query);
        } else {
            refresh();
        }
    };

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

    // Sidebar component
    const renderSidebar = () => (
        <Box
            sx={{
                width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
                height: '100vh',
                bgcolor: '#1a1a2e',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.2s ease',
                overflow: 'hidden',
            }}
        >
            {/* Logo Section */}
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    minHeight: 64,
                }}
            >
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <FileText className="h-5 w-5 text-white" />
                </Box>
                {!sidebarCollapsed && (
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                        VibeNotes
                    </Typography>
                )}
            </Box>

            {/* Navigation */}
            <Box sx={{ flex: 1, py: 2, overflow: 'auto' }}>
                <List sx={{ px: 1 }}>
                    {navItems.map((item) => (
                        <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={item.onClick}
                                selected={activeNavItem === item.id}
                                sx={{
                                    borderRadius: 2,
                                    px: sidebarCollapsed ? 1.5 : 2,
                                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                    '&.Mui-selected': {
                                        bgcolor: 'rgba(99, 102, 241, 0.2)',
                                        '&:hover': {
                                            bgcolor: 'rgba(99, 102, 241, 0.3)',
                                        },
                                    },
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ color: activeNavItem === item.id ? '#6366f1' : 'rgba(255,255,255,0.7)', minWidth: sidebarCollapsed ? 0 : 40 }}>
                                    {item.badge ? (
                                        <Badge badgeContent={item.badge} color="primary" max={99}>
                                            {item.icon}
                                        </Badge>
                                    ) : item.icon}
                                </ListItemIcon>
                                {!sidebarCollapsed && (
                                    <ListItemText
                                        primary={item.label}
                                        sx={{
                                            '& .MuiTypography-root': {
                                                fontSize: '0.9rem',
                                                color: activeNavItem === item.id ? 'white' : 'rgba(255,255,255,0.7)',
                                            }
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* Tools Section */}
                {!sidebarCollapsed && (
                    <Typography variant="caption" sx={{ px: 3, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Tools
                    </Typography>
                )}
                <List sx={{ px: 1, mt: 1 }}>
                    {toolItems.map((item) => (
                        <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={item.onClick}
                                sx={{
                                    borderRadius: 2,
                                    px: sidebarCollapsed ? 1.5 : 2,
                                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ color: 'rgba(255,255,255,0.7)', minWidth: sidebarCollapsed ? 0 : 40 }}>
                                    {item.icon}
                                </ListItemIcon>
                                {!sidebarCollapsed && (
                                    <ListItemText
                                        primary={item.label}
                                        sx={{ '& .MuiTypography-root': { fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' } }}
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Collapse Button */}
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <ListItemButton
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    sx={{
                        borderRadius: 2,
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                    }}
                >
                    <ListItemIcon sx={{ color: 'rgba(255,255,255,0.7)', minWidth: sidebarCollapsed ? 0 : 40 }}>
                        <ChevronLeft className={`h-5 w-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                    </ListItemIcon>
                    {!sidebarCollapsed && (
                        <ListItemText
                            primary="Collapse"
                            sx={{ '& .MuiTypography-root': { fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' } }}
                        />
                    )}
                </ListItemButton>
            </Box>
        </Box>
    );

    if (distractionFreeMode) {
        return (
            <Box sx={{ height: '100vh', position: 'relative' }}>
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
                <NoteEditor
                    note={selectedNote}
                    onSave={handleSaveNote}
                    onError={setError}
                />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
            {/* Sidebar */}
            {!isMobile && renderSidebar()}

            {/* Mobile Drawer */}
            {isMobile && (
                <Drawer
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: SIDEBAR_WIDTH,
                            bgcolor: '#1a1a2e',
                        },
                    }}
                >
                    {renderSidebar()}
                </Drawer>
            )}

            {/* Main Content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top Bar */}
                <Paper
                    elevation={0}
                    sx={{
                        px: 3,
                        py: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'white',
                    }}
                >
                    {/* Mobile Menu */}
                    {isMobile && (
                        <IconButton onClick={() => setDrawerOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </IconButton>
                    )}

                    {/* Search */}
                    <TextField
                        placeholder="Search notes..."
                        size="small"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        sx={{
                            width: 300,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: '#f5f5f5',
                                borderRadius: 2,
                                '& fieldset': { border: 'none' },
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Spacer */}
                    <Box sx={{ flex: 1 }} />

                    {/* Status */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isOnline ? (
                            <Cloud className="h-4 w-4 text-green-500" />
                        ) : (
                            <CloudOff className="h-4 w-4 text-gray-400" />
                        )}
                        <Typography variant="caption" color="text.secondary">
                            {isOnline ? 'Online' : 'Offline'}
                        </Typography>
                    </Box>

                    {/* Actions */}
                    <Tooltip title="Sync">
                        <span>
                            <IconButton onClick={handleSync} disabled={!isOnline || isSyncing} size="small">
                                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <ExportMenu
                        note={selectedNote}
                        notes={notes}
                        onImport={handleImport}
                        onError={setError}
                    />

                    <Tooltip title="Keyboard Shortcuts">
                        <IconButton onClick={() => modals.openModal('keyboardShortcuts')} size="small">
                            <Keyboard className="h-4 w-4" />
                        </IconButton>
                    </Tooltip>

                    <ModeToggle />

                    <Divider orientation="vertical" flexItem />

                    {/* User Avatar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: '#6366f1',
                                fontSize: '0.875rem',
                            }}
                        >
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </Avatar>
                        {!isMobile && (
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {user.displayName || user.email || 'User'}
                            </Typography>
                        )}
                        <Tooltip title="Logout">
                            <IconButton onClick={handleLogout} size="small">
                                <LogOut className="h-4 w-4" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Paper>

                {/* Content Area */}
                <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Notes List Panel */}
                    <Paper
                        elevation={0}
                        sx={{
                            width: 320,
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            flexDirection: 'column',
                            bgcolor: 'white',
                        }}
                    >
                        {/* Panel Header */}
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {showArchived ? 'Archived Notes' : 'All Notes'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {(showArchived ? archivedNotes : notes).length} notes
                                </Typography>
                            </Box>

                            {/* Quick Actions */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    onClick={handleCreateNote}
                                    className="flex-1"
                                    size="sm"
                                >
                                    New Note
                                </Button>
                                <TemplateSelector
                                    onSelectTemplate={handleSelectTemplate}
                                    onCreateDailyNote={handleCreateDailyNote}
                                />
                            </Box>
                        </Box>

                        {/* Folder Toggle */}
                        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
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
                            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', maxHeight: 150, overflowY: 'auto' }}>
                                <FolderTree
                                    selectedFolderId={selectedFolderId}
                                    onSelectFolder={selectFolder}
                                    onError={setError}
                                />
                            </Box>
                        )}

                        {/* Notes List */}
                        <Box sx={{ flex: 1, overflow: 'auto' }}>
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
                            />
                        </Box>
                    </Paper>

                    {/* Editor Panel */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
                        {/* Editor Toolbar */}
                        {selectedNote && (
                            <Box
                                sx={{
                                    px: 2,
                                    py: 1,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
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
                                <Box sx={{ flex: 1 }} />
                                <CollaborationStatus
                                    isConnected={collaboration.isConnected}
                                    isCollaborating={collaboration.isCollaborating}
                                    collaborators={collaboration.collaborators}
                                    error={collaboration.error}
                                    isOffline={collaboration.isOffline}
                                />
                            </Box>
                        )}

                        {/* Note Editor */}
                        <Box sx={{ flex: 1, overflow: 'auto' }}>
                            <NoteEditor
                                note={selectedNote}
                                onSave={handleSaveNote}
                                onError={setError}
                            />
                        </Box>
                    </Box>

                    {/* Right Sidebar - Attachments (Desktop only) */}
                    <Paper
                        elevation={0}
                        sx={{
                            width: 280,
                            borderLeft: '1px solid',
                            borderColor: 'divider',
                            p: 2,
                            overflow: 'auto',
                            display: { xs: 'none', lg: 'block' },
                            bgcolor: '#fafafa',
                        }}
                    >
                        <StorageQuotaDisplay />
                        {selectedNote && (
                            <NoteAttachments
                                noteId={selectedNote.id}
                                onError={setError}
                            />
                        )}
                    </Paper>
                </Box>
            </Box>

            {/* Modals */}
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

            <WelcomeModal
                open={modals.isOpen('welcome')}
                onClose={() => {
                    modals.closeModal();
                    onboardingService.completeOnboarding();
                }}
                onCreateSampleNotes={handleCreateSampleNotes}
            />

            <KeyboardShortcutsPanel
                isOpen={modals.isOpen('keyboardShortcuts')}
                onClose={() => modals.closeModal()}
            />

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

            {modals.isOpen('comments') && selectedNote && (
                <CommentThread
                    noteId={selectedNote.id}
                    onClose={() => modals.closeModal()}
                />
            )}

            {modals.isOpen('workspaces') && (
                <WorkspaceManager onClose={() => modals.closeModal()} />
            )}

            {/* Error Snackbar */}
            <Snackbar
                open={!!errorMessage}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
