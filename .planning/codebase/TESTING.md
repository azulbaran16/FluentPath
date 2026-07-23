# Testing Patterns

**Analysis Date:** 2026-07-23

## Current State: No Tests

**Status:** This codebase has **no automated tests** currently.

- No test files found (no `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`)
- No test framework configured (no Jest, Vitest, Playwright, or Cypress)
- No test configuration files (`jest.config.js`, `vitest.config.ts`, etc.)
- No test scripts in `package.json` (only lint/build/dev scripts)

This is Phase 1 of the FluentPath project, which prioritizes feature development over test coverage. Testing is planned for later phases.

## Recommended Testing Setup

### Framework Choice

**Recommendation: Vitest**

Given the Next.js 16 + React 19 + TypeScript stack:

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom happy-dom
```

**Why Vitest over Jest:**
- Native ESM support (Next.js uses ES modules)
- Faster (Vite-based, no transformation overhead)
- Better TypeScript support out of the box
- Simpler configuration for modern projects
- Compatible with React Testing Library

### Configuration Template

**Create `vitest.config.ts`:**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

**Create `vitest.setup.ts`:**

```typescript
import "@testing-library/jest-dom";
```

**Add to `package.json`:**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Test File Organization

**Location Pattern: Co-located with source**

```
src/
├── lib/
│   ├── progress.ts
│   ├── progress.test.ts          ← Test file co-located
│   ├── curriculum.ts
│   └── curriculum.test.ts
├── components/
│   ├── Dashboard.tsx
│   ├── Dashboard.test.tsx
│   └── auth/
│       ├── AuthForm.tsx
│       └── AuthForm.test.tsx
└── app/
    └── api/
        ├── signup/
        │   ├── route.ts
        │   └── route.test.ts
```

**Naming Convention:**
- `[module].test.ts` for utility/hook testing
- `[component].test.tsx` for component testing
- `route.test.ts` for API route testing

## Test Structure Pattern

**Recommended Structure (from modern testing practices):**

```typescript
// Example: src/lib/progress.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useProgress } from "./progress";

describe("useProgress", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should hydrate from localStorage", () => {
      // Arrange
      localStorage.setItem("fluentpath:progress:v2", JSON.stringify({ xp: 100 }));
      
      // Act
      const { state, ready } = renderHook(() => useProgress());
      
      // Assert
      expect(ready).toBe(true);
      expect(state.xp).toBe(100);
    });

    it("should return empty state if localStorage is corrupt", () => {
      // Arrange
      localStorage.setItem("fluentpath:progress:v2", "invalid json");
      
      // Act
      const { state } = renderHook(() => useProgress());
      
      // Assert
      expect(state.xp).toBe(0);
    });
  });

  describe("completing scenarios", () => {
    it("should mark a scenario as completed", () => {
      // Arrange
      const { result } = renderHook(() => useProgress());
      
      // Act
      result.current.completeScenario("social", "coffee-shop");
      
      // Assert
      expect(result.current.state.completed["social/coffee-shop"]).toBe(true);
    });
  });
});
```

**Key Patterns:**
1. Use `describe()` to group related tests
2. One assertion per test (or closely related assertions)
3. Clear Arrange-Act-Assert structure
4. Use `beforeEach()` for setup and teardown
5. Use `vi.mock()` for external dependencies (see Mocking section)

## Mocking

**Framework:** Vitest's built-in `vi` module

**What to Mock:**

1. **External APIs (Anthropic, Stripe)**
   ```typescript
   vi.mock("@anthropic-ai/sdk", () => ({
     default: vi.fn().mockImplementation(() => ({
       messages: {
         create: vi.fn().mockResolvedValue({
           content: [{ type: "text", text: "Mocked response" }],
         }),
       },
     })),
   }));
   ```

2. **Database (Prisma)**
   ```typescript
   vi.mock("@/lib/db", () => ({
     prisma: {
       user: {
         findUnique: vi.fn(),
         create: vi.fn(),
         update: vi.fn(),
       },
     },
   }));
   ```

3. **Next.js Auth**
   ```typescript
   vi.mock("next-auth/react", () => ({
     useSession: vi.fn(() => ({
       data: { user: { id: "test-user", email: "test@example.com" } },
       status: "authenticated",
     })),
   }));
   ```

4. **localStorage** (for SSR tests)
   ```typescript
   const localStorageMock = {
     getItem: vi.fn(),
     setItem: vi.fn(),
     removeItem: vi.fn(),
     clear: vi.fn(),
   };
   global.localStorage = localStorageMock as any;
   ```

**What NOT to Mock:**

- Utility functions like `daysBetween()`, `today()` — test the real implementation
- Zod schemas — test validation logic
- Simple data transformations — keep tests focused on behavior
- Crypto functions (bcryptjs) — mock at integration test level only

## Testing Specific Code Paths

### API Routes (`src/app/api/*/route.ts`)

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/signup/route";

describe("POST /api/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a user with valid input", async () => {
    // Arrange
    const req = new Request("http://localhost/api/signup", {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        password: "SecurePass123",
      }),
    });

    // Act
    const response = await POST(req);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(data.ok).toBe(true);
  });

  it("should return 400 for missing email", async () => {
    // Arrange
    const req = new Request("http://localhost/api/signup", {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        password: "SecurePass123",
        // email missing
      }),
    });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(400);
  });

  it("should return 429 if rate limit exceeded", async () => {
    // Mock rate limiter to fail
    vi.mocked(rateLimit).mockReturnValueOnce({
      ok: false,
      remaining: 0,
      retryAfter: 60,
    });

    // Arrange
    const req = new Request("http://localhost/api/signup", {
      method: "POST",
      body: JSON.stringify({ /* ... */ }),
    });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(429);
  });
});
```

### React Hooks (`useProgress`, custom hooks)

```typescript
import { renderHook, act } from "@testing-library/react";
import { useProgress } from "@/lib/progress";

describe("useProgress hook", () => {
  it("should update XP when completing a scenario", () => {
    // Arrange
    const { result } = renderHook(() => useProgress());

    // Act
    act(() => {
      result.current.addXp(50);
    });

    // Assert
    expect(result.current.state.xp).toBe(50);
  });
});
```

### React Components

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthForm } from "@/components/auth/AuthForm";

describe("AuthForm component", () => {
  it("should render login form with email and password fields", () => {
    render(<AuthForm mode="login" />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("should submit form with valid data", async () => {
    render(<AuthForm mode="login" />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Wait for submission
    await screen.findByText(/success/i);
  });

  it("should show validation error for short password", async () => {
    render(<AuthForm mode="signup" />);

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await screen.findByText(/at least 8 characters/i);
  });
});
```

## Fixtures and Factories

**Location:** `src/__tests__/fixtures/` or `src/__tests__/factories/`

**Example - User Factory:**

```typescript
// src/__tests__/factories/user.ts
export function createUser(overrides?: Partial<User>): User {
  return {
    id: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    passwordHash: "$2a$12$...",
    referralCode: "ABC123",
    proUntil: null,
    ...overrides,
  };
}
```

**Example - Progress Fixture:**

```typescript
// src/__tests__/fixtures/progress.ts
export const sampleProgress = {
  completed: { "social/coffee-shop": true, "work/interview": true },
  xp: 250,
  streak: 5,
  level: "A2",
  goalXp: 30,
} as ProgressState;
```

## Coverage

**Targets (for reference; not currently enforced):**

- API routes: 80% coverage (critical path)
- Utility functions: 90% coverage
- React hooks: 85% coverage
- Components: 70% coverage (focus on user interactions, not implementation details)

**View Coverage:**

```bash
npm run test:coverage
```

Output will show line coverage, branch coverage, and function coverage by file.

## Test Types

### Unit Tests

**Scope:** Individual functions, hooks, utilities
**Location:** `*.test.ts` files
**Examples:**
- `daysBetween()` calculation
- `rateLimit()` behavior
- Zod schema validation
- Utility functions like `addDays()`, `today()`

### Component Tests

**Scope:** React components in isolation
**Location:** `*.test.tsx` files
**Focus:** User interactions, props handling, conditional rendering
**Examples:**
- `<Dashboard />` renders with/without data
- `<AuthForm />` validates and submits
- `<Tutor />` sends messages and displays responses

### Integration Tests (Future)

**Scope:** Multi-component flows (e.g., signup → login → dashboard)
**Framework:** Playwright or Cypress (not yet configured)
**Location:** `e2e/` directory
**Examples:**
- Complete signup flow
- Auth + billing flow
- Tutor conversation flow

## Common Patterns

### Async Testing

```typescript
it("should load user data", async () => {
  // Arrange
  const mock = vi.mocked(prisma.user.findUnique);
  mock.mockResolvedValueOnce({ id: "1", email: "test@example.com" });

  // Act
  const user = await getUser("1");

  // Assert
  expect(user.email).toBe("test@example.com");
  expect(mock).toHaveBeenCalledWith({ where: { id: "1" } });
});
```

### Error Testing

```typescript
it("should handle missing API key gracefully", () => {
  delete process.env.ANTHROPIC_API_KEY;

  // Should use stub mode without throwing
  const response = buildStubReply("Hello");
  expect(response).toContain("Demo mode");
});

it("should catch JSON parse errors", async () => {
  const req = new Request("http://localhost/api/signup", {
    method: "POST",
    body: "invalid json",
  });

  const response = await POST(req);
  expect(response.status).toBe(400);
});
```

### Mock Cleanup

```typescript
import { afterEach } from "vitest";

afterEach(() => {
  vi.clearAllMocks();  // Clear all mocks after each test
  localStorage.clear();  // Reset storage
});
```

## Next Steps (Recommended Phase)

1. **Add Vitest configuration** (vitest.config.ts + package.json scripts)
2. **Test critical API routes first** (signup, auth, tutor, billing)
3. **Test utility functions** (rate-limit, progress calculations, validation)
4. **Add React component tests** for Dashboard, AuthForm, Tutor
5. **Set up CI/CD test runs** (GitHub Actions or similar)
6. **Later: Add E2E tests** with Playwright for full user flows

---

*Testing analysis: 2026-07-23*
