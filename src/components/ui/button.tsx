import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-black uppercase tracking-wide transition-all duration-75 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none whitespace-nowrap border-[3px] border-[#1a1a1a] active:translate-x-[2px] active:translate-y-[2px]",
  {
    variants: {
      variant: {
        default:
          "bg-[#f5c542] text-[#1a1a1a] [box-shadow:4px_4px_0px_#1a1a1a] hover:[box-shadow:6px_6px_0px_#1a1a1a] hover:-translate-x-[1px] hover:-translate-y-[1px] active:[box-shadow:1px_1px_0px_#1a1a1a]",
        secondary:
          "bg-[#4db8ff] text-[#1a1a1a] [box-shadow:4px_4px_0px_#1a1a1a] hover:[box-shadow:6px_6px_0px_#1a1a1a] hover:-translate-x-[1px] hover:-translate-y-[1px] active:[box-shadow:1px_1px_0px_#1a1a1a]",
        success:
          "bg-[#50e878] text-[#1a1a1a] [box-shadow:4px_4px_0px_#1a1a1a] hover:[box-shadow:6px_6px_0px_#1a1a1a] hover:-translate-x-[1px] hover:-translate-y-[1px] active:[box-shadow:1px_1px_0px_#1a1a1a]",
        destructive:
          "bg-[#e84040] text-white [box-shadow:4px_4px_0px_#1a1a1a] hover:[box-shadow:6px_6px_0px_#1a1a1a] hover:-translate-x-[1px] hover:-translate-y-[1px] active:[box-shadow:1px_1px_0px_#1a1a1a]",
        gold:
          "bg-[#ff6b35] text-[#1a1a1a] [box-shadow:4px_4px_0px_#1a1a1a] hover:[box-shadow:6px_6px_0px_#1a1a1a] hover:-translate-x-[1px] hover:-translate-y-[1px] active:[box-shadow:1px_1px_0px_#1a1a1a]",
        ghost:
          "border-transparent bg-transparent text-[#c8c8c8] hover:bg-white/10 hover:text-white [box-shadow:none]",
        link:
          "border-transparent bg-transparent text-[#f5c542] underline-offset-4 hover:underline p-0 h-auto [box-shadow:none]",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm",
        sm: "h-9 px-4 py-1.5 text-xs",
        lg: "h-14 px-8 py-3 text-base",
        xl: "h-16 px-10 py-4 text-lg",
        icon: "h-10 w-10",
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
