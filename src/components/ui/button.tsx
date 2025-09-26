import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 backdrop-blur-sm border shadow-lg hover:shadow-xl active:scale-95 transform",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold border-blue-500/30 shadow-blue-500/25 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/40 hover:-translate-y-0.5",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold border-red-500/30 shadow-red-500/25 hover:from-red-700 hover:to-red-800 hover:shadow-red-500/40 hover:-translate-y-0.5",
        outline:
          "border-2 border-slate-300/60 bg-white/80 text-slate-800 font-semibold backdrop-blur-md hover:bg-white/90 hover:border-slate-400/80 hover:text-slate-900 hover:shadow-slate-300/50",
        secondary:
          "bg-gradient-to-r from-slate-200/90 to-slate-300/90 text-slate-800 font-semibold border-slate-300/50 backdrop-blur-md hover:from-slate-300/90 hover:to-slate-400/90 hover:text-slate-900 hover:shadow-slate-400/30",
        ghost: "text-slate-700 font-medium hover:bg-white/60 hover:text-slate-900 backdrop-blur-sm border border-transparent hover:border-white/40 hover:shadow-md",
        link: "text-blue-700 font-semibold underline-offset-4 hover:underline hover:text-blue-800",
        glass: "bg-white/20 text-white font-semibold border-white/30 backdrop-blur-md hover:bg-white/30 hover:border-white/50 shadow-lg hover:shadow-xl",
        "glass-dark": "bg-slate-900/40 text-white font-semibold border-white/20 backdrop-blur-md hover:bg-slate-900/60 hover:border-white/30 shadow-lg hover:shadow-xl",
        success: "bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold border-green-500/30 shadow-green-500/25 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/40 hover:-translate-y-0.5",
        warning: "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold border-amber-500/30 shadow-amber-500/25 hover:from-amber-700 hover:to-amber-800 hover:shadow-amber-500/40 hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 text-xs font-semibold",
        lg: "h-13 rounded-xl px-8 py-4 text-base font-semibold",
        icon: "h-11 w-11",
        xs: "h-8 rounded-lg px-3 text-xs font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }