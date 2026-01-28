import { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [isInputVisible, setIsInputVisible] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Escape') {
            setIsInputVisible(false);
            setInputValue('');
        }
    };

    const addTag = () => {
        const trimmedInput = inputValue.trim();
        if (trimmedInput && !tags.includes(trimmedInput)) {
            onChange([...tags, trimmedInput]);
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="flex flex-wrap gap-2 items-center">
            {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                        onClick={() => removeTag(tag)}
                        className="hover:bg-secondary-foreground/20 rounded-full p-0.5 focus:outline-none"
                        aria-label={`Remove ${tag} tag`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}

            {isInputVisible ? (
                <div className="flex items-center gap-2">
                    <Input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                        onBlur={addTag}
                        className="h-7 w-32 text-xs"
                        placeholder="Add tag..."
                        autoFocus
                    />
                </div>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setIsInputVisible(true)}
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Tag
                </Button>
            )}
        </div>
    );
}
