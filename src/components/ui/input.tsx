import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border-2 border-slate-300/60 bg-white/90 backdrop-blur-md px-4 py-3 text-base font-medium text-slate-800 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-slate-800 placeholder:text-slate-500 placeholder:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:border-blue-400/80 focus-visible:bg-white/95 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-400/70 hover:bg-white/95 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// Glass variant for dark backgrounds
const GlassInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border-2 border-white/30 bg-white/20 backdrop-blur-md px-4 py-3 text-base font-semibold text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-white placeholder:text-white/70 placeholder:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:border-white/60 focus-visible:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-white/50 hover:bg-white/25 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassInput.displayName = "GlassInput"

export { Input, GlassInput }