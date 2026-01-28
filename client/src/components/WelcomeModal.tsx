import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Sparkles, FileText, Search, Tag, Zap, Shield } from 'lucide-react';

interface WelcomeModalProps {
    open: boolean;
    onClose: () => void;
    onCreateSampleNotes: () => void;
}

export function WelcomeModal({ open, onClose, onCreateSampleNotes }: WelcomeModalProps) {
    const [step, setStep] = useState(0);

    const features = [
        {
            icon: FileText,
            title: 'Offline First',
            description: 'All your notes are stored locally and sync when online. Work anywhere, anytime.',
        },
        {
            icon: Search,
            title: 'Powerful Search',
            description: 'Find anything instantly with full-text search and multi-tag filtering.',
        },
        {
            icon: Tag,
            title: 'Smart Organization',
            description: 'Use tags, templates, and pinning to keep your notes organized.',
        },
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Markdown editor with slash commands, auto-save, and keyboard shortcuts.',
        },
        {
            icon: Shield,
            title: 'Privacy Focused',
            description: 'Your data stays yours. No tracking, no ads, just secure note-taking.',
        },
    ];

    const handleNext = () => {
        if (step < features.length) {
            setStep(step + 1);
        }
    };

    const handlePrevious = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleFinish = () => {
        onCreateSampleNotes();
        onClose();
    };

    const handleSkip = () => {
        onClose();
    };

    useEffect(() => {
        if (open) {
            setStep(0);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                {step === 0 ? (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-6 w-6 text-primary" />
                                <DialogTitle className="text-2xl">Welcome to VibeNotes!</DialogTitle>
                            </div>
                            <DialogDescription className="text-base">
                                Your offline-first, privacy-focused note-taking app. Let's get you started!
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-6">
                            <div className="grid gap-4">
                                {features.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div key={index} className="flex gap-4 items-start">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-1">{feature.title}</h4>
                                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <DialogFooter className="flex justify-between sm:justify-between">
                            <Button variant="ghost" onClick={handleSkip}>
                                Skip
                            </Button>
                            <Button onClick={handleFinish}>
                                Get Started with Sample Notes
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>{features[step - 1].title}</DialogTitle>
                            <DialogDescription>{features[step - 1].description}</DialogDescription>
                        </DialogHeader>

                        <div className="py-8 flex justify-center">
                            {(() => {
                                const Icon = features[step - 1].icon;
                                return <Icon className="h-24 w-24 text-primary" />;
                            })()}
                        </div>

                        <DialogFooter className="flex justify-between sm:justify-between">
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={handleSkip}>
                                    Skip Tour
                                </Button>
                                {step > 1 && (
                                    <Button variant="outline" onClick={handlePrevious}>
                                        Previous
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-2 items-center">
                                <span className="text-sm text-muted-foreground">
                                    {step} / {features.length}
                                </span>
                                {step < features.length ? (
                                    <Button onClick={handleNext}>Next</Button>
                                ) : (
                                    <Button onClick={handleFinish}>Finish</Button>
                                )}
                            </div>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
