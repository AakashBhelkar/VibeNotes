import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar"
import dayjs, { Dayjs } from "dayjs"
import Box from "@mui/material/Box"
import { cn } from "@/lib/utils"

export interface CalendarProps {
    className?: string
    selected?: Date
    onSelect?: (date: Date | undefined) => void
    disabled?: boolean
    mode?: "single" | "range" | "multiple"
    showOutsideDays?: boolean
    month?: Date
    onMonthChange?: (month: Date) => void
    fromDate?: Date
    toDate?: Date
}

/**
 * Calendar component using Material UI X DateCalendar
 * Maintains a similar API to the original react-day-picker based Calendar
 */
function Calendar({
    className,
    selected,
    onSelect,
    disabled,
    mode = "single",
    showOutsideDays = true,
    month,
    onMonthChange,
    fromDate,
    toDate,
    ...props
}: CalendarProps) {
    const selectedDayjs = selected ? dayjs(selected) : null
    const monthDayjs = month ? dayjs(month) : undefined
    const minDate = fromDate ? dayjs(fromDate) : undefined
    const maxDate = toDate ? dayjs(toDate) : undefined

    const handleChange = (newValue: Dayjs | null) => {
        if (onSelect) {
            onSelect(newValue ? newValue.toDate() : undefined)
        }
    }

    const handleMonthChange = (newMonth: Dayjs) => {
        if (onMonthChange) {
            onMonthChange(newMonth.toDate())
        }
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box className={cn("p-3", className)}>
                <DateCalendar
                    value={selectedDayjs}
                    onChange={handleChange}
                    disabled={disabled}
                    showDaysOutsideCurrentMonth={showOutsideDays}
                    referenceDate={monthDayjs}
                    onMonthChange={handleMonthChange}
                    minDate={minDate}
                    maxDate={maxDate}
                    sx={{
                        width: '100%',
                        maxWidth: '320px',
                        '& .MuiPickersCalendarHeader-root': {
                            paddingLeft: '8px',
                            paddingRight: '8px',
                            marginTop: 0,
                        },
                        '& .MuiPickersCalendarHeader-label': {
                            fontSize: '0.875rem',
                            fontWeight: 500,
                        },
                        '& .MuiPickersArrowSwitcher-button': {
                            opacity: 0.5,
                            '&:hover': {
                                opacity: 1,
                            },
                        },
                        '& .MuiDayCalendar-weekDayLabel': {
                            width: 36,
                            height: 36,
                            fontSize: '0.8rem',
                            color: 'text.secondary',
                        },
                        '& .MuiPickersDay-root': {
                            width: 36,
                            height: 36,
                            fontSize: '0.875rem',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            },
                            '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                '&:hover': {
                                    backgroundColor: 'primary.main',
                                },
                                '&:focus': {
                                    backgroundColor: 'primary.main',
                                },
                            },
                            '&.MuiPickersDay-today': {
                                backgroundColor: 'action.selected',
                                borderColor: 'transparent',
                            },
                            '&.MuiPickersDay-dayOutsideMonth': {
                                color: 'text.disabled',
                                opacity: 0.5,
                            },
                        },
                        '& .MuiPickersDay-dayDisabled': {
                            color: 'text.disabled',
                            opacity: 0.5,
                        },
                    }}
                    {...props}
                />
            </Box>
        </LocalizationProvider>
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
