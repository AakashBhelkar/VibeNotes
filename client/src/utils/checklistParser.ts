/**
 * Checklist parser utility
 * Parses markdown content to extract checklist items and calculate progress
 */

export interface ChecklistProgress {
    total: number;
    checked: number;
    percentage: number;
}

/**
 * Parse markdown content to find checklist items and calculate progress
 * Supports both `- [ ]` and `- [x]` formats
 * @param content - Markdown content to parse
 * @returns Progress object with total, checked count, and percentage
 */
export function parseChecklistProgress(content: string): ChecklistProgress {
    // Match unchecked items: - [ ] or * [ ]
    const uncheckedPattern = /^[\s]*[-*]\s+\[\s\]/gm;
    // Match checked items: - [x] or - [X] or * [x] or * [X]
    const checkedPattern = /^[\s]*[-*]\s+\[[xX]\]/gm;

    const uncheckedMatches = content.match(uncheckedPattern) || [];
    const checkedMatches = content.match(checkedPattern) || [];

    const unchecked = uncheckedMatches.length;
    const checked = checkedMatches.length;
    const total = unchecked + checked;

    return {
        total,
        checked,
        percentage: total > 0 ? Math.round((checked / total) * 100) : 0,
    };
}

/**
 * Check if content has any checklist items
 * @param content - Markdown content to check
 * @returns true if content contains checklist items
 */
export function hasChecklist(content: string): boolean {
    const checklistPattern = /^[\s]*[-*]\s+\[[\sxX]\]/m;
    return checklistPattern.test(content);
}

/**
 * Toggle a checkbox in the content at the specified line
 * @param content - Markdown content
 * @param lineNumber - 0-based line number to toggle
 * @returns Updated content with toggled checkbox, or original if no checkbox found
 */
export function toggleCheckbox(content: string, lineNumber: number): string {
    const lines = content.split('\n');

    if (lineNumber < 0 || lineNumber >= lines.length) {
        return content;
    }

    const line = lines[lineNumber];

    // Check if line has an unchecked checkbox
    if (/^[\s]*[-*]\s+\[\s\]/.test(line)) {
        lines[lineNumber] = line.replace(/\[\s\]/, '[x]');
    }
    // Check if line has a checked checkbox
    else if (/^[\s]*[-*]\s+\[[xX]\]/.test(line)) {
        lines[lineNumber] = line.replace(/\[[xX]\]/, '[ ]');
    }

    return lines.join('\n');
}

/**
 * Get a summary string for checklist progress
 * @param progress - Progress object
 * @returns Summary string like "3/5 complete" or empty string if no checklist
 */
export function getProgressSummary(progress: ChecklistProgress): string {
    if (progress.total === 0) {
        return '';
    }
    return `${progress.checked}/${progress.total}`;
}

/**
 * Get all checklist items from content with their line numbers
 * @param content - Markdown content
 * @returns Array of checklist items with their details
 */
export interface ChecklistItem {
    lineNumber: number;
    text: string;
    isChecked: boolean;
}

export function getChecklistItems(content: string): ChecklistItem[] {
    const lines = content.split('\n');
    const items: ChecklistItem[] = [];

    lines.forEach((line, index) => {
        const uncheckedMatch = line.match(/^[\s]*[-*]\s+\[\s\]\s*(.*)$/);
        const checkedMatch = line.match(/^[\s]*[-*]\s+\[[xX]\]\s*(.*)$/);

        if (uncheckedMatch) {
            items.push({
                lineNumber: index,
                text: uncheckedMatch[1].trim(),
                isChecked: false,
            });
        } else if (checkedMatch) {
            items.push({
                lineNumber: index,
                text: checkedMatch[1].trim(),
                isChecked: true,
            });
        }
    });

    return items;
}
