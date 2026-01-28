import * as React from "react"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Divider from "@mui/material/Divider"
import Typography from "@mui/material/Typography"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextValue {
    open: boolean
    setOpen: (open: boolean) => void
    anchorEl: HTMLElement | null
    setAnchorEl: (el: HTMLElement | null) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenuContext() {
    const context = React.useContext(DropdownMenuContext)
    if (!context) {
        throw new Error("DropdownMenu components must be used within a DropdownMenu")
    }
    return context
}

interface DropdownMenuProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
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
        <DropdownMenuContext.Provider value={{ open, setOpen, anchorEl, setAnchorEl }}>
            {children}
        </DropdownMenuContext.Provider>
    )
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
    ({ children, asChild, onClick, ...props }, ref) => {
        const { setOpen, setAnchorEl } = useDropdownMenuContext()

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e)
            setAnchorEl(e.currentTarget)
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
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <>{children}</>
)
DropdownMenuGroup.displayName = "DropdownMenuGroup"

const DropdownMenuPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <>{children}</>
)
DropdownMenuPortal.displayName = "DropdownMenuPortal"

// Sub menu context for nested menus
interface SubMenuContextValue {
    open: boolean
    setOpen: (open: boolean) => void
    anchorEl: HTMLElement | null
    setAnchorEl: (el: HTMLElement | null) => void
}

const SubMenuContext = React.createContext<SubMenuContextValue | null>(null)

const DropdownMenuSub: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = React.useState(false)
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

    return (
        <SubMenuContext.Provider value={{ open, setOpen, anchorEl, setAnchorEl }}>
            {children}
        </SubMenuContext.Provider>
    )
}
DropdownMenuSub.displayName = "DropdownMenuSub"

// Radio group context
interface RadioGroupContextValue {
    value: string
    onValueChange: (value: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)

interface DropdownMenuRadioGroupProps {
    children: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
}

const DropdownMenuRadioGroup: React.FC<DropdownMenuRadioGroupProps> = ({
    children,
    value = "",
    onValueChange = () => {},
}) => (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
        {children}
    </RadioGroupContext.Provider>
)
DropdownMenuRadioGroup.displayName = "DropdownMenuRadioGroup"

interface DropdownMenuSubTriggerProps extends React.HTMLAttributes<HTMLLIElement> {
    inset?: boolean
}

const DropdownMenuSubTrigger = React.forwardRef<HTMLLIElement, DropdownMenuSubTriggerProps>(
    ({ className, inset, children, ...props }, ref) => {
        const subContext = React.useContext(SubMenuContext)

        const handleMouseEnter = (e: React.MouseEvent<HTMLLIElement>) => {
            subContext?.setAnchorEl(e.currentTarget)
            subContext?.setOpen(true)
        }

        const handleMouseLeave = () => {
            subContext?.setOpen(false)
        }

        return (
            <MenuItem
                ref={ref}
                className={cn(
                    "flex cursor-default select-none items-center gap-2 rounded-sm text-sm",
                    inset && "pl-8",
                    className
                )}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                sx={{
                    minHeight: 'auto',
                    py: 0.75,
                    px: 1,
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    },
                }}
                {...props}
            >
                {children}
                <ChevronRight className="ml-auto h-4 w-4" />
            </MenuItem>
        )
    }
)
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger"

interface DropdownMenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
    ({ className, children, ...props }, ref) => {
        const subContext = React.useContext(SubMenuContext)

        return (
            <Menu
                open={subContext?.open ?? false}
                anchorEl={subContext?.anchorEl}
                onClose={() => subContext?.setOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                slotProps={{
                    paper: {
                        ref,
                        className: cn(
                            "min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
                            className
                        ),
                        sx: { backgroundImage: 'none' },
                        ...props,
                    },
                }}
            >
                {children}
            </Menu>
        )
    }
)
DropdownMenuSubContent.displayName = "DropdownMenuSubContent"

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
    sideOffset?: number
    align?: "start" | "center" | "end"
    side?: "top" | "right" | "bottom" | "left"
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
    ({ className, sideOffset = 4, align = "start", side = "bottom", children, ...props }, ref) => {
        const { open, setOpen, anchorEl } = useDropdownMenuContext()

        const getAnchorOrigin = () => {
            const horizontal = align === "start" ? "left" : align === "end" ? "right" : "center"
            const vertical = side === "top" ? "top" : "bottom"
            return { vertical, horizontal } as const
        }

        const getTransformOrigin = () => {
            const horizontal = align === "start" ? "left" : align === "end" ? "right" : "center"
            const vertical = side === "top" ? "bottom" : "top"
            return { vertical, horizontal } as const
        }

        return (
            <Menu
                open={open && Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setOpen(false)}
                anchorOrigin={getAnchorOrigin()}
                transformOrigin={getTransformOrigin()}
                slotProps={{
                    paper: {
                        ref,
                        className: cn(
                            "min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
                            className
                        ),
                        sx: {
                            marginTop: side === "bottom" ? `${sideOffset}px` : undefined,
                            marginBottom: side === "top" ? `${sideOffset}px` : undefined,
                            backgroundImage: 'none',
                        },
                        ...props,
                    },
                }}
            >
                {children}
            </Menu>
        )
    }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
    inset?: boolean
    disabled?: boolean
    onSelect?: () => void
}

const DropdownMenuItem = React.forwardRef<HTMLLIElement, DropdownMenuItemProps>(
    ({ className, inset, disabled, onSelect, onClick, children, ...props }, ref) => {
        const { setOpen } = useDropdownMenuContext()

        const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
            onClick?.(e)
            onSelect?.()
            setOpen(false)
        }

        return (
            <MenuItem
                ref={ref}
                disabled={disabled}
                onClick={handleClick}
                className={cn(
                    "relative flex cursor-default select-none items-center gap-2 rounded-sm text-sm outline-none transition-colors",
                    inset && "pl-8",
                    className
                )}
                sx={{
                    minHeight: 'auto',
                    py: 0.75,
                    px: 1,
                    borderRadius: '0.125rem',
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    },
                    '&:focus': {
                        backgroundColor: 'action.hover',
                    },
                }}
                {...props}
            >
                {children}
            </MenuItem>
        )
    }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

interface DropdownMenuCheckboxItemProps extends React.HTMLAttributes<HTMLLIElement> {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    disabled?: boolean
}

const DropdownMenuCheckboxItem = React.forwardRef<HTMLLIElement, DropdownMenuCheckboxItemProps>(
    ({ className, children, checked, onCheckedChange, disabled, ...props }, ref) => {
        const { setOpen } = useDropdownMenuContext()

        const handleClick = () => {
            onCheckedChange?.(!checked)
            setOpen(false)
        }

        return (
            <MenuItem
                ref={ref}
                disabled={disabled}
                onClick={handleClick}
                className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
                    className
                )}
                sx={{
                    minHeight: 'auto',
                    py: 0.75,
                    pl: 4,
                    pr: 1,
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    },
                }}
                {...props}
            >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {checked && <Check className="h-4 w-4" />}
                </span>
                {children}
            </MenuItem>
        )
    }
)
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

interface DropdownMenuRadioItemProps extends React.HTMLAttributes<HTMLLIElement> {
    value: string
    disabled?: boolean
}

const DropdownMenuRadioItem = React.forwardRef<HTMLLIElement, DropdownMenuRadioItemProps>(
    ({ className, children, value, disabled, ...props }, ref) => {
        const radioContext = React.useContext(RadioGroupContext)
        const { setOpen } = useDropdownMenuContext()
        const isSelected = radioContext?.value === value

        const handleClick = () => {
            radioContext?.onValueChange(value)
            setOpen(false)
        }

        return (
            <MenuItem
                ref={ref}
                disabled={disabled}
                onClick={handleClick}
                className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
                    className
                )}
                sx={{
                    minHeight: 'auto',
                    py: 0.75,
                    pl: 4,
                    pr: 1,
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    },
                }}
                {...props}
            >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {isSelected && <Circle className="h-2 w-2 fill-current" />}
                </span>
                {children}
            </MenuItem>
        )
    }
)
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
    inset?: boolean
}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
    ({ className, inset, ...props }, ref) => (
        <Typography
            ref={ref}
            variant="body2"
            className={cn(
                "px-2 py-1.5 text-sm font-semibold",
                inset && "pl-8",
                className
            )}
            component="div"
            sx={{ px: 1, py: 0.75 }}
            {...props}
        />
    )
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(
    ({ className, ...props }, ref) => (
        <Divider
            ref={ref}
            className={cn("-mx-1 my-1", className)}
            {...props}
        />
    )
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuShortcut = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
    return (
        <span
            className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
            {...props}
        />
    )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup,
}
