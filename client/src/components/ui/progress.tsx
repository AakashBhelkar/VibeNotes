import * as React from "react"
import LinearProgress from "@mui/material/LinearProgress"
import Box from "@mui/material/Box"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number
    max?: number
}

/**
 * Progress component using Material UI LinearProgress
 * Maintains the same API as the original shadcn/ui Progress
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({ className, value = 0, max = 100, ...props }, ref) => {
        // Normalize value to percentage
        const normalizedValue = Math.min(Math.max((value / max) * 100, 0), 100)

        return (
            <Box
                ref={ref}
                className={cn("relative w-full", className)}
                {...props}
            >
                <LinearProgress
                    variant="determinate"
                    value={normalizedValue}
                    sx={{
                        height: '0.5rem',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(var(--primary-rgb, 79, 70, 229), 0.2)',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: '9999px',
                            backgroundColor: 'primary.main',
                        },
                    }}
                />
            </Box>
        )
    }
)
Progress.displayName = "Progress"

export { Progress }
