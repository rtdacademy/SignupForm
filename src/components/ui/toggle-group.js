import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { cn } from "../../lib/utils"

const ToggleGroup = React.forwardRef(({ className, type = "single", ...props }, ref) => {
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-[#40b3b3] p-1 gap-1",
        className
      )}
      {...props}
    />
  )
})
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-white data-[state=on]:text-[#40b3b3]",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }