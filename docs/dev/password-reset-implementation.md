# Password Reset - Technical Specification

> **Feature Type**: Full-stack
> **Status**: Proposed
> **Last Updated**: 2025-11-26
> **Related User Guide**: [How to Reset Your Password](../user/how-to-reset-password.md)

## Overview

This document specifies the implementation of a password reset feature for the expense-tracker-ai application. This feature will allow users to securely reset their password via email when they've forgotten their credentials.

**Prerequisites**: This feature requires implementing an authentication system first. The application currently has no authentication layer.

## Architecture

### Proposed File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── register/
│   │   │   └── page.tsx              # Registration page
│   │   ├── forgot-password/
│   │   │   └── page.tsx              # Request password reset
│   │   └── reset-password/
│   │       └── page.tsx              # Reset password form (with token)
│   └── api/
│       └── auth/
│           ├── forgot-password/
│           │   └── route.ts          # POST: Send reset email
│           ├── reset-password/
│           │   └── route.ts          # POST: Reset password with token
│           └── verify-reset-token/
│               └── route.ts          # GET: Verify token validity
├── components/
│   └── auth/
│       ├── ForgotPasswordForm.tsx    # Email input form
│       ├── ResetPasswordForm.tsx     # New password form
│       └── PasswordStrengthIndicator.tsx
├── lib/
│   ├── auth/
│   │   ├── tokens.ts                 # Token generation/verification
│   │   ├── password.ts               # Password hashing utilities
│   │   └── email.ts                  # Email sending utilities
│   └── db/
│       └── schema.ts                 # Database schema (users, reset_tokens)
└── types/
    └── auth.ts                       # Auth-related TypeScript types
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PASSWORD RESET FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

1. REQUEST RESET
   ┌──────────┐    POST /api/auth/forgot-password    ┌──────────┐
   │  User    │ ─────────────────────────────────────▶│  Server  │
   │ (email)  │                                       │          │
   └──────────┘                                       └────┬─────┘
                                                          │
                                                          ▼
                                                   ┌──────────────┐
                                                   │ 1. Validate  │
                                                   │    email     │
                                                   │ 2. Generate  │
                                                   │    token     │
                                                   │ 3. Store     │
                                                   │    token     │
                                                   │ 4. Send      │
                                                   │    email     │
                                                   └──────────────┘

2. RESET PASSWORD
   ┌──────────┐    GET /reset-password?token=xxx     ┌──────────┐
   │  User    │ ─────────────────────────────────────▶│  Server  │
   │ (click   │                                       │          │
   │  link)   │◀───────────── Reset form ────────────│          │
   └──────────┘                                       └──────────┘
        │
        │         POST /api/auth/reset-password
        │         { token, newPassword }
        ▼
   ┌──────────┐                                       ┌──────────┐
   │  User    │ ─────────────────────────────────────▶│  Server  │
   │ (submit  │                                       │          │
   │  form)   │◀──────────── Success/Error ──────────│          │
   └──────────┘                                       └────┬─────┘
                                                          │
                                                          ▼
                                                   ┌──────────────┐
                                                   │ 1. Verify    │
                                                   │    token     │
                                                   │ 2. Hash new  │
                                                   │    password  │
                                                   │ 3. Update    │
                                                   │    user      │
                                                   │ 4. Invalidate│
                                                   │    token     │
                                                   └──────────────┘
```

## API Reference

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/forgot-password` | Request a password reset email |
| GET | `/api/auth/verify-reset-token` | Verify if a reset token is valid |
| POST | `/api/auth/reset-password` | Reset password using valid token |

### POST `/api/auth/forgot-password`

Request a password reset email.

**Request Body:**
```typescript
{
  email: string;
}
```

**Response (200 OK):**
```typescript
{
  success: true;
  message: "If an account exists with this email, a reset link has been sent.";
}
```

**Notes:**
- Always returns success even if email doesn't exist (prevents email enumeration)
- Rate limited to 3 requests per email per hour

### GET `/api/auth/verify-reset-token`

Verify if a reset token is valid before showing the reset form.

**Query Parameters:**
- `token` (string, required): The reset token from the email link

**Response (200 OK):**
```typescript
{
  valid: boolean;
  email?: string;  // Masked email for display (e.g., "j***@example.com")
}
```

**Error Response (400 Bad Request):**
```typescript
{
  valid: false;
  error: "TOKEN_EXPIRED" | "TOKEN_INVALID" | "TOKEN_USED";
}
```

### POST `/api/auth/reset-password`

Reset the user's password using a valid token.

**Request Body:**
```typescript
{
  token: string;
  password: string;
  confirmPassword: string;
}
```

**Response (200 OK):**
```typescript
{
  success: true;
  message: "Password has been reset successfully.";
}
```

**Error Responses:**
- `400`: Invalid token, password mismatch, or weak password
- `429`: Too many attempts

### Types

```typescript
// src/types/auth.ts

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;           // Hashed token stored in DB
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface TokenVerificationResult {
  valid: boolean;
  email?: string;
  error?: 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'TOKEN_USED';
}
```

## Implementation Details

### Key Components

#### ForgotPasswordForm (`src/components/auth/ForgotPasswordForm.tsx`)

**Purpose**: Collects user's email to initiate password reset.

**Props:**
```typescript
interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}
```

**Key Logic:**
- Email validation before submission
- Loading state during API call
- Success message display (always positive to prevent enumeration)
- Cooldown timer to prevent spam clicking

#### ResetPasswordForm (`src/components/auth/ResetPasswordForm.tsx`)

**Purpose**: Allows user to set a new password using a valid token.

**Props:**
```typescript
interface ResetPasswordFormProps {
  token: string;
  email: string;  // Masked email for display
  onSuccess?: () => void;
  onError?: (error: string) => void;
}
```

**Key Logic:**
- Password strength validation
- Password confirmation matching
- Real-time password strength indicator
- Token expiration handling

#### PasswordStrengthIndicator (`src/components/auth/PasswordStrengthIndicator.tsx`)

**Purpose**: Visual indicator of password strength.

**Props:**
```typescript
interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}
```

**Requirements to display:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Token Generation & Security

```typescript
// src/lib/auth/tokens.ts

import { randomBytes, createHash } from 'crypto';

const TOKEN_EXPIRY_HOURS = 1;

export function generateResetToken(): { token: string; hash: string } {
  // Generate a secure random token
  const token = randomBytes(32).toString('hex');

  // Hash the token for storage (never store plain tokens)
  const hash = createHash('sha256').update(token).digest('hex');

  return { token, hash };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function getTokenExpiry(): Date {
  return new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
}
```

### Password Hashing

```typescript
// src/lib/auth/password.ts

import { hash, compare } from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain a special character');
  }

  return { valid: errors.length === 0, errors };
}
```

### State Management

The password reset flow uses local component state (useState) since:
- It's a self-contained flow with no global state requirements
- Form state doesn't need to persist across navigation
- Each step is independent

**Form State Structure:**
```typescript
interface ForgotPasswordState {
  email: string;
  isLoading: boolean;
  isSubmitted: boolean;
  error: string | null;
}

interface ResetPasswordState {
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
  tokenValid: boolean | null;
}
```

### Dependencies

**New packages required:**

| Package | Purpose | Version |
|---------|---------|---------|
| `bcrypt` | Password hashing | ^5.1.1 |
| `nodemailer` | Email sending | ^6.9.x |
| `@prisma/client` | Database ORM (recommended) | ^5.x |
| `zod` | Request validation | ^3.x |

**Recommended auth solution alternatives:**
- **NextAuth.js** - Full auth solution with built-in providers
- **Clerk** - Managed auth with UI components
- **Supabase Auth** - If using Supabase for database

## Database Schema

### Using Prisma (Recommended)

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  resetTokens   PasswordResetToken[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model PasswordResetToken {
  id        String    @id @default(cuid())
  token     String    @unique  // Hashed token
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  @@index([token])
  @@index([userId])
}
```

## Configuration

### Environment Variables

```bash
# .env.local

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker"

# Email (using SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourapp.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Security
PASSWORD_RESET_TOKEN_EXPIRY_HOURS="1"
PASSWORD_RESET_RATE_LIMIT="3"  # requests per hour per email
```

## Error Handling

### API Error Responses

All API errors follow this structure:

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;  // Field-level validation errors
  };
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `TOKEN_INVALID` | 400 | Token doesn't exist |
| `TOKEN_EXPIRED` | 400 | Token has expired |
| `TOKEN_USED` | 400 | Token already used |
| `PASSWORD_WEAK` | 400 | Password doesn't meet requirements |
| `PASSWORD_MISMATCH` | 400 | Passwords don't match |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### User-Facing Error Messages

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  TOKEN_INVALID: "This reset link is invalid. Please request a new one.",
  TOKEN_EXPIRED: "This reset link has expired. Please request a new one.",
  TOKEN_USED: "This reset link has already been used. Please request a new one.",
  PASSWORD_WEAK: "Please choose a stronger password.",
  PASSWORD_MISMATCH: "Passwords do not match.",
  RATE_LIMITED: "Too many requests. Please try again later.",
  INTERNAL_ERROR: "Something went wrong. Please try again.",
};
```

## Security Considerations

### Token Security
- Tokens are cryptographically random (32 bytes)
- Only hashed tokens are stored in the database
- Tokens expire after 1 hour
- Tokens are single-use and invalidated after successful reset
- Old tokens are invalidated when a new reset is requested

### Rate Limiting
- 3 reset requests per email per hour
- 10 password reset attempts per token
- IP-based rate limiting for the forgot-password endpoint

### Email Security
- Generic success message prevents email enumeration
- Reset emails include security warnings
- Links are HTTPS-only in production

### Password Security
- Passwords hashed with bcrypt (12 rounds)
- Strong password requirements enforced
- Password history check (optional - prevent reuse of last 5 passwords)

## Testing

### Test Cases

**Unit Tests:**
- Token generation produces unique tokens
- Token hashing is deterministic
- Password validation catches weak passwords
- Email validation rejects invalid formats

**Integration Tests:**
- Forgot password flow sends email for valid users
- Forgot password doesn't leak user existence
- Reset password works with valid token
- Reset password fails with expired token
- Reset password fails with used token
- Rate limiting blocks excessive requests

**E2E Tests:**
- Complete forgot password to reset password flow
- Error states display correctly
- Success redirects to login

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Performance Considerations

### Caching
- No caching on auth endpoints (security)
- Rate limit counters stored in Redis (if available) or memory

### Database Indexes
- Index on `PasswordResetToken.token` for fast lookups
- Index on `PasswordResetToken.userId` for cleanup queries

### Cleanup
- Scheduled job to delete expired tokens (daily)
- Tokens automatically cleaned up on successful reset

## Implementation Phases

### Phase 1: Prerequisites
- [ ] Set up database (PostgreSQL recommended)
- [ ] Add Prisma ORM
- [ ] Implement basic user registration/login
- [ ] Set up email service

### Phase 2: Core Implementation
- [ ] Create database schema for reset tokens
- [ ] Implement token generation utilities
- [ ] Create forgot-password API endpoint
- [ ] Create reset-password API endpoint
- [ ] Create verify-token API endpoint

### Phase 3: UI Components
- [ ] Build ForgotPasswordForm component
- [ ] Build ResetPasswordForm component
- [ ] Build PasswordStrengthIndicator component
- [ ] Create forgot-password page
- [ ] Create reset-password page

### Phase 4: Security & Polish
- [ ] Implement rate limiting
- [ ] Add email templates
- [ ] Add comprehensive error handling
- [ ] Security audit

### Phase 5: Testing
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Manual QA testing

## Future Improvements

- **Magic link login**: Allow passwordless login via email
- **SMS backup**: Send reset codes via SMS as backup
- **Security questions**: Optional additional verification
- **Account lockout**: Lock account after multiple failed resets
- **Audit logging**: Track all password reset attempts
- **Admin panel**: Allow admins to trigger password resets
