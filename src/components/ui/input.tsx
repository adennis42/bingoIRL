import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full border-[3px] border-[#1a1a1a] bg-[#2a1f0e] px-4 py-2",
          "text-sm font-bold text-white placeholder:text-[#7a6a4a]",
          "focus:outline-none focus:border-[#f5c542] focus:bg-[#332810] transition-all duration-150",
          "[box-shadow:3px_3px_0px_#1a1a1a]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
