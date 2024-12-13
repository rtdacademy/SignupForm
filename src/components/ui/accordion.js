import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown } from "lucide-react"

const Accordion = React.forwardRef(({ type = "single", collapsible = false, className, ...props }, ref) => {
  const [openItems, setOpenItems] = React.useState(new Set())

  const toggleItem = (value) => {
    setOpenItems(prev => {
      const newItems = new Set(prev)
      if (newItems.has(value)) {
        newItems.delete(value)
      } else {
        if (type === "single") {
          newItems.clear()
        }
        newItems.add(value)
      }
      return newItems
    })
  }

  return (
    <div
      ref={ref}
      className={cn("space-y-1", className)}
      {...props}
    />
  )
})
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className="flex">
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  </div>
))
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>
      {children}
    </div>
  </div>
))
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }