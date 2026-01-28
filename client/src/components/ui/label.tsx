import * as React from "react"
import FormLabel from "@mui/material/FormLabel"
import { cn } from "@/lib/utils"

export interface LabelProps
    extends React.LabelHTMLAttributes<HTMLLabelElement> { }

/**
 * Label component using Material UI FormLabel
 * Maintains the same API as the original shadcn/ui Label
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    ({ className, ...props }, ref) => (
        <FormLabel
            ref={ref}
            className={cn(
                "text-sm font-medium leading-none",
                className
            )}
            sx={{
                color: 'text.primary',
                fontSize: '0.875rem',
                fontWeight: 500,
                lineHeight: 1,
                '&.Mui-disabled': {
                    cursor: 'not-allowed',
                    opacity: 0.7,
                },
            }}
            {...props as React.ComponentProps<typeof FormLabel>}
        />
    )
)
Label.displayName = "Label"

export { Label }
