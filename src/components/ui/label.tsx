import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-slate-800",
  {
    variants: {
      variant: {
        default: "text-slate-800",
        glass: "text-white font-bold",
        muted: "text-slate-600 font-medium",
        required: "text-slate-800 after:content-['*'] after:text-red-500 after:ml-1",
        "glass-required": "text-white font-bold after:content-['*'] after:text-red-300 after:ml-1",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-base font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, variant, size, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ variant, size }), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label, labelVariants }