# E2E Testing Guide

## Setup

1. **Install Playwright browsers** (already done):
   ```bash
   npx playwright install chromium
   ```

2. **Set up test environment variables** (optional):
   Create `.env.test.local`:
   ```env
   E2E_TEST_EMAIL=test@example.com
   E2E_TEST_PASSWORD=password123
   E2E_TEST_GAME_CODE=ABC123
   ```

3. **Start the dev server**:
   ```bash
   npm run dev
   ```

4. **Run E2E tests** (in another terminal):
   ```bash
   npm run test:e2e
   ```

## Test Structure

- `host-flow.spec.ts` - Tests for host game management
- `player-flow.spec.ts` - Tests for player game joining

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run specific test file
```bash
npx playwright test e2e/host-flow.spec.ts
```

### Run in UI mode (interactive)
```bash
npx playwright test --ui
```

### Run in headed mode (see browser)
```bash
npx playwright test --headed
```

### Debug a test
```bash
npx playwright test --debug
```

## Test Scenarios

### Host Flow
- ✅ Login as host
- ✅ Create new game
- ✅ Start game
- ✅ Call numbers
- ✅ Error handling for invalid login

### Player Flow
- ✅ Render join page
- ✅ Show error for invalid code
- ✅ Convert code to uppercase
- ✅ Limit code input length
- ✅ Handle loading states
- ⏭️ Full join flow (requires test game)

## Notes

- Tests use environment variables for credentials (optional)
- Some tests are skipped if they require Firebase setup
- Tests are designed to work with Firebase emulators or test project
- For full integration, set up Firebase emulators:
  ```bash
  firebase init emulators
  firebase emulators:start
  ```
