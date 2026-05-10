import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border border-primary hover:bg-secondary hover:border-border-hover shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive hover:opacity-90 shadow-sm",
        outline:
          "border border-border bg-surface hover:border-border-hover hover:bg-bg-secondary shadow-xs",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-bg-secondary shadow-xs",
        ghost: "hover:bg-bg-secondary hover:text-text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        accent: "bg-accent text-white border border-accent hover:bg-accent-light hover:border-accent-light shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2 min-h-[44px]",
        sm: "h-9 px-3 text-xs min-h-[36px]",
        lg: "h-12 px-8 text-base min-h-[48px]",
        xl: "h-14 px-10 text-lg min-h-[56px]",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px]",
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
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
