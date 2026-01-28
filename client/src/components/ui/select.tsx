import * as React from "react"
import MuiSelect, { SelectChangeEvent } from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import ListSubheader from "@mui/material/ListSubheader"
import Divider from "@mui/material/Divider"
import Box from "@mui/material/Box"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextValue {
    value: string
    onValueChange: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext() {
    const context = React.useContext(SelectContext)
    if (!context) {
        throw new Error("Select components must be used within a Select")
    }
    return context
}

interface SelectProps {
    children: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
    defaultValue?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const Select: React.FC<SelectProps> = ({
    children,
    value: controlledValue,
    onValueChange,
    defaultValue = "",
    open: controlledOpen,
    onOpenChange,
}) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)

    const isValueControlled = controlledValue !== undefined
    const value = isValueControlled ? controlledValue : uncontrolledValue

    const isOpenControlled = controlledOpen !== undefined
    const open = isOpenControlled ? controlledOpen : uncontrolledOpen

    const handleValueChange = React.useCallback(
        (newValue: string) => {
            if (!isValueControlled) {
                setUncontrolledValue(newValue)
            }
            onValueChange?.(newValue)
        },
        [isValueControlled, onValueChange]
    )

    const setOpen = React.useCallback(
        (newOpen: boolean) => {
            if (!isOpenControlled) {
                setUncontrolledOpen(newOpen)
            }
            onOpenChange?.(newOpen)
        },
        [isOpenControlled, onOpenChange]
    )

    return (
        <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
            {children}
        </SelectContext.Provider>
    )
}

const SelectGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <>{children}</>
)
SelectGroup.displayName = "SelectGroup"

interface SelectValueProps {
    placeholder?: string
}

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
    const { value } = useSelectContext()
    return <>{value || placeholder}</>
}
SelectValue.displayName = "SelectValue"

interface SelectTriggerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {}

const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
    ({ className, children }, ref) => {
        const { value, onValueChange, open, setOpen } = useSelectContext()

        const handleChange = (event: SelectChangeEvent<string>) => {
            onValueChange(event.target.value)
        }

        return (
            <FormControl
                ref={ref}
                className={cn("w-full", className)}
                size="small"
            >
                <MuiSelect
                    value={value}
                    onChange={handleChange}
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    displayEmpty
                    renderValue={(selected) => {
                        if (!selected) {
                            // Find the placeholder from children
                            let placeholder = ""
                            React.Children.forEach(children, (child) => {
                                if (React.isValidElement(child) && child.type === SelectValue) {
                                    const selectValueChild = child as React.ReactElement<SelectValueProps>
                                    placeholder = selectValueChild.props.placeholder || ""
                                }
                            })
                            return <span className="text-muted-foreground">{placeholder}</span>
                        }
                        return selected
                    }}
                    IconComponent={(iconProps) => (
                        <ChevronDown className="h-4 w-4 opacity-50 mr-2" {...iconProps} />
                    )}
                    sx={{
                        height: '40px',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'divider',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'divider',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                            borderWidth: '2px',
                        },
                        '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                        },
                    }}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                backgroundImage: 'none',
                                maxHeight: '384px',
                            },
                        },
                    }}
                >
                    {/* This is a hidden placeholder to prevent MUI warnings */}
                    <MenuItem value="" sx={{ display: 'none' }} />
                </MuiSelect>
            </FormControl>
        )
    }
)
SelectTrigger.displayName = "SelectTrigger"

// Scroll buttons are no-ops since MUI handles scrolling
const SelectScrollUpButton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("hidden", className)} {...props} />
    )
)
SelectScrollUpButton.displayName = "SelectScrollUpButton"

const SelectScrollDownButton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("hidden", className)} {...props} />
    )
)
SelectScrollDownButton.displayName = "SelectScrollDownButton"

interface SelectContentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'position'> {
    position?: "item-aligned" | "popper"
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
    ({ className, children }, ref) => {
        // Render the select items within a portal-like structure
        // Since MUI handles portaling internally, we wrap children in a fragment
        return (
            <Box ref={ref} className={cn("hidden", className)}>
                {children}
            </Box>
        )
    }
)
SelectContent.displayName = "SelectContent"

interface SelectLabelProps extends React.HTMLAttributes<HTMLLIElement> {}

const SelectLabel = React.forwardRef<HTMLLIElement, SelectLabelProps>(
    ({ className, children, ...props }, ref) => (
        <ListSubheader
            ref={ref}
            className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
            sx={{ lineHeight: 'inherit', backgroundColor: 'transparent' }}
            {...(props as React.ComponentProps<typeof ListSubheader>)}
        >
            {children}
        </ListSubheader>
    )
)
SelectLabel.displayName = "SelectLabel"

interface SelectItemProps extends React.HTMLAttributes<HTMLLIElement> {
    value: string
    disabled?: boolean
}

const SelectItem = React.forwardRef<HTMLLIElement, SelectItemProps>(
    ({ className, children, value, disabled, ...props }, ref) => {
        const context = useSelectContext()
        const isSelected = context.value === value

        return (
            <MenuItem
                ref={ref}
                value={value}
                disabled={disabled}
                onClick={() => {
                    context.onValueChange(value)
                    context.setOpen(false)
                }}
                className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
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
                    '&.Mui-selected': {
                        backgroundColor: 'action.selected',
                    },
                    '&.Mui-selected:hover': {
                        backgroundColor: 'action.selected',
                    },
                }}
                {...(props as React.ComponentProps<typeof MenuItem>)}
            >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {isSelected && <Check className="h-4 w-4" />}
                </span>
                {children}
            </MenuItem>
        )
    }
)
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(
    ({ className, ...props }, ref) => (
        <Divider
            ref={ref}
            className={cn("-mx-1 my-1", className)}
            {...props}
        />
    )
)
SelectSeparator.displayName = "SelectSeparator"

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
}
