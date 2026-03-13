# Error Handling Guide

This document describes the error handling strategy implemented throughout the application.

## Error Handling Architecture

### Error Boundary
- **Location**: `src/components/shared/ErrorBoundary.tsx`
- **Purpose**: Catches React component errors and displays a user-friendly fallback UI
- **Usage**: Wraps the entire application in `src/app/layout.tsx`

### Error Display Component
- **Location**: `src/components/shared/ErrorDisplay.tsx`
- **Purpose**: Displays error messages consistently across the app
- **Features**:
  - Dismissible errors
  - Consistent styling
  - Accessible (ARIA labels)

### Error Utilities
- **Location**: `src/lib/utils/errorHandler.ts`
- **Features**:
  - Firebase error translation to user-friendly messages
  - Custom error classes (FirebaseError, PermissionError, ValidationError)
  - Error logging with context
  - Safe async handlers

## Error Types

### FirebaseError
- Thrown for Firebase-specific errors
- Includes error code and user-friendly message

### PermissionError
- Thrown when user lacks permission
- Clear message: "You don't have permission to perform this action"

### ValidationError
- Thrown for invalid input
- Includes specific validation message

## Error Handling in Firebase Operations

All Firebase operations are wrapped with try-catch blocks that:
1. Log errors with context
2. Translate Firebase error codes to user-friendly messages
3. Throw appropriate error types
4. Preserve error context for debugging

## User-Facing Error Messages

Errors are displayed using:
- `ErrorDisplay` component for inline errors
- `ErrorBoundary` for catastrophic errors
- Toast notifications (if implemented)
- Console logging for development

## Best Practices

1. **Always catch errors** in async operations
2. **Log errors** with context for debugging
3. **Show user-friendly messages** - avoid technical jargon
4. **Provide recovery options** - "Try Again" buttons, navigation options
5. **Handle network errors** gracefully - show reconnection status

## Example Usage

```typescript
import { getFirebaseErrorMessage, logError } from "@/lib/utils/errorHandler";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";

try {
  await updateGame(gameId, updates);
} catch (error) {
  logError(error, { operation: "updateGame", gameId });
  setError(getFirebaseErrorMessage(error));
}
```
