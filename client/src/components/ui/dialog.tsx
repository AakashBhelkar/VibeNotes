import * as React from "react"
import MuiDialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import MuiDialogTitle from "@mui/material/DialogTitle"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogContextValue {
    open: boolean
    setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialogContext() {
    const context = React.useContext(DialogContext)
    if (!context) {
        throw new Error("Dialog components must be used within a Dialog")
    }
    return context
}

interface DialogProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
}

/**
 * Dialog component using Material UI Dialog
 * Maintains the same API as the original shadcn/ui Dialog
 */
const Dialog: React.FC<DialogProps> = ({
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
        <DialogContext.Provider value={{ open, setOpen }}>
            {children}
        </DialogContext.Provider>
    )
}

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
    ({ children, asChild, onClick, ...props }, ref) => {
        const { setOpen } = useDialogContext()

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
DialogTrigger.displayName = "DialogTrigger"

// Portal is a no-op since MUI handles portaling
const DialogPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <>{children}</>
)
DialogPortal.displayName = "DialogPortal"

// Overlay is a no-op since MUI Dialog includes backdrop
const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("hidden", className)} {...props} />
    )
)
DialogOverlay.displayName = "DialogOverlay"

interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
    ({ children, asChild, onClick, ...props }, ref) => {
        const { setOpen } = useDialogContext()

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
            <button ref={ref} onClick={handleClick} {...props}>
                {children}
            </button>
        )
    }
)
DialogClose.displayName = "DialogClose"

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    onPointerDownOutside?: (e: Event) => void
    onEscapeKeyDown?: (e: KeyboardEvent) => void
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
    ({ className, children, onPointerDownOutside, onEscapeKeyDown, ...props }, ref) => {
        const { open, setOpen } = useDialogContext()

        const handleClose = (_event: object, reason: string) => {
            if (reason === "backdropClick" && onPointerDownOutside) {
                const event = new Event("pointerdown")
                onPointerDownOutside(event)
                return
            }
            if (reason === "escapeKeyDown" && onEscapeKeyDown) {
                const event = new KeyboardEvent("keydown", { key: "Escape" })
                onEscapeKeyDown(event)
                return
            }
            setOpen(false)
        }

        return (
            <MuiDialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    ref,
                    className: cn("!bg-background !text-foreground", className),
                    sx: {
                        borderRadius: '0.5rem',
                        backgroundImage: 'none',
                    },
                    ...props,
                }}
            >
                {children}
                <IconButton
                    aria-label="close"
                    onClick={() => setOpen(false)}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'text.secondary',
                        opacity: 0.7,
                        '&:hover': {
                            opacity: 1,
                        },
                    }}
                >
                    <X className="h-4 w-4" />
                </IconButton>
            </MuiDialog>
        )
    }
)
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <Box
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left px-6 pt-6",
            className
        )}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
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
DialogFooter.displayName = "DialogFooter"

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
    ({ className, children, ...props }, ref) => (
        <MuiDialogTitle
            ref={ref}
            className={cn("!p-0 !text-lg !font-semibold !leading-none !tracking-tight", className)}
            {...props}
        >
            {children}
        </MuiDialogTitle>
    )
)
DialogTitle.displayName = "DialogTitle"

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
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
DialogDescription.displayName = "DialogDescription"

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}
