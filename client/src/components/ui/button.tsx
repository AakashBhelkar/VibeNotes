import * as React from "react"
import MuiButton from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import { cn } from "@/lib/utils"

// Keep buttonVariants export for backwards compatibility with components that use it directly
// (e.g., calendar.tsx, alert-dialog.tsx)
export const buttonVariants = (options?: {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | null
    size?: 'default' | 'sm' | 'lg' | 'icon' | null
    className?: string
}) => {
    const { variant = 'default', size = 'default', className = '' } = options || {}

    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"

    const variantClasses: Record<string, string> = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
    }

    const sizeClasses: Record<string, string> = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
    }

    return cn(
        baseClasses,
        variantClasses[variant || 'default'],
        sizeClasses[size || 'default'],
        className
    )
}

export interface ButtonProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | null
    size?: 'default' | 'sm' | 'lg' | 'icon' | null
    asChild?: boolean
}

/**
 * Button component using Material UI
 * Maintains the same API as the original shadcn/ui Button
 * Supports primary, secondary, ghost, destructive variants
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', asChild = false, children, disabled, ...props }, ref) => {
        // Map our variants to MUI props
        const getMuiVariant = (): 'contained' | 'outlined' | 'text' => {
            switch (variant) {
                case 'default':
                case 'destructive':
                case 'secondary':
                    return 'contained'
                case 'outline':
                    return 'outlined'
                case 'ghost':
                case 'link':
                    return 'text'
                default:
                    return 'contained'
            }
        }

        const getMuiColor = (): 'primary' | 'secondary' | 'error' | 'inherit' => {
            switch (variant) {
                case 'default':
                    return 'primary'
                case 'destructive':
                    return 'error'
                case 'secondary':
                    return 'secondary'
                case 'outline':
                case 'ghost':
                    return 'inherit'
                case 'link':
                    return 'primary'
                default:
                    return 'primary'
            }
        }

        const getMuiSize = (): 'small' | 'medium' | 'large' => {
            switch (size) {
                case 'sm':
                    return 'small'
                case 'lg':
                    return 'large'
                case 'icon':
                    return 'small'
                default:
                    return 'medium'
            }
        }

        // For icon-only buttons, use IconButton
        if (size === 'icon') {
            return (
                <IconButton
                    ref={ref}
                    disabled={disabled}
                    color={getMuiColor()}
                    size="small"
                    className={cn(
                        "h-10 w-10",
                        variant === 'ghost' && "hover:bg-accent",
                        variant === 'outline' && "border border-input",
                        className
                    )}
                    sx={{
                        borderRadius: '0.375rem',
                        ...(variant === 'outline' && {
                            border: '1px solid',
                            borderColor: 'divider',
                        }),
                    }}
                    {...props as React.ComponentProps<typeof IconButton>}
                >
                    {children}
                </IconButton>
            )
        }

        // For asChild, we fallback to native button with className styling
        if (asChild) {
            return (
                <button
                    ref={ref}
                    disabled={disabled}
                    className={buttonVariants({ variant, size, className })}
                    {...props}
                >
                    {children}
                </button>
            )
        }

        return (
            <MuiButton
                ref={ref}
                disabled={disabled}
                variant={getMuiVariant()}
                color={getMuiColor()}
                size={getMuiSize()}
                className={cn(className)}
                sx={{
                    minWidth: 'auto',
                    ...(variant === 'link' && {
                        textDecoration: 'none',
                        '&:hover': {
                            textDecoration: 'underline',
                            backgroundColor: 'transparent',
                        },
                    }),
                    ...(variant === 'ghost' && {
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                    }),
                    ...(size === 'sm' && {
                        height: '2.25rem',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.875rem',
                    }),
                    ...(size === 'lg' && {
                        height: '2.75rem',
                        padding: '0.5rem 2rem',
                    }),
                }}
                {...props as React.ComponentProps<typeof MuiButton>}
            >
                {children}
            </MuiButton>
        )
    }
)
Button.displayName = "Button"

export { Button }
