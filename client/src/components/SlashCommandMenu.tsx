import { useEffect, useRef, useState } from 'react';
import {
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    CheckSquare,
    Code,
    Quote,
    Minus,
    Table
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Command {
    id: string;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const COMMANDS: Command[] = [
    { id: 'h1', label: 'Heading 1', icon: <Heading1 className="h-4 w-4" />, description: 'Big section heading' },
    { id: 'h2', label: 'Heading 2', icon: <Heading2 className="h-4 w-4" />, description: 'Medium section heading' },
    { id: 'h3', label: 'Heading 3', icon: <Heading3 className="h-4 w-4" />, description: 'Small section heading' },
    { id: 'bullet', label: 'Bullet List', icon: <List className="h-4 w-4" />, description: 'Create a simple bulleted list' },
    { id: 'number', label: 'Numbered List', icon: <ListOrdered className="h-4 w-4" />, description: 'Create a numbered list' },
    { id: 'check', label: 'To-do List', icon: <CheckSquare className="h-4 w-4" />, description: 'Track tasks with a to-do list' },
    { id: 'code', label: 'Code Block', icon: <Code className="h-4 w-4" />, description: 'Capture a code snippet' },
    { id: 'quote', label: 'Quote', icon: <Quote className="h-4 w-4" />, description: 'Capture a quote' },
    { id: 'divider', label: 'Divider', icon: <Minus className="h-4 w-4" />, description: 'Visually divide blocks' },
    { id: 'table', label: 'Table', icon: <Table className="h-4 w-4" />, description: 'Insert a simple table' },
];

interface SlashCommandMenuProps {
    position: { top: number; left: number };
    onSelect: (commandId: string) => void;
    onClose: () => void;
    filter: string;
}

export function SlashCommandMenu({ position, onSelect, onClose, filter }: SlashCommandMenuProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);

    const filteredCommands = COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(filter.toLowerCase()) ||
        cmd.description.toLowerCase().includes(filter.toLowerCase())
    );

    useEffect(() => {
        setSelectedIndex(0);
    }, [filter]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (filteredCommands.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                    break;
                case 'Enter':
                    e.preventDefault();
                    onSelect(filteredCommands[selectedIndex].id);
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [filteredCommands, selectedIndex, onSelect, onClose]);

    // Close if clicked outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    if (filteredCommands.length === 0) return null;

    return (
        <div
            ref={menuRef}
            className="fixed z-50 w-72 bg-popover rounded-md border shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{ top: position.top, left: position.left }}
        >
            <div className="p-1 max-h-[300px] overflow-y-auto">
                {filteredCommands.map((command, index) => (
                    <button
                        key={command.id}
                        className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm text-left transition-colors",
                            index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => onSelect(command.id)}
                        onMouseEnter={() => setSelectedIndex(index)}
                    >
                        <div className="flex items-center justify-center w-5 h-5 border rounded bg-background text-muted-foreground">
                            {command.icon}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-medium truncate">{command.label}</span>
                            <span className="text-xs text-muted-foreground truncate">{command.description}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
