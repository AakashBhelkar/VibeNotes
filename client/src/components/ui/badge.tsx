import * as React from "react"
import Chip from "@mui/material/Chip"
import { cn } from "@/lib/utils"

// Keep badgeVariants for backwards compatibility
export const badgeVariants = (options?: {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | null
    className?: string
}) => {
    const { variant = 'default', className = '' } = options || {}

    const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"

    const variantClasses: Record<string, string> = {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "text-foreground border-input",
    }

    return cn(baseClasses, variantClasses[variant || 'default'], className)
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | null
}

/**
 * Badge component using Material UI Chip
 * Maintains the same API as the original shadcn/ui Badge
 */
function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
    const getMuiColor = (): 'primary' | 'secondary' | 'error' | 'default' => {
        switch (variant) {
            case 'default':
                return 'primary'
            case 'secondary':
                return 'secondary'
            case 'destructive':
                return 'error'
            case 'outline':
                return 'default'
            default:
                return 'primary'
        }
    }

    const getMuiVariant = (): 'filled' | 'outlined' => {
        return variant === 'outline' ? 'outlined' : 'filled'
    }

    return (
        <Chip
            label={children}
            color={getMuiColor()}
            variant={getMuiVariant()}
            size="small"
            className={cn(className)}
            sx={{
                height: 'auto',
                borderRadius: '9999px',
                padding: '0.125rem 0',
                '& .MuiChip-label': {
                    padding: '0 0.625rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                },
            }}
            {...props as React.ComponentProps<typeof Chip>}
        />
    )
}

export { Badge }
