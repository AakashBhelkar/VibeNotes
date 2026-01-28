import * as React from "react"
import TextField from "@mui/material/TextField"
import { cn } from "@/lib/utils"

export interface TextareaProps
    extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

/**
 * Textarea component using Material UI TextField with multiline
 * Maintains the same API as the original shadcn/ui Textarea
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, onChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            onChange?.(e as React.ChangeEvent<HTMLTextAreaElement>)
        }

        return (
            <TextField
                multiline
                minRows={3}
                inputRef={ref}
                onChange={handleChange}
                className={cn("w-full", className)}
                variant="outlined"
                size="small"
                slotProps={{
                    input: {
                        className: "!text-sm",
                    },
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        minHeight: '80px',
                        alignItems: 'flex-start',
                        padding: '8px 12px',
                        '& fieldset': {
                            borderColor: 'divider',
                        },
                        '&:hover fieldset': {
                            borderColor: 'divider',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '2px',
                        },
                        '&.Mui-disabled': {
                            opacity: 0.5,
                            cursor: 'not-allowed',
                        },
                    },
                    '& .MuiInputBase-input': {
                        padding: 0,
                        '&::placeholder': {
                            color: 'text.secondary',
                            opacity: 1,
                        },
                    },
                }}
                {...(props as any)}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
