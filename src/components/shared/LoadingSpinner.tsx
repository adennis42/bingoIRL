interface LoadingSpinnerProps {
  /** "page" (default) adds padding for full-screen use; "inline" is tiny for buttons */
  variant?: "page" | "inline";
  size?: "sm" | "md";
}

export function LoadingSpinner({ variant = "page", size = "md" }: LoadingSpinnerProps) {
  const dim = size === "sm" || variant === "inline" ? "h-4 w-4 border-2" : "h-8 w-8 border-4";
  const spinner = (
    <div
      className={`animate-spin rounded-full border-border border-t-primary ${dim}`}
    />
  );
  if (variant === "inline") return spinner;
  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
}
