import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-sm shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        default:
          "border-blue-500/30 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/25 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/40",
        secondary:
          "border-slate-300/60 bg-gradient-to-r from-slate-200/90 to-slate-300/90 text-slate-800 backdrop-blur-md hover:from-slate-300/90 hover:to-slate-400/90 hover:text-slate-900",
        destructive:
          "border-red-500/30 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-500/25 hover:from-red-700 hover:to-red-800 hover:shadow-red-500/40",
        outline: 
          "border-slate-300/60 bg-white/80 text-slate-800 backdrop-blur-md hover:bg-white/90 hover:border-slate-400/80 hover:text-slate-900",
        success:
          "border-green-500/30 bg-gradient-to-r from-green-600 to-green-700 text-white shadow-green-500/25 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/40",
        warning:
          "border-amber-500/30 bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-500/25 hover:from-amber-700 hover:to-amber-800 hover:shadow-amber-500/40",
        info:
          "border-cyan-500/30 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-cyan-500/25 hover:from-cyan-700 hover:to-cyan-800 hover:shadow-cyan-500/40",
        glass:
          "border-white/30 bg-white/20 text-white backdrop-blur-md hover:bg-white/30 hover:border-white/50 shadow-lg hover:shadow-xl",
        "glass-dark":
          "border-white/20 bg-slate-900/40 text-white backdrop-blur-md hover:bg-slate-900/60 hover:border-white/30 shadow-lg hover:shadow-xl",
      },
      size: {
        default: "px-3 py-1.5 text-xs",
        sm: "px-2 py-1 text-xs",
        lg: "px-4 py-2 text-sm font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }