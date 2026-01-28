import { useEffect, useRef, useState, useMemo } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Note } from '@/lib/db';

interface GraphNode {
    id: string;
    title: string;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    size: number;
    tags: string[];
}

interface GraphLink {
    source: string;
    target: string;
    weight: number;
}

interface GraphViewProps {
    notes: Note[];
    onSelectNote: (noteId: string) => void;
    onClose: () => void;
}

/**
 * Graph view visualization showing note connections
 * Notes are connected by shared tags
 */
export function GraphView({ notes, onSelectNote, onClose }: GraphViewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const nodesRef = useRef<GraphNode[]>([]);

    // Build graph data
    const { nodes, links } = useMemo(() => {
        const graphNodes: GraphNode[] = notes
            .filter((n) => !n.deletedAt && !n.isArchived)
            .map((note) => ({
                id: note.id,
                title: note.title || 'Untitled',
                size: Math.min(20, Math.max(8, Math.sqrt(note.content.length) / 5)),
                tags: note.tags,
            }));

        // Build links based on shared tags
        const graphLinks: GraphLink[] = [];
        for (let i = 0; i < graphNodes.length; i++) {
            for (let j = i + 1; j < graphNodes.length; j++) {
                const sharedTags = graphNodes[i].tags.filter((tag) =>
                    graphNodes[j].tags.includes(tag)
                );
                if (sharedTags.length > 0) {
                    graphLinks.push({
                        source: graphNodes[i].id,
                        target: graphNodes[j].id,
                        weight: sharedTags.length,
                    });
                }
            }
        }

        return { nodes: graphNodes, links: graphLinks };
    }, [notes]);

    // Initialize node positions
    useEffect(() => {
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;

        nodesRef.current = nodes.map((node) => ({
            ...node,
            x: centerX + (Math.random() - 0.5) * 400,
            y: centerY + (Math.random() - 0.5) * 400,
            vx: 0,
            vy: 0,
        }));
    }, [nodes, dimensions]);

    // Update dimensions on resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Simple force simulation
    useEffect(() => {
        let animationId: number;
        const nodeMap = new Map(nodesRef.current.map((n) => [n.id, n]));

        const simulate = () => {
            const currentNodes = nodesRef.current;
            if (currentNodes.length === 0) return;

            // Apply forces
            for (const node of currentNodes) {
                // Center gravity
                const centerX = dimensions.width / 2;
                const centerY = dimensions.height / 2;
                node.vx = (node.vx || 0) + (centerX - (node.x || 0)) * 0.001;
                node.vy = (node.vy || 0) + (centerY - (node.y || 0)) * 0.001;

                // Repulsion between nodes
                for (const other of currentNodes) {
                    if (node.id === other.id) continue;
                    const dx = (node.x || 0) - (other.x || 0);
                    const dy = (node.y || 0) - (other.y || 0);
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = 500 / (dist * dist);
                    node.vx = (node.vx || 0) + (dx / dist) * force;
                    node.vy = (node.vy || 0) + (dy / dist) * force;
                }
            }

            // Apply link forces
            for (const link of links) {
                const source = nodeMap.get(link.source);
                const target = nodeMap.get(link.target);
                if (!source || !target) continue;

                const dx = (target.x || 0) - (source.x || 0);
                const dy = (target.y || 0) - (source.y || 0);
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = (dist - 100) * 0.01 * link.weight;

                source.vx = (source.vx || 0) + (dx / dist) * force;
                source.vy = (source.vy || 0) + (dy / dist) * force;
                target.vx = (target.vx || 0) - (dx / dist) * force;
                target.vy = (target.vy || 0) - (dy / dist) * force;
            }

            // Update positions with damping
            for (const node of currentNodes) {
                node.vx = (node.vx || 0) * 0.9;
                node.vy = (node.vy || 0) * 0.9;
                node.x = (node.x || 0) + (node.vx || 0);
                node.y = (node.y || 0) + (node.vy || 0);

                // Keep nodes in bounds
                node.x = Math.max(50, Math.min(dimensions.width - 50, node.x || 0));
                node.y = Math.max(50, Math.min(dimensions.height - 50, node.y || 0));
            }

            // Render
            render();
            animationId = requestAnimationFrame(simulate);
        };

        simulate();
        return () => cancelAnimationFrame(animationId);
    }, [links, dimensions]);

    const render = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const currentNodes = nodesRef.current;
        const nodeMap = new Map(currentNodes.map((n) => [n.id, n]));

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply transform
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(zoom, zoom);

        // Draw links
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.lineWidth = 1 / zoom;
        for (const link of links) {
            const source = nodeMap.get(link.source);
            const target = nodeMap.get(link.target);
            if (!source || !target) continue;

            ctx.beginPath();
            ctx.moveTo(source.x || 0, source.y || 0);
            ctx.lineTo(target.x || 0, target.y || 0);
            ctx.stroke();
        }

        // Draw nodes
        for (const node of currentNodes) {
            const isHovered = hoveredNode?.id === node.id;

            // Node circle
            ctx.beginPath();
            ctx.arc(node.x || 0, node.y || 0, node.size, 0, Math.PI * 2);
            ctx.fillStyle = isHovered ? '#3B82F6' : '#6366F1';
            ctx.fill();

            if (isHovered) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2 / zoom;
                ctx.stroke();
            }

            // Node label
            if (zoom > 0.5) {
                ctx.fillStyle = isHovered ? '#fff' : '#888';
                ctx.font = `${12 / zoom}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText(
                    node.title.length > 20 ? node.title.slice(0, 20) + '...' : node.title,
                    node.x || 0,
                    (node.y || 0) + node.size + 15 / zoom
                );
            }
        }

        ctx.restore();
    };

    // Mouse handlers
    const handleMouseMove = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - offset.x) / zoom;
        const y = (e.clientY - rect.top - offset.y) / zoom;

        if (isDragging) {
            setOffset({
                x: offset.x + e.movementX,
                y: offset.y + e.movementY,
            });
            return;
        }

        // Check for hover
        let found = false;
        for (const node of nodesRef.current) {
            const dx = (node.x || 0) - x;
            const dy = (node.y || 0) - y;
            if (Math.sqrt(dx * dx + dy * dy) < node.size) {
                setHoveredNode(node);
                canvas.style.cursor = 'pointer';
                found = true;
                break;
            }
        }

        if (!found) {
            setHoveredNode(null);
            canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
        }
    };

    const handleMouseDown = () => {
        if (hoveredNode) {
            onSelectNote(hoveredNode.id);
            onClose();
        } else {
            setIsDragging(true);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(Math.max(0.1, Math.min(3, zoom * delta)));
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/95 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Graph View</h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setZoom(zoom * 1.2)}>
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setZoom(zoom * 0.8)}>
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            setZoom(1);
                            setOffset({ x: 0, y: 0 });
                        }}
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Canvas */}
            <div ref={containerRef} className="flex-1 overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                />
            </div>

            {/* Legend */}
            <div className="p-4 border-t text-sm text-muted-foreground">
                <p>
                    {nodes.length} notes, {links.length} connections (via shared tags)
                </p>
                <p>Click a node to open the note. Drag to pan, scroll to zoom.</p>
            </div>

            {/* Hover tooltip */}
            {hoveredNode && (
                <div className="absolute bottom-20 left-4 bg-popover border rounded-lg p-3 shadow-lg max-w-xs">
                    <h3 className="font-medium truncate">{hoveredNode.title}</h3>
                    {hoveredNode.tags.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                            Tags: {hoveredNode.tags.join(', ')}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
