import { useState } from 'react';
import { Template, TemplateService } from '@/services/templateService';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { FileText, Plus, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface TemplateSelectorProps {
    onSelectTemplate: (template: Template) => void;
    onCreateDailyNote: () => void;
}

/**
 * Template selector dialog for choosing note templates
 */
export function TemplateSelector({ onSelectTemplate, onCreateDailyNote }: TemplateSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreatingCustom, setIsCreatingCustom] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customDescription, setCustomDescription] = useState('');
    const [customContent, setCustomContent] = useState('');
    const [customTags, setCustomTags] = useState('');
    const [templates, setTemplates] = useState<Template[]>(TemplateService.getAllTemplates());

    const handleSelectTemplate = (template: Template) => {
        onSelectTemplate(template);
        setIsOpen(false);
    };

    const handleCreateCustomTemplate = () => {
        if (!customName.trim()) return;

        TemplateService.saveCustomTemplate({
            name: customName,
            description: customDescription,
            content: customContent,
            tags: customTags.split(',').map(t => t.trim()).filter(Boolean),
            icon: '📄'
        });

        setTemplates(TemplateService.getAllTemplates());
        setIsCreatingCustom(false);
        setCustomName('');
        setCustomDescription('');
        setCustomContent('');
        setCustomTags('');
    };

    const handleDeleteCustomTemplate = (id: string) => {
        TemplateService.deleteCustomTemplate(id);
        setTemplates(TemplateService.getAllTemplates());
    };

    const handleCreateDailyNote = () => {
        onCreateDailyNote();
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Templates
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Choose a Template</DialogTitle>
                    <DialogDescription>
                        Start with a pre-made template or create your own
                    </DialogDescription>
                </DialogHeader>

                {/* Daily Note Quick Action */}
                <div className="mb-4">
                    <Button
                        onClick={handleCreateDailyNote}
                        className="w-full gap-2"
                        variant="default"
                    >
                        <Calendar className="h-4 w-4" />
                        Create Today's Daily Note
                    </Button>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {templates.map((template) => (
                        <Card
                            key={template.id}
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => handleSelectTemplate(template)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{template.icon}</span>
                                        <CardTitle className="text-base">{template.name}</CardTitle>
                                    </div>
                                    {template.id.startsWith('custom_') && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={(e: React.MouseEvent) => {
                                                e.stopPropagation();
                                                handleDeleteCustomTemplate(template.id);
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                                <CardDescription className="text-xs">
                                    {template.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="flex flex-wrap gap-1">
                                    {template.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Create Custom Template */}
                {!isCreatingCustom ? (
                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setIsCreatingCustom(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Create Custom Template
                    </Button>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Create Custom Template</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="template-name">Template Name</Label>
                                <Input
                                    id="template-name"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    placeholder="My Custom Template"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="template-description">Description</Label>
                                <Input
                                    id="template-description"
                                    value={customDescription}
                                    onChange={(e) => setCustomDescription(e.target.value)}
                                    placeholder="Brief description of this template"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="template-content">Content</Label>
                                <Textarea
                                    id="template-content"
                                    value={customContent}
                                    onChange={(e) => setCustomContent(e.target.value)}
                                    placeholder="Template content (Markdown supported)"
                                    rows={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="template-tags">Tags (comma-separated)</Label>
                                <Input
                                    id="template-tags"
                                    value={customTags}
                                    onChange={(e) => setCustomTags(e.target.value)}
                                    placeholder="tag1, tag2, tag3"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleCreateCustomTemplate}
                                    disabled={!customName.trim()}
                                >
                                    Save Template
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreatingCustom(false);
                                        setCustomName('');
                                        setCustomDescription('');
                                        setCustomContent('');
                                        setCustomTags('');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </DialogContent>
        </Dialog>
    );
}
