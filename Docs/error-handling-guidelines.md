# Error Handling Guidelines

This file defines how errors must be generated, propagated, logged, and displayed.

## 1. Goals
- Provide clear, consistent error messages.
- Never expose sensitive data.
- Separate developer-facing and user-facing messages.
- Ensure AI-generated code follows predictable patterns.

## 2. Error Types (Frontend)
- NetworkError
- ValidationError
- AuthError
- SyncError
- NotFoundError
- UnknownError

Structure:
{
  name: string;
  message: string;
  cause?: any;
}

## 3. Error Types (Backend)
- BadRequestError (400)
- UnauthorizedError (401)
- ForbiddenError (403)
- NotFoundError (404)
- ConflictError (409)
- InternalError (500)

## 4. Error Format (Backend → Frontend)
Always return JSON:
{
  "error": {
    "type": "BadRequestError",
    "message": "Title is required."
  }
}

## 5. Backend Practices
- Throw typed errors only.
- Middleware `errorHandler` must:
  - Log full error to server logs.
  - Return cleaned JSON error to client.
- Do not leak stack traces in production.

## 6. Frontend Practices
- Wrap async calls in try/catch.
- Use React Query `onError` hooks.
- Show friendly toast or banner:
  - “Something went wrong. Please try again.”
- Log developer-level details to console in dev mode only.

## 7. Sync Error Handling
- If version mismatch (409 Conflict):
  - Trigger conflict resolution UI.
- If offline:
  - Queue change & show “Offline (unsynced)” badge.

## 8. Global Error Boundary
- A React error boundary must catch unexpected UI errors.
- Show a “Something broke” fallback component.

## 9. Testing Errors
- All backend routes must have tests for:
  - Missing fields
  - Invalid types
  - Unauthorized access
  - Conflict cases
- Frontend must test:
  - UI shown on error
  - Retry logic
  - Offline behavior

