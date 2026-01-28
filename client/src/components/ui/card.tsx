import * as React from "react"
import MuiCard from "@mui/material/Card"
import MuiCardContent from "@mui/material/CardContent"
import MuiCardActions from "@mui/material/CardActions"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import { cn } from "@/lib/utils"

/**
 * Card component using Material UI
 * Maintains the same API as the original shadcn/ui Card
 */
const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <MuiCard
        ref={ref}
        className={cn(className)}
        sx={{
            borderRadius: '0.5rem',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            backgroundColor: 'background.paper',
        }}
        {...props as React.ComponentProps<typeof MuiCard>}
    />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <Box
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children }) => (
    <Typography
        variant="h6"
        component="div"
        className={cn(className)}
        sx={{
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: '-0.025em',
        }}
    >
        {children}
    </Typography>
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
    <Typography
        ref={ref}
        variant="body2"
        className={cn(className)}
        sx={{
            color: 'text.secondary',
            fontSize: '0.875rem',
        }}
        {...props as React.ComponentProps<typeof Typography>}
    >
        {children}
    </Typography>
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <MuiCardContent
        ref={ref}
        className={cn("p-6 pt-0", className)}
        sx={{
            padding: '1.5rem',
            paddingTop: 0,
            '&:last-child': {
                paddingBottom: '1.5rem',
            },
        }}
        {...props as React.ComponentProps<typeof MuiCardContent>}
    />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <MuiCardActions
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        sx={{
            padding: '1.5rem',
            paddingTop: 0,
        }}
        {...props as React.ComponentProps<typeof MuiCardActions>}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
