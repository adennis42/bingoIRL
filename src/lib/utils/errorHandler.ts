/**
 * Centralized error handling utilities
 */

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  userMessage?: string;
}

export class FirebaseError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "FirebaseError";
  }
}

export class PermissionError extends Error {
  constructor(message: string = "You don't have permission to perform this action") {
    super(message);
    this.name = "PermissionError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Converts Firebase errors to user-friendly messages
 */
export function getFirebaseErrorMessage(error: unknown): string {
  // Check for custom error types first
  if (error instanceof PermissionError) {
    return error.message;
  }
  
  if (error instanceof FirebaseError) {
    return error.message;
  }

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Handle common Firebase error codes
    if (error.message.includes("permission") || error.message.includes("insufficient")) {
      return "You don't have permission to perform this action.";
    }
    if (error.message.includes("not-found") || error.message.includes("does not exist")) {
      return "The requested resource was not found.";
    }
    if (error.message.includes("network") || error.message.includes("fetch")) {
      return "Network error. Please check your connection and try again.";
    }
    if (error.message.includes("unavailable")) {
      return "Service temporarily unavailable. Please try again later.";
    }
    if (error.message.includes("quota") || error.message.includes("limit")) {
      return "Service limit reached. Please try again later.";
    }
    if (error.message.includes("invalid-argument")) {
      return "Invalid input. Please check your data and try again.";
    }
    if (error.message.includes("already-exists")) {
      return "This resource already exists.";
    }
    if (error.message.includes("auth")) {
      return "Authentication error. Please log in and try again.";
    }
    
    return error.message || "An unexpected error occurred.";
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Logs errors with context for debugging
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const errorInfo = {
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    context,
    timestamp: new Date().toISOString(),
  };

  console.error("Application Error:", errorInfo);

  // In production, you might want to send this to an error tracking service
  // e.g., Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === "production") {
    // Example: sendToErrorTracking(errorInfo);
  }
}

/**
 * Wraps async functions with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorMessage?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, { function: fn.name, args });
      const message = errorMessage || getFirebaseErrorMessage(error);
      throw new Error(message);
    }
  }) as T;
}

/**
 * Creates a safe async handler that catches errors
 */
export function createSafeHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  onError?: (error: Error) => void
): (...args: Parameters<T>) => Promise<void> {
  return async (...args: Parameters<T>) => {
    try {
      await fn(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logError(err, { function: fn.name, args });
      onError?.(err);
    }
  };
}
