import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[16px] border-0 bg-[#F9FAFB] px-4 py-4 text-[17px] font-medium text-[#191F28] placeholder:text-[#8B95A1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3182F6]/20 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F9FAFB]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
