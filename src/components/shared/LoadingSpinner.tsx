interface LoadingSpinnerProps {
  variant?: "page" | "inline";
  size?: "sm" | "md";
}

export function LoadingSpinner({ variant = "page", size = "md" }: LoadingSpinnerProps) {
  const dim = size === "sm" || variant === "inline" ? "h-4 w-4" : "h-10 w-10";
  const spinner = (
    <div
      className={`animate-spin ${dim}`}
      style={{
        border: "3px solid #1a1a1a",
        borderTop: "3px solid #f5c542",
        borderRight: "3px solid #f5c542",
      }}
    />
  );
  if (variant === "inline") return spinner;
  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
}
