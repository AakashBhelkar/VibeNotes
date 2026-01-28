import { useState } from 'react';
import { Note } from '@/lib/db';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Download, FileText, FileJson, Printer, Upload } from 'lucide-react';
import {
    exportNoteAsMarkdown,
    exportNotesAsMarkdown,
    exportNotesAsJSON,
    exportNoteAsPDF
} from '@/services/exportService';

interface ExportMenuProps {
    /** Currently selected note */
    note: Note | null;
    /** All notes for bulk export */
    notes: Note[];
    /** Callback when notes are imported */
    onImport?: (notes: Partial<Note>[]) => Promise<void>;
    /** Callback for errors */
    onError?: (message: string) => void;
}

/**
 * Export menu component
 * Provides options to export notes in various formats
 */
export function ExportMenu({ note, notes, onImport, onError }: ExportMenuProps) {
    const [isImporting, setIsImporting] = useState(false);

    const handleExportCurrentMarkdown = () => {
        try {
            if (!note) {
                onError?.('No note selected');
                return;
            }
            exportNoteAsMarkdown(note);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Export failed';
            onError?.(message);
        }
    };

    const handleExportAllMarkdown = () => {
        try {
            if (notes.length === 0) {
                onError?.('No notes to export');
                return;
            }
            exportNotesAsMarkdown(notes);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Export failed';
            onError?.(message);
        }
    };

    const handleExportJSON = () => {
        try {
            if (notes.length === 0) {
                onError?.('No notes to export');
                return;
            }
            exportNotesAsJSON(notes);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Export failed';
            onError?.(message);
        }
    };

    const handleExportPDF = () => {
        try {
            if (!note) {
                onError?.('No note selected');
                return;
            }
            exportNoteAsPDF(note);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Export failed';
            onError?.(message);
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const { importNotesFromJSON } = await import('@/services/exportService');
            const importedNotes = await importNotesFromJSON(file);

            if (onImport) {
                await onImport(importedNotes);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Import failed';
            onError?.(message);
        } finally {
            setIsImporting(false);
            // Reset file input
            event.target.value = '';
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Export options"
                    title="Export & Import"
                >
                    <Download className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-semibold">Export Current Note</div>
                <DropdownMenuItem
                    onClick={handleExportCurrentMarkdown}
                    disabled={!note}
                >
                    <FileText className="mr-2 h-4 w-4" />
                    Export as Markdown
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleExportPDF}
                    disabled={!note}
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Export as PDF
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <div className="px-2 py-1.5 text-sm font-semibold">Export All Notes</div>
                <DropdownMenuItem
                    onClick={handleExportAllMarkdown}
                    disabled={notes.length === 0}
                >
                    <FileText className="mr-2 h-4 w-4" />
                    All Notes as Markdown
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleExportJSON}
                    disabled={notes.length === 0}
                >
                    <FileJson className="mr-2 h-4 w-4" />
                    Backup as JSON
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <label className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        {isImporting ? 'Importing...' : 'Import from JSON'}
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            disabled={isImporting}
                            className="hidden"
                        />
                    </label>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
