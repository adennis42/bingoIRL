# Testing Guide

This document describes the testing strategy and how to run tests for the Bingo Host application.

## Test Structure

### Unit Tests (`src/__tests__/`)
- **Utilities**: Tests for bingo logic, game code generation, error handling
- **Components**: Tests for reusable UI components
- **Hooks**: Tests for custom React hooks
- **Utils**: Tests for helper functions

### Integration Tests (`src/__tests__/integration/`)
- Firebase operations (game creation, updates, queries)
- Real-time subscriptions
- Authentication flows

### E2E Tests (`e2e/`)
- Complete user flows (host and player)
- Cross-browser testing
- Critical path validation

## Running Tests

### Unit Tests
```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npx playwright test --ui
```

## Test Coverage Goals

- **Unit Tests**: >80% coverage for utilities and components
- **Integration Tests**: Cover all Firebase operations
- **E2E Tests**: Cover critical user flows

## Writing Tests

### Unit Test Example
```typescript
import { formatNumber } from "@/lib/utils/bingo";

describe("formatNumber", () => {
  it("should format numbers correctly", () => {
    expect(formatNumber(1)).toBe("B1");
    expect(formatNumber(75)).toBe("O75");
  });
});
```

### Component Test Example
```typescript
import { render, screen } from "@testing-library/react";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";

describe("ErrorDisplay", () => {
  it("should display error message", () => {
    render(<ErrorDisplay error="Test error" />);
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('should allow host to create game', async ({ page }) => {
  await page.goto('/host/create');
  // ... test steps
});
```

## Error Handling

All errors are handled gracefully with:
- User-friendly error messages
- Error boundaries for React errors
- Firebase error translation
- Logging for debugging

## Continuous Integration

Tests should run on:
- Pull requests
- Before merging to main
- On deployment
