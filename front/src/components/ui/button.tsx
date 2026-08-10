import { cva, type VariantProps } from "class-variance-authority"
import type { ButtonHTMLAttributes } from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border-2 border-ink px-5 py-3 text-sm font-extrabold tracking-wide transition-[transform,box-shadow,background-color] outline-none focus-visible:ring-4 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-50 active:translate-x-1 active:translate-y-1 active:shadow-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-[4px_4px_0_var(--ink)] hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground shadow-[4px_4px_0_var(--ink)] hover:bg-secondary/85",
        outline: "bg-card text-foreground shadow-[4px_4px_0_var(--ink)] hover:bg-muted",
        ghost: "border-transparent bg-transparent text-foreground hover:bg-muted",
      },
      size: {
        default: "h-12",
        sm: "h-10 rounded-lg px-4",
        lg: "h-14 px-7 text-base",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
