import * as React from "react"
import MuiPopover from "@mui/material/Popover"
import { cn } from "@/lib/utils"

interface PopoverContextValue {
    open: boolean
    setOpen: (open: boolean) => void
    anchorEl: HTMLElement | null
    setAnchorEl: (el: HTMLElement | null) => void
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

function usePopoverContext() {
    const context = React.useContext(PopoverContext)
    if (!context) {
        throw new Error("Popover components must be used within a Popover")
    }
    return context
}

interface PopoverProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
}

/**
 * Popover component using Material UI Popover
 * Maintains the same API as the original shadcn/ui Popover
 */
const Popover: React.FC<PopoverProps> = ({
    children,
    open: controlledOpen,
    onOpenChange,
    defaultOpen = false,
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

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
        <PopoverContext.Provider value={{ open, setOpen, anchorEl, setAnchorEl }}>
            {children}
        </PopoverContext.Provider>
    )
}

interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
    ({ children, asChild, onClick, ...props }, ref) => {
        const { open, setOpen, setAnchorEl } = usePopoverContext()

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e)
            setAnchorEl(e.currentTarget)
            setOpen(!open)
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
PopoverTrigger.displayName = "PopoverTrigger"

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
    align?: "start" | "center" | "end"
    side?: "top" | "right" | "bottom" | "left"
    sideOffset?: number
    alignOffset?: number
    onPointerDownOutside?: (e: Event) => void
    onEscapeKeyDown?: (e: KeyboardEvent) => void
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
    (
        {
            className,
            children,
            align = "center",
            side = "bottom",
            sideOffset = 4,
            alignOffset = 0,
            onPointerDownOutside,
            onEscapeKeyDown,
            ...props
        },
        ref
    ) => {
        const { open, setOpen, anchorEl } = usePopoverContext()

        // Map side/align to MUI anchor origin and transform origin
        const getAnchorOrigin = () => {
            const horizontal = align === "start" ? "left" : align === "end" ? "right" : "center"
            const vertical = side === "top" ? "top" : side === "bottom" ? "bottom" : "center"
            return { vertical, horizontal } as const
        }

        const getTransformOrigin = () => {
            const horizontal = align === "start" ? "left" : align === "end" ? "right" : "center"
            const vertical = side === "top" ? "bottom" : side === "bottom" ? "top" : "center"
            return { vertical, horizontal } as const
        }

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
            <MuiPopover
                open={open && Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={getAnchorOrigin()}
                transformOrigin={getTransformOrigin()}
                slotProps={{
                    paper: {
                        ref,
                        className: cn(
                            "w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md",
                            className
                        ),
                        sx: {
                            marginTop: side === "bottom" ? `${sideOffset}px` : undefined,
                            marginBottom: side === "top" ? `${sideOffset}px` : undefined,
                            marginLeft: side === "right" ? `${sideOffset}px` : undefined,
                            marginRight: side === "left" ? `${sideOffset}px` : undefined,
                            backgroundImage: 'none',
                        },
                        ...props,
                    },
                }}
            >
                {children}
            </MuiPopover>
        )
    }
)
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
