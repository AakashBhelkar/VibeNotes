import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Zap, WifiOff, RefreshCw, Shield, Search } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            {/* Navigation */}
            <nav className="border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="h-6 w-6 text-primary fill-primary" />
                        <span className="text-xl font-bold">VibeNotes</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <Link to="/login">
                            <Button variant="ghost">Log in</Button>
                        </Link>
                        <Link to="/signup">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 lg:py-32">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Capture Your Thoughts,<br /> Anytime, Anywhere.
                    </h1>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        The offline-first note-taking app that syncs when you're ready.
                        Fast, secure, and designed for focus.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/signup">
                            <Button size="lg" className="h-12 px-8 text-lg">
                                Start Writing for Free
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                                Live Demo
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-secondary/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why VibeNotes?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Built with modern web technologies to provide a seamless, native-like experience directly in your browser.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<WifiOff className="h-10 w-10 text-primary" />}
                            title="Offline First"
                            description="Keep working even without internet. Your notes are saved locally and synced automatically when you reconnect."
                        />
                        <FeatureCard
                            icon={<RefreshCw className="h-10 w-10 text-primary" />}
                            title="Instant Sync"
                            description="Seamless bidirectional synchronization ensures your notes are always up to date across all your devices."
                        />
                        <FeatureCard
                            icon={<Shield className="h-10 w-10 text-primary" />}
                            title="Secure & Private"
                            description="Your data is yours. We use industry-standard encryption and secure authentication to keep your thoughts safe."
                        />
                        <FeatureCard
                            icon={<Zap className="h-10 w-10 text-primary" />}
                            title="Lightning Fast"
                            description="Optimized for performance with local database storage. No loading spinners, just instant access."
                        />
                        <FeatureCard
                            icon={<Search className="h-10 w-10 text-primary" />}
                            title="Smart Search"
                            description="Find any note instantly with our powerful real-time search and tagging system."
                        />
                        <FeatureCard
                            icon={<CheckCircle2 className="h-10 w-10 text-primary" />}
                            title="Auto-Save"
                            description="Never lose your work again. Changes are saved automatically as you type."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get organized?</h2>
                            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                                Join thousands of users who trust VibeNotes for their daily note-taking needs.
                            </p>
                            <Link to="/signup">
                                <Button size="lg" variant="secondary" className="h-12 px-8 text-lg font-semibold">
                                    Create Free Account
                                </Button>
                            </Link>
                        </div>

                        {/* Decorative circles */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-12 bg-background">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <span className="font-bold">VibeNotes</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © 2025 VibeNotes. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-foreground">Privacy</a>
                        <a href="#" className="hover:text-foreground">Terms</a>
                        <a href="#" className="hover:text-foreground">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="border-none shadow-lg bg-card/50 hover:bg-card transition-colors">
            <CardHeader>
                <div className="mb-4">{icon}</div>
                <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-base">
                    {description}
                </CardDescription>
            </CardContent>
        </Card>
    );
}
