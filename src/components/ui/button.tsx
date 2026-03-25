import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-black uppercase tracking-wide transition-all duration-75 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none whitespace-nowrap border-[3px] border-[#111] active:translate-x-[2px] active:translate-y-[2px] active:[box-shadow:1px_1px_0px_#111]",
  {
    variants: {
      variant: {
        // Yellow — cel-shaded with gradient + inset
        default:
          "text-[#111] [background:linear-gradient(to_bottom,#ffe066_0%,#f5c542_45%,#c49200_100%)] [box-shadow:4px_4px_0px_#111,inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:[box-shadow:6px_6px_0px_#111,inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(0,0,0,0.25)]",
        // Blue
        secondary:
          "text-[#111] [background:linear-gradient(to_bottom,#7dd4ff_0%,#4db8ff_45%,#1a80cc_100%)] [box-shadow:4px_4px_0px_#111,inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:[box-shadow:6px_6px_0px_#111,inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(0,0,0,0.25)]",
        // Green
        success:
          "text-[#111] [background:linear-gradient(to_bottom,#80ffaa_0%,#50e878_45%,#1a9933_100%)] [box-shadow:4px_4px_0px_#111,inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:[box-shadow:6px_6px_0px_#111,inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(0,0,0,0.25)]",
        // Red
        destructive:
          "text-white [background:linear-gradient(to_bottom,#ff7070_0%,#e84040_45%,#991a1a_100%)] [box-shadow:4px_4px_0px_#111,inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-2px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:[box-shadow:6px_6px_0px_#111,inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-2px_0_rgba(0,0,0,0.25)]",
        // Orange
        gold:
          "text-[#111] [background:linear-gradient(to_bottom,#ff9060_0%,#ff6b35_45%,#b33400_100%)] [box-shadow:4px_4px_0px_#111,inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-2px_0_rgba(0,0,0,0.25)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:[box-shadow:6px_6px_0px_#111,inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-2px_0_rgba(0,0,0,0.25)]",
        // Ghost
        ghost:
          "border-transparent bg-transparent text-[#ccc] hover:bg-white/10 hover:text-white [box-shadow:none] active:[box-shadow:none] active:translate-x-0 active:translate-y-0",
        // Link
        link:
          "border-transparent bg-transparent text-[#f5c542] underline-offset-4 hover:underline p-0 h-auto [box-shadow:none] active:[box-shadow:none] active:translate-x-0 active:translate-y-0",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm",
        sm:      "h-9 px-4 py-1.5 text-xs",
        lg:      "h-14 px-8 py-3 text-base",
        xl:      "h-16 px-10 py-4 text-lg",
        icon:    "h-10 w-10",
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
