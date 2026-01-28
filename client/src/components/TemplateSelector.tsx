import { useState } from 'react';
import { Template, TemplateService, BUILT_IN_TEMPLATES } from '@/services/templateService';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { FileText, Plus, Trash2, Calendar, Edit2, Eye, X, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface TemplateSelectorProps {
    onSelectTemplate: (template: Template) => void;
    onCreateDailyNote: () => void;
}

// Available icons for custom templates
const TEMPLATE_ICONS = ['📄', '📝', '📋', '📌', '📎', '✏️', '🗒️', '📓', '📔', '📕', '📗', '📘'];

/**
 * Template selector dialog with preview and editing capabilities
 */
export function TemplateSelector({ onSelectTemplate, onCreateDailyNote }: TemplateSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>('builtin');
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    // Custom template form state
    const [isCreatingCustom, setIsCreatingCustom] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
    const [customName, setCustomName] = useState('');
    const [customDescription, setCustomDescription] = useState('');
    const [customContent, setCustomContent] = useState('');
    const [customTags, setCustomTags] = useState('');
    const [customIcon, setCustomIcon] = useState('📄');

    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

    const [customTemplates, setCustomTemplates] = useState<Template[]>(TemplateService.getCustomTemplates());

    const handleSelectTemplate = (template: Template) => {
        onSelectTemplate(template);
        setIsOpen(false);
        setPreviewTemplate(null);
    };

    const handlePreviewTemplate = (template: Template, e: React.MouseEvent) => {
        e.stopPropagation();
        setPreviewTemplate(template);
    };

    const resetForm = () => {
        setIsCreatingCustom(false);
        setIsEditing(false);
        setEditingTemplateId(null);
        setCustomName('');
        setCustomDescription('');
        setCustomContent('');
        setCustomTags('');
        setCustomIcon('📄');
    };

    const handleCreateCustomTemplate = () => {
        if (!customName.trim()) return;

        TemplateService.saveCustomTemplate({
            name: customName,
            description: customDescription,
            content: customContent,
            tags: customTags.split(',').map(t => t.trim()).filter(Boolean),
            icon: customIcon
        });

        setCustomTemplates(TemplateService.getCustomTemplates());
        resetForm();
    };

    const handleUpdateCustomTemplate = () => {
        if (!customName.trim() || !editingTemplateId) return;

        TemplateService.updateCustomTemplate(editingTemplateId, {
            name: customName,
            description: customDescription,
            content: customContent,
            tags: customTags.split(',').map(t => t.trim()).filter(Boolean),
            icon: customIcon
        });

        setCustomTemplates(TemplateService.getCustomTemplates());
        resetForm();
    };

    const handleStartEdit = (template: Template, e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        setIsCreatingCustom(true);
        setEditingTemplateId(template.id);
        setCustomName(template.name);
        setCustomDescription(template.description);
        setCustomContent(template.content);
        setCustomTags(template.tags.join(', '));
        setCustomIcon(template.icon || '📄');
        setActiveTab('custom');
    };

    const handleDeleteClick = (template: Template, e: React.MouseEvent) => {
        e.stopPropagation();
        setTemplateToDelete(template);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (templateToDelete) {
            TemplateService.deleteCustomTemplate(templateToDelete.id);
            setCustomTemplates(TemplateService.getCustomTemplates());
            if (previewTemplate?.id === templateToDelete.id) {
                setPreviewTemplate(null);
            }
        }
        setDeleteConfirmOpen(false);
        setTemplateToDelete(null);
    };

    const handleCreateDailyNote = () => {
        onCreateDailyNote();
        setIsOpen(false);
    };

    const renderTemplateCard = (template: Template, isCustom: boolean = false) => (
        <Card
            key={template.id}
            className={`cursor-pointer hover:border-primary transition-all ${
                previewTemplate?.id === template.id ? 'border-primary ring-2 ring-primary/20' : ''
            }`}
            onClick={() => handleSelectTemplate(template)}
        >
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{template.icon}</span>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => handlePreviewTemplate(template, e)}
                            title="Preview"
                        >
                            <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {isCustom && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => handleStartEdit(template, e)}
                                    title="Edit"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={(e) => handleDeleteClick(template, e)}
                                    title="Delete"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                <CardDescription className="text-xs line-clamp-2">
                    {template.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
                <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                    {template.tags.length > 3 && (
                        <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                            +{template.tags.length - 3}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const renderForm = () => (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">
                    {isEditing ? 'Edit Template' : 'Create Custom Template'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Icon Picker */}
                <div className="space-y-2">
                    <Label>Icon</Label>
                    <div className="flex flex-wrap gap-2">
                        {TEMPLATE_ICONS.map((icon) => (
                            <button
                                key={icon}
                                type="button"
                                className={`text-2xl p-2 rounded-md transition-colors ${
                                    customIcon === icon
                                        ? 'bg-primary/20 ring-2 ring-primary'
                                        : 'hover:bg-muted'
                                }`}
                                onClick={() => setCustomIcon(icon)}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>

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
                        rows={8}
                        className="font-mono text-sm"
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
                        onClick={isEditing ? handleUpdateCustomTemplate : handleCreateCustomTemplate}
                        disabled={!customName.trim()}
                        className="gap-2"
                    >
                        <Check className="h-4 w-4" />
                        {isEditing ? 'Update Template' : 'Save Template'}
                    </Button>
                    <Button variant="outline" onClick={resetForm} className="gap-2">
                        <X className="h-4 w-4" />
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) {
                    setPreviewTemplate(null);
                    resetForm();
                }
            }}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Templates
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
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

                    <div className="flex gap-4 flex-1 min-h-0">
                        {/* Left: Templates List */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'builtin' | 'custom')} className="flex-1 flex flex-col min-h-0">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="builtin">
                                        Built-in ({BUILT_IN_TEMPLATES.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="custom">
                                        Custom ({customTemplates.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="builtin" className="flex-1 overflow-y-auto mt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {BUILT_IN_TEMPLATES.map((template) => renderTemplateCard(template))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="custom" className="flex-1 overflow-y-auto mt-0">
                                    {isCreatingCustom ? (
                                        renderForm()
                                    ) : (
                                        <>
                                            {customTemplates.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                    {customTemplates.map((template) => renderTemplateCard(template, true))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                    <p>No custom templates yet</p>
                                                    <p className="text-sm">Create your first custom template below</p>
                                                </div>
                                            )}
                                            <Button
                                                variant="outline"
                                                className="w-full gap-2"
                                                onClick={() => setIsCreatingCustom(true)}
                                            >
                                                <Plus className="h-4 w-4" />
                                                Create Custom Template
                                            </Button>
                                        </>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Right: Preview Panel */}
                        {previewTemplate && (
                            <div className="w-80 border-l pl-4 flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <span className="text-xl">{previewTemplate.icon}</span>
                                        {previewTemplate.name}
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setPreviewTemplate(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {previewTemplate.description}
                                </p>
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {previewTemplate.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex-1 overflow-y-auto bg-muted/50 rounded-md p-3">
                                    <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">
                                        {previewTemplate.content || '(Empty template)'}
                                    </pre>
                                </div>
                                <Button
                                    className="mt-3 w-full"
                                    onClick={() => handleSelectTemplate(previewTemplate)}
                                >
                                    Use This Template
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
