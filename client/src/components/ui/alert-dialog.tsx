import * as React from "react"
import MuiDialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import MuiDialogTitle from "@mui/material/DialogTitle"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import MuiButton from "@mui/material/Button"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface AlertDialogContextValue {
    open: boolean
    setOpen: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null)

function useAlertDialogContext() {
    const context = React.useContext(AlertDialogContext)
    if (!context) {
        throw new Error("AlertDialog components must be used within an AlertDialog")
    }
    return context
}

interface AlertDialogProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
}

/**
 * AlertDialog component using Material UI Dialog
 * Maintains the same API as the original shadcn/ui AlertDialog
 */
const AlertDialog: React.FC<AlertDialogProps> = ({
    children,
    open: controlledOpen,
    onOpenChange,
    defaultOpen = false,
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)

    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : uncontrolledOpen

    const setOpen = React.useCallback(
        (newOpen: boolean) => {
            if (!isControlled) {
                setUncontrolledOpen(newOpen)
            }
            onOpenChange?.(newOpen)
        },
        [isControlled, onOpenChange]
    )

    return (
        <AlertDialogContext.Provider value={{ open, setOpen }}>
            {children}
        </AlertDialogContext.Provider>
    )
}

interface AlertDialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(
    ({ children, asChild, onClick, ...props }, ref) => {
        const { setOpen } = useAlertDialogContext()

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e)
            setOpen(true)
        }

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<any>, {
                onClick: handleClick,
                ref,
            })
        }

        return (
            <button ref={ref} onClick={handleClick} {...props}>
                {children}
            </button>
        )
    }
)
AlertDialogTrigger.displayName = "AlertDialogTrigger"

// Portal is a no-op since MUI handles portaling
const AlertDialogPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <>{children}</>
)
AlertDialogPortal.displayName = "AlertDialogPortal"

// Overlay is a no-op since MUI Dialog includes backdrop
const AlertDialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("hidden", className)} {...props} />
    )
)
AlertDialogOverlay.displayName = "AlertDialogOverlay"

interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
    ({ className, children, ...props }, ref) => {
        const { open } = useAlertDialogContext()

        return (
            <MuiDialog
                open={open}
                maxWidth="sm"
                fullWidth
                // AlertDialog should not close on backdrop click or escape
                disableEscapeKeyDown
                PaperProps={{
                    ref,
                    className: cn("!bg-background !text-foreground", className),
                    sx: {
                        borderRadius: '0.5rem',
                        backgroundImage: 'none',
                    },
                    ...props,
                }}
                slotProps={{
                    backdrop: {
                        onClick: (e) => e.stopPropagation(),
                    },
                }}
            >
                {children}
            </MuiDialog>
        )
    }
)
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <Box
        className={cn(
            "flex flex-col space-y-2 text-center sm:text-left px-6 pt-6",
            className
        )}
        {...props}
    />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <DialogActions
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-6 pb-6",
            className
        )}
        sx={{ padding: '0 24px 24px 24px' }}
        {...props}
    />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

interface AlertDialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
    ({ className, children, ...props }, ref) => (
        <MuiDialogTitle
            ref={ref}
            className={cn("!p-0 !text-lg !font-semibold", className)}
            {...props}
        >
            {children}
        </MuiDialogTitle>
    )
)
AlertDialogTitle.displayName = "AlertDialogTitle"

interface AlertDialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
    ({ className, children, ...props }, ref) => (
        <Typography
            ref={ref}
            variant="body2"
            className={cn("text-muted-foreground", className)}
            component="p"
            {...props}
        >
            {children}
        </Typography>
    )
)
AlertDialogDescription.displayName = "AlertDialogDescription"

interface AlertDialogActionProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
    asChild?: boolean
}

const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
    ({ className, children, onClick, asChild }, ref) => {
        const { setOpen } = useAlertDialogContext()

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e)
            setOpen(false)
        }

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<any>, {
                onClick: handleClick,
                ref,
            })
        }

        return (
            <MuiButton
                ref={ref}
                variant="contained"
                onClick={handleClick}
                className={cn(buttonVariants(), className)}
            >
                {children}
            </MuiButton>
        )
    }
)
AlertDialogAction.displayName = "AlertDialogAction"

interface AlertDialogCancelProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
    asChild?: boolean
}

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
    ({ className, children, onClick, asChild }, ref) => {
        const { setOpen } = useAlertDialogContext()

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e)
            setOpen(false)
        }

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<any>, {
                onClick: handleClick,
                ref,
            })
        }

        return (
            <MuiButton
                ref={ref}
                variant="outlined"
                onClick={handleClick}
                className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
            >
                {children}
            </MuiButton>
        )
    }
)
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
    AlertDialog,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
}
