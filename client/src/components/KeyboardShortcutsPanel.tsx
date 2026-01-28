import { useEffect } from 'react';
import { Button } from './ui/button';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ShortcutGroup {
    title: string;
    shortcuts: { keys: string[]; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
    {
        title: 'General',
        shortcuts: [
            { keys: ['Ctrl/Cmd', '?'], description: 'Show keyboard shortcuts' },
            { keys: ['Ctrl/Cmd', 'S'], description: 'Save current note' },
            { keys: ['Ctrl/Cmd', 'Shift', 'C'], description: 'Copy note content' },
            { keys: ['Ctrl/Cmd', 'Shift', 'F'], description: 'Toggle distraction-free mode' },
            { keys: ['Esc'], description: 'Exit distraction-free mode' },
        ],
    },
    {
        title: 'Formatting',
        shortcuts: [
            { keys: ['Ctrl/Cmd', 'B'], description: 'Bold text' },
            { keys: ['Ctrl/Cmd', 'I'], description: 'Italic text' },
            { keys: ['Ctrl/Cmd', 'K'], description: 'Insert link' },
            { keys: ['/'], description: 'Open slash command menu' },
        ],
    },
    {
        title: 'Navigation',
        shortcuts: [
            { keys: ['Tab'], description: 'Navigate between elements' },
        ],
    },
    {
        title: 'Slash Commands',
        shortcuts: [
            { keys: ['/h1'], description: 'Heading 1' },
            { keys: ['/h2'], description: 'Heading 2' },
            { keys: ['/h3'], description: 'Heading 3' },
            { keys: ['/bullet'], description: 'Bullet list' },
            { keys: ['/number'], description: 'Numbered list' },
            { keys: ['/check'], description: 'Checkbox' },
            { keys: ['/code'], description: 'Code block' },
            { keys: ['/quote'], description: 'Blockquote' },
            { keys: ['/table'], description: 'Table' },
            { keys: ['/divider'], description: 'Horizontal divider' },
        ],
    },
];

export function KeyboardShortcutsPanel({ isOpen, onClose }: KeyboardShortcutsPanelProps) {
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[80vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close keyboard shortcuts panel">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1 min-h-0">
                    <div className="grid gap-6">
                        {SHORTCUT_GROUPS.map((group) => (
                            <div key={group.title}>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                                    {group.title}
                                </h3>
                                <div className="space-y-2">
                                    {group.shortcuts.map((shortcut, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/50"
                                        >
                                            <span className="text-sm">{shortcut.description}</span>
                                            <div className="flex items-center gap-1">
                                                {shortcut.keys.map((key, keyIndex) => (
                                                    <span key={keyIndex}>
                                                        <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border">
                                                            {key}
                                                        </kbd>
                                                        {keyIndex < shortcut.keys.length - 1 && (
                                                            <span className="mx-1 text-muted-foreground">+</span>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-muted/30">
                    <p className="text-xs text-muted-foreground text-center">
                        Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">Esc</kbd> to close
                    </p>
                </div>
            </div>
        </div>
    );
}
