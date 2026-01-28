import * as React from "react"
import TextField from "@mui/material/TextField"
import InputBase from "@mui/material/InputBase"
import { cn } from "@/lib/utils"

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Use minimal styling without MUI's default TextField wrapper */
    minimal?: boolean
}

/**
 * Input component using Material UI TextField
 * Maintains the same API as the original shadcn/ui Input
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, minimal = false, ...props }, ref) => {
        // For file inputs or when minimal styling is needed, use InputBase
        if (type === 'file' || minimal) {
            return (
                <InputBase
                    type={type}
                    inputRef={ref}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                        "placeholder:text-muted-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                    sx={{
                        '& .MuiInputBase-input': {
                            padding: 0,
                            height: '100%',
                        },
                    }}
                    {...props as React.ComponentProps<typeof InputBase>}
                />
            )
        }

        return (
            <TextField
                type={type}
                inputRef={ref}
                variant="outlined"
                size="small"
                fullWidth
                className={cn(className)}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '0.375rem',
                        backgroundColor: 'background.paper',
                        '& fieldset': {
                            borderColor: 'divider',
                        },
                        '&:hover fieldset': {
                            borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '2px',
                        },
                        '&.Mui-disabled': {
                            opacity: 0.5,
                        },
                    },
                    '& .MuiOutlinedInput-input': {
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        '&::placeholder': {
                            color: 'text.secondary',
                            opacity: 1,
                        },
                    },
                }}
                InputProps={{
                    ...props as React.ComponentProps<typeof TextField>['InputProps'],
                }}
                inputProps={{
                    ...props,
                }}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
