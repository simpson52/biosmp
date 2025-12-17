import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-all duration-material-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 disabled:pointer-events-none disabled:opacity-50 ripple [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white elevation-2 hover:elevation-4 hover:bg-primary-700 active:scale-[0.98] active:elevation-1",
        destructive:
          "bg-error-600 text-white elevation-2 hover:elevation-4 hover:bg-error-700 active:scale-[0.98] active:elevation-1",
        outline:
          "border border-material-gray-300 bg-white text-material-gray-700 elevation-1 hover:elevation-2 hover:bg-material-gray-50 active:scale-[0.98]",
        secondary:
          "bg-material-gray-200 text-material-gray-900 elevation-1 hover:elevation-2 hover:bg-material-gray-300 active:scale-[0.98]",
        ghost: "text-material-gray-700 hover:bg-material-gray-100 active:bg-material-gray-200",
        link: "text-primary-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6",
        sm: "h-8 rounded px-4 text-xs",
        lg: "h-12 rounded px-8 text-base",
        icon: "h-10 w-10",
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
