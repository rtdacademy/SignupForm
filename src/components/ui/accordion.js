// components/ui/accordion.jsx
import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "rounded-lg border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors",
      className
    )}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef(({ className, children, showExpandText = false, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between px-6 py-4 text-base font-medium",
        "text-slate-900 transition-all hover:bg-slate-50/75 group",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
        "[&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-2">
        {children}
        {showExpandText && (
          <span 
            className="text-sm text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:hidden"
            data-state={props["data-state"]}
          >
            Click to expand
          </span>
        )}
      </span>
      <ChevronDown className="h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 group-hover:text-slate-700" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all",
      "data-[state=closed]:animate-accordion-up",
      "data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className="px-1 py-1">
      {children}
    </div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }