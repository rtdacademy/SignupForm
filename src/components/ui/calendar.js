import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "../../lib/utils"
import { buttonVariants } from "../ui/button"

// Add specific styles for the calendar
const calendarStyles = {
  wrapper: "rdp",
  months: "[&_.rdp-months]:flex [&_.rdp-months]:flex-col sm:[&_.rdp-months]:flex-row [&_.rdp-months]:space-y-4 sm:[&_.rdp-months]:space-x-4 sm:[&_.rdp-months]:space-y-0",
  month: "[&_.rdp-month]:space-y-4",
  caption: "[&_.rdp-caption]:flex [&_.rdp-caption]:justify-center [&_.rdp-caption]:pt-1 [&_.rdp-caption]:relative [&_.rdp-caption]:items-center",
  caption_label: "[&_.rdp-caption_label]:text-sm [&_.rdp-caption_label]:font-medium",
  nav: "[&_.rdp-nav]:space-x-1 [&_.rdp-nav]:flex [&_.rdp-nav]:items-center",
  nav_button: cn(
    buttonVariants({ variant: "outline" }),
    "[&_.rdp-nav_button]:h-7 [&_.rdp-nav_button]:w-7 [&_.rdp-nav_button]:bg-transparent [&_.rdp-nav_button]:p-0 [&_.rdp-nav_button]:opacity-50 [&_.rdp-nav_button]:hover:opacity-100"
  ),
  head: "[&_.rdp-head]:mt-4",
  head_row: "[&_.rdp-head_row]:flex [&_.rdp-head_row]:justify-between",
  head_cell: "[&_.rdp-head_cell]:text-muted-foreground [&_.rdp-head_cell]:w-9 [&_.rdp-head_cell]:text-center [&_.rdp-head_cell]:font-normal [&_.rdp-head_cell]:text-[0.8rem]",
  tbody: "[&_.rdp-tbody]:mt-2",
  row: "[&_.rdp-row]:flex [&_.rdp-row]:w-full [&_.rdp-row]:justify-between [&_.rdp-row]:mt-2",
  cell: "[&_.rdp-cell]:relative [&_.rdp-cell]:p-0 [&_.rdp-cell]:text-center [&_.rdp-cell]:text-sm",
  day: cn(
    buttonVariants({ variant: "ghost" }),
    "[&_.rdp-day]:h-9 [&_.rdp-day]:w-9 [&_.rdp-day]:p-0 [&_.rdp-day]:font-normal"
  ),
  day_selected: "[&_.rdp-day_selected]:bg-primary [&_.rdp-day_selected]:text-primary-foreground",
  day_today: "[&_.rdp-day_today]:bg-accent [&_.rdp-day_today]:text-accent-foreground",
  day_outside: "[&_.rdp-day_outside]:text-muted-foreground [&_.rdp-day_outside]:opacity-50",
  day_disabled: "[&_.rdp-day_disabled]:text-muted-foreground [&_.rdp-day_disabled]:opacity-50",
  day_hidden: "[&_.rdp-day_hidden]:invisible",
}

const Calendar = React.forwardRef(({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}, ref) => {
  return (
    <DayPicker
      ref={ref}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 rdp shadow-calendar", calendarStyles.wrapper, className)}
      classNames={{
        months: calendarStyles.months,
        month: calendarStyles.month,
        caption: calendarStyles.caption,
        caption_label: calendarStyles.caption_label,
        nav: calendarStyles.nav,
        nav_button: calendarStyles.nav_button,
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head: calendarStyles.head,
        head_row: calendarStyles.head_row,
        head_cell: calendarStyles.head_cell,
        tbody: calendarStyles.tbody,
        row: calendarStyles.row,
        cell: calendarStyles.cell,
        day: calendarStyles.day,
        day_selected: calendarStyles.day_selected,
        day_today: calendarStyles.day_today,
        day_outside: calendarStyles.day_outside,
        day_disabled: calendarStyles.day_disabled,
        day_hidden: calendarStyles.day_hidden,
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
})

Calendar.displayName = "Calendar"

export { Calendar }