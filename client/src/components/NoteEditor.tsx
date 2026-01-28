import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Note } from '@/lib/db';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Save, Eye, Edit2, Copy, Check } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { TagInput } from './TagInput';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { SlashCommandMenu } from './SlashCommandMenu';
import { EDITOR_CONFIG } from '@/config/constants';

interface NoteEditorProps {
    note: Note | null;
    onSave: (id: string, updates: Partial<Note>) => Promise<void>;
    onError?: (message: string) => void;
}

/**
 * Note editor component with auto-save, markdown preview, and word count
 */
export function NoteEditor({ note, onSave, onError }: NoteEditorProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [mode, setMode] = useState<'edit' | 'preview'>('edit');
    const [isCopied, setIsCopied] = useState(false);

    // Slash command state
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
    const [slashFilter, setSlashFilter] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Refs for accessing latest state in event listeners without re-binding
    const contentRef = useRef(content);
    const titleRef = useRef(title);
    const tagsRef = useRef(tags);
    const noteRef = useRef(note);

    // Update refs when state changes
    useEffect(() => {
        contentRef.current = content;
        titleRef.current = title;
        tagsRef.current = tags;
        noteRef.current = note;
    }, [content, title, tags, note]);

    // Debounce content changes for auto-save
    const debouncedContent = useDebounce(content, EDITOR_CONFIG.AUTO_SAVE_DELAY_MS);
    const debouncedTitle = useDebounce(title, EDITOR_CONFIG.AUTO_SAVE_DELAY_MS);
    const debouncedTags = useDebounce(tags, EDITOR_CONFIG.AUTO_SAVE_DELAY_MS);

    // Load note data when note changes
    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setTags(note.tags || []);
            setShowSlashMenu(false);
        } else {
            setTitle('');
            setContent('');
            setTags([]);
        }
    }, [note?.id]);

    const handleSave = useCallback(async (): Promise<void> => {
        const currentNote = noteRef.current;
        if (!currentNote) return;

        setIsSaving(true);
        try {
            await onSave(currentNote.id, {
                title: titleRef.current,
                content: contentRef.current,
                tags: tagsRef.current
            });
            setLastSaved(new Date());
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save note';
            onError?.(errorMessage);
        } finally {
            setIsSaving(false);
        }
    }, [onSave, onError]);

    // Auto-save when debounced values change
    useEffect(() => {
        if (note && (
            debouncedTitle !== note.title ||
            debouncedContent !== note.content ||
            JSON.stringify(debouncedTags) !== JSON.stringify(note.tags)
        )) {
            handleSave();
        }
    }, [debouncedTitle, debouncedContent, debouncedTags, handleSave, note]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch {
            // Clipboard write failed silently
        }
    };

    // Calculate cursor position for slash menu
    const updateSlashMenuPosition = () => {
        if (!textareaRef.current) return;
        const textarea = textareaRef.current;
        const { selectionStart } = textarea;

        // Create a mirror element to calculate position
        const div = document.createElement('div');
        const style = window.getComputedStyle(textarea);

        Array.from(style).forEach(prop => {
            div.style.setProperty(prop, style.getPropertyValue(prop));
        });

        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.whiteSpace = 'pre-wrap';
        div.style.top = '0';
        div.style.left = '0';
        div.style.height = 'auto';
        div.style.width = style.width;

        const content = textarea.value.substring(0, selectionStart);
        div.textContent = content;

        const span = document.createElement('span');
        span.textContent = '|';
        div.appendChild(span);

        document.body.appendChild(div);

        const { offsetLeft, offsetTop } = span;
        const rect = textarea.getBoundingClientRect();

        document.body.removeChild(div);

        setSlashMenuPosition({
            top: rect.top + offsetTop - textarea.scrollTop + 30, // Offset for menu
            left: rect.left + offsetLeft - textarea.scrollLeft
        });
    };

    const insertMarkdown = (prefix: string, suffix: string = '') => {
        if (!textareaRef.current) return;
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
        setContent(newText);

        // Restore cursor / selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    const handleSlashCommand = (commandId: string) => {
        if (!textareaRef.current) return;
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const text = textarea.value;

        // Find the position of the last '/'
        const lastSlash = text.lastIndexOf('/', start);
        if (lastSlash === -1) return;

        let insertion = '';
        let cursorOffset = 0;

        switch (commandId) {
            case 'h1': insertion = '# '; break;
            case 'h2': insertion = '## '; break;
            case 'h3': insertion = '### '; break;
            case 'bullet': insertion = '- '; break;
            case 'number': insertion = '1. '; break;
            case 'check': insertion = '- [ ] '; break;
            case 'code':
                insertion = '```\n\n```';
                cursorOffset = 4;
                break;
            case 'quote': insertion = '> '; break;
            case 'divider': insertion = '---\n'; break;
            case 'table':
                insertion = '| Col 1 | Col 2 |\n|---|---|\n| Val 1 | Val 2 |';
                break;
        }

        // Replace the slash command (e.g., "/hea") with the insertion
        const newText = text.substring(0, lastSlash) + insertion + text.substring(start);
        setContent(newText);
        setShowSlashMenu(false);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = lastSlash + insertion.length - (cursorOffset || 0);
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Keyboard shortcuts
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            insertMarkdown('**', '**');
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            insertMarkdown('*', '*');
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            insertMarkdown('[', '](url)');
            return;
        }

        // Global save shortcut (handled by window listener, but good to have here too)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
            return;
        }

        if (showSlashMenu) {
            if (e.key === 'Escape') {
                setShowSlashMenu(false);
                return;
            }
            // Let the menu handle arrows and enter
            if (['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
                // We don't prevent default here because the menu uses document listener
                // But we need to prevent the textarea from adding newlines on Enter if menu is open
                if (e.key === 'Enter') e.preventDefault();
                return;
            }
            // Update filter
            if (e.key.length === 1) {
                // Allow typing to filter
                setSlashFilter(prev => prev + e.key);
            } else if (e.key === 'Backspace') {
                setSlashFilter(prev => prev.slice(0, -1));
                if (slashFilter.length === 0) {
                    setShowSlashMenu(false);
                }
            }
        } else {
            if (e.key === '/') {
                updateSlashMenuPosition();
                setShowSlashMenu(true);
                setSlashFilter('');
            }
        }
    };

    // Window keyboard shortcuts
    useEffect(() => {
        const handleWindowKeyDown = (e: KeyboardEvent) => {
            // Ctrl+S / Cmd+S to Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            // Ctrl+Shift+C to Copy
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                navigator.clipboard.writeText(contentRef.current)
                    .then(() => {
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                    })
                    .catch(() => { /* Clipboard write failed silently */ });
            }
        };

        window.addEventListener('keydown', handleWindowKeyDown);
        return () => window.removeEventListener('keydown', handleWindowKeyDown);
    }, [handleSave]);

    const wordCount = useMemo(() => {
        return content.trim().split(/\s+/).filter(Boolean).length;
    }, [content]);

    const charCount = content.length;

    if (!note) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a note to edit or create a new one</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            {showSlashMenu && (
                <SlashCommandMenu
                    position={slashMenuPosition}
                    onSelect={handleSlashCommand}
                    onClose={() => setShowSlashMenu(false)}
                    filter={slashFilter}
                />
            )}

            {/* Header */}
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Note title..."
                        className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto py-0"
                    />
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap mr-4">
                            {isSaving && (
                                <span className="flex items-center gap-1">
                                    <Save className="h-4 w-4 animate-pulse" />
                                    Saving...
                                </span>
                            )}
                            {!isSaving && lastSaved && (
                                <span>Saved {lastSaved.toLocaleTimeString()}</span>
                            )}
                        </div>

                        {/* View Mode Toggle & Copy */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="h-7 px-2 text-muted-foreground hover:text-foreground"
                                title="Copy content (Ctrl+Shift+C)"
                            >
                                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>

                            <div className="flex bg-muted rounded-md p-1">
                                <Button
                                    variant={mode === 'edit' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setMode('edit')}
                                    className="h-7 px-2"
                                    aria-label="Edit mode"
                                >
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant={mode === 'preview' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setMode('preview')}
                                    className="h-7 px-2"
                                    aria-label="Preview mode"
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Preview
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <TagInput tags={tags} onChange={setTags} />
            </div>

            {/* Editor / Preview Area */}
            <div className="flex-1 overflow-hidden relative">
                {mode === 'edit' ? (
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Start writing (Markdown supported)... Type '/' for commands"
                        className="w-full h-full p-4 resize-none bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground font-mono leading-relaxed"
                    />
                ) : (
                    <div className="h-full overflow-y-auto p-4 prose prose-sm dark:prose-invert max-w-none">
                        {content ? (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                            >
                                {content}
                            </ReactMarkdown>
                        ) : (
                            <p className="text-muted-foreground italic">Nothing to preview</p>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Status Bar */}
            <div className="h-8 border-t flex items-center justify-end px-4 text-xs text-muted-foreground bg-muted/30 select-none">
                <div className="flex gap-4">
                    <span>{wordCount} words</span>
                    <span>{charCount} characters</span>
                </div>
            </div>
        </div>
    );
}
