import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full border-[3px] border-[#111] bg-[#1e1e1e] px-4 py-2",
          "text-sm font-bold text-white placeholder:text-[#555]",
          "focus:outline-none focus:border-[#f5c542] transition-all duration-150",
          "[box-shadow:3px_3px_0px_#111]",
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
