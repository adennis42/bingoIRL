# Test Directory Structure

```
src/__tests__/
├── __mocks__/           # Mock implementations
│   └── firebase.ts      # Firebase mocks (excluded from test runs)
├── components/           # Component tests
│   ├── BackButton.test.tsx
│   ├── Breadcrumbs.test.tsx
│   ├── Button.test.tsx
│   ├── ConfirmModal.test.tsx
│   ├── ErrorDisplay.test.tsx
│   ├── LoadingSpinner.test.tsx
│   ├── PatternCreator.test.tsx
│   ├── PatternVisualizer.test.tsx
│   ├── RoundCompleteModal.test.tsx
│   └── WinnerModal.test.tsx
├── hooks/               # Hook tests
│   ├── useAuth.test.ts
│   ├── useCalledNumbers.test.ts
│   ├── useGame.test.ts
│   └── usePlayers.test.ts
├── lib/                 # Library tests
│   ├── constants.test.ts
│   └── firebase/
│       └── converters.test.ts
└── utils/               # Utility tests
    ├── bingo.test.ts
    ├── bingo-edge.test.ts
    ├── errorHandler.test.ts
    ├── errorHandler-edge.test.ts
    ├── gameCode.test.ts
    └── patterns.test.ts
```

## Test Organization

- **Components**: Test UI components in isolation
- **Hooks**: Test custom React hooks with mocked dependencies
- **Utils**: Test pure utility functions
- **Lib**: Test library code (converters, constants)

## Writing New Tests

### Component Test Template
```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YourComponent } from "@/components/YourComponent";

describe("YourComponent", () => {
  it("should render correctly", () => {
    render(<YourComponent />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });
});
```

### Hook Test Template
```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { useYourHook } from "@/lib/hooks/useYourHook";

jest.mock("@/lib/dependency", () => ({
  dependencyFunction: jest.fn(),
}));

describe("useYourHook", () => {
  it("should return expected value", async () => {
    const { result } = renderHook(() => useYourHook());
    await waitFor(() => {
      expect(result.current.value).toBeDefined();
    });
  });
});
```

### Utility Test Template
```typescript
import { yourFunction } from "@/lib/utils/yourUtil";

describe("yourFunction", () => {
  it("should handle normal case", () => {
    expect(yourFunction("input")).toBe("expected");
  });

  it("should handle edge case", () => {
    expect(yourFunction("")).toBe("default");
  });
});
```
