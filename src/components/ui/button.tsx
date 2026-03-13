import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-display font-bold rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-glow-primary hover:bg-primary/90 hover:shadow-[0_0_32px_rgba(108,99,255,0.6)] hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-elevated border border-bg-border text-text-primary hover:border-primary/50 hover:bg-elevated/80 hover:-translate-y-0.5 active:translate-y-0",
        success:
          "bg-secondary text-[#0a0a0f] shadow-glow-secondary hover:bg-secondary/90 hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-warn/15 border border-warn/40 text-warn hover:bg-warn/25 hover:-translate-y-0.5 active:translate-y-0",
        gold:
          "bg-gold/15 border border-gold/40 text-gold hover:bg-gold/25 hover:-translate-y-0.5 active:translate-y-0",
        ghost:
          "text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm",
        sm: "h-9 px-4 py-1.5 text-xs rounded-xl",
        lg: "h-13 px-8 py-3 text-base",
        xl: "h-16 px-10 py-4 text-lg",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
