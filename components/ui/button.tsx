import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3182F6]/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.96]",
  {
    variants: {
      variant: {
        default: "w-full bg-[#3182F6] text-white text-[17px] py-4 rounded-[18px]",
        destructive:
          "bg-[#F04452] text-white text-[17px] py-4 rounded-[18px]",
        outline:
          "border-0 bg-white text-[#4E5968] rounded-[16px] hover:bg-[#F9FAFB]",
        secondary:
          "bg-[#E8F3FF] text-[#3182F6] font-semibold py-3 px-5 rounded-[16px]",
        ghost: "text-[#4E5968] hover:bg-[#F9FAFB] rounded-[16px]",
        link: "text-[#3182F6] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-auto",
        sm: "h-auto px-4 py-2 text-[14px] rounded-[14px]",
        lg: "h-auto px-8 py-4 text-[17px] rounded-[18px]",
        icon: "h-10 w-10 rounded-[16px]",
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
