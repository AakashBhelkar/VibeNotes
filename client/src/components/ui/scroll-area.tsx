import * as React from "react"
import Box from "@mui/material/Box"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: 'vertical' | 'horizontal' | 'both'
}

/**
 * ScrollArea component using MUI Box with custom scrollbar styling
 * Maintains the same API as the original shadcn/ui ScrollArea
 */
const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
    ({ className, children, orientation = 'vertical', ...props }, ref) => (
        <Box
            ref={ref}
            className={cn("relative", className)}
            sx={{
                overflow: orientation === 'both' ? 'auto' : orientation === 'horizontal' ? 'hidden auto' : 'auto hidden',
                height: '100%',
                width: '100%',
                // Custom scrollbar styles
                '&::-webkit-scrollbar': {
                    width: '10px',
                    height: '10px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(155, 155, 155, 0.5)',
                    borderRadius: '20px',
                    border: '3px solid transparent',
                    backgroundClip: 'content-box',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: 'rgba(155, 155, 155, 0.7)',
                },
                // Firefox scrollbar
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent',
            }}
            {...props}
        >
            {children}
        </Box>
    )
)
ScrollArea.displayName = "ScrollArea"

interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: 'vertical' | 'horizontal'
}

/**
 * ScrollBar component - now a no-op since scrollbar is styled via CSS
 * Kept for API compatibility
 */
const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
    ({ className, orientation = "vertical", ...props }, ref) => (
        // This is now a no-op component since scrollbar styling is handled by CSS
        // Kept for backwards compatibility with existing code
        <div ref={ref} className={cn("hidden", className)} {...props} />
    )
)
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }
