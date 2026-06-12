# Partrix Security Implementation Guide

## Production-Level Security Features

This document outlines the security measures implemented in Partrix to protect against common vulnerabilities.

---

## 1. Authentication Security ✅

### Password Policy
- **Minimum Length**: 12 characters (increased from 8)
- **Complexity Requirements**:
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (@$!%*?&^#)
- **Common Password Prevention**: Blocks 50+ common passwords and patterns

### Password Hashing
- **Algorithm**: bcryptjs with 12 salt rounds
- **Protection**: Constant-time comparison prevents timing attacks
- **Migration Path**: Old passwords can be rehashed on next login

### JWT Token Management
- **Algorithm**: HS256 with 32-character minimum secret
- **Expiration**: 7 days (consider reducing to 24 hours in production)
- **Issuer Validation**: All tokens validated against the legacy-compatible `rentflow` issuer
- **Algorithm Verification**: Tokens must have `issuer: "rentflow"` to preserve existing session compatibility

### Session Management
- **HTTP-Only Cookies**: Prevents XSS token theft
- **Secure Flag**: Only sent over HTTPS in production
- **SameSite=Strict**: Prevents CSRF token leakage
- **Session Validation**: Checks user `status === "ACTIVE"`
- **Rate Limiting**: All auth endpoints rate-limited

---

## 2. Authorization & Access Control ✅

### Role-Based Access Control (RBAC)
```
ADMIN    - Full system access
MANAGER  - Department-level management
STAFF    - Limited operational access
```

### Implementation Points
- **Middleware**: `proxy.ts` enforces role checks
- **Route Guards**: `ProtectedPage.tsx` client-side validation
- **API Endpoints**: `getAuthenticatedUser()` verifies auth status
- **Admin Routes**: `/admin` only accessible to `ADMIN` role

### User Status Validation
- Users must have `status === "ACTIVE"` to maintain sessions
- Invalid/suspended users are logged out automatically
- Session endpoint validates user status

---

## 3. Input Validation ✅

### Zod Schema Validation
All user inputs validated with Zod before processing:

#### Authentication
```typescript
- Email: Valid format, max 254 chars, lowercase
- Password: Complex requirements (see above)
- Name: Max 100 chars, letters/spaces/hyphens only
```

#### Customers
```typescript
- Names: Regex validated, max 100 chars each
- Email: Valid format, optional
- Phone: Numeric format, max 20 chars
- Address: Regex validated, max 500 chars
- Notes: Max 2000 chars
```

#### File Uploads
```typescript
- MIME Type: Whitelist validated
- File Size: Max 5MB for images
- Filename: Sanitized to prevent directory traversal
- Path Validation: Prevents escape from upload directory
```

### Benefits
- **Type Safety**: TypeScript integration prevents runtime errors
- **Consistent Validation**: Same rules across all endpoints
- **Error Messages**: User-friendly, non-leaking error responses

---

## 4. API Protection ✅

### Rate Limiting
Protects against brute force and DoS attacks:

```
auth-login:   10 attempts per 60 seconds
auth-signup:  10 attempts per 60 seconds
auth-logout:  20 attempts per 60 seconds
auth-session: 30 attempts per 60 seconds
inventory-upload: Limited per minute
```

**Note**: In-memory store works for single server. For multi-server, migrate to Redis/Memcached.

### Request Validation
- All API endpoints require authentication (except `/api/auth/*`)
- Request method validation (GET vs POST, etc.)
- Content-Type validation for JSON payloads
- ID parameter validation (UUID format)

### SQL Injection Protection ✅
- **Prisma ORM**: Uses parameterized queries by default
- **No string concatenation**: All queries use typed parameters
- **Type-safe**: TypeScript enforces correct parameter types
- **Migration scripts**: Prisma generates safe SQL migrations

---

## 5. Security Headers ✅

### Implemented Headers
```
Content-Security-Policy: Restricts script/style/resource loading
X-Frame-Options: DENY - Prevents clickjacking
X-Content-Type-Options: nosniff - Prevents MIME sniffing
X-XSS-Protection: 0 - Disable legacy XSS filter
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: Disabled geolocation, camera, microphone
Strict-Transport-Security: 63 days (production only)
X-Permitted-Cross-Domain-Policies: none
```

### CSP Details
- **Strict in Production**: No inline scripts allowed
- **Permissive in Development**: Allows localhost for hot reload
- **Frame-ancestors: none**: Prevents embedding in iframes

---

## 6. Cookie Security ✅

### AUTH_COOKIE_OPTIONS
```typescript
{
  name: "rentflow_token", // legacy-compatible cookie name
  httpOnly: true,      // ✅ Prevents XSS theft
  secure: true,        // ✅ HTTPS only (production)
  sameSite: "strict",  // ✅ Prevents CSRF
  path: "/",
  maxAge: 604800,      // 7 days
}
```

### Cookie Handling
- Cookies cleared on logout
- Cookies validated on every request
- Sensitive data NOT stored in cookies (password, etc.)
- Cookie size optimized to minimum necessary

---

## 7. Environment Variable Security ✅

### Validation with Zod
```typescript
DATABASE_URL: string (min 1 char) - Required
JWT_SECRET: string (min 32 chars) - Strong requirement
NODE_ENV: enum (development|production|test)
RATE_LIMIT_WINDOW_SECONDS: positive number
RATE_LIMIT_MAX_REQUESTS: positive integer
```

### Best Practices
- ❌ Never commit `.env` to git
- ✅ Use `.env.example` as template
- ✅ Validate on startup - fail fast if missing
- ✅ Minimum entropy for JWT_SECRET (32 chars)
- ✅ Production-specific configuration (HSTS, CSP)

---

## 8. File Upload Security ✅

### Validation Layers
1. **MIME Type**: Whitelist check (jpg, png, webp, gif only)
2. **File Size**: Maximum 5MB
3. **Filename Sanitization**: Random UUID + extension
4. **Directory Traversal Prevention**: Path resolution validation
5. **Rate Limiting**: Max uploads per time window

### Upload Endpoint (`/api/inventory/upload`)
- Requires authentication
- Validates file contents
- Generates secure filenames
- Stores outside public web root when possible
- Implements rate limiting

---

## 9. Error Handling & Logging ✅

### Error Response Patterns
```typescript
// Development: Detailed error information
// Production: Generic messages to prevent info leakage

try {
  // Operation
} catch (error) {
  return apiError("Generic message", 500);
  // Detailed error logged to security service
}
```

### Sensitive Information Handling
- ❌ No passwords in logs
- ❌ No full SQL queries in error messages
- ❌ No stack traces to client (production)
- ✅ Structured logging with sensitive fields redacted
- ✅ Security events logged separately

### Security Events to Log
- Login attempts (success and failure)
- Unauthorized access attempts
- File uploads
- Data exports
- Admin actions
- Token validation failures

---

## 10. Database Security ✅

### Prisma Security
- **Parameterized Queries**: All queries use parameters
- **Type Safety**: TypeScript prevents SQL injection
- **Migrations**: Version-controlled, reviewed migrations
- **Connection String**: Validated, encrypted at rest

### Data Protection
- User passwords hashed (never stored plaintext)
- Sensitive data encrypted in transit (HTTPS)
- Audit logs track data access
- User status prevents access by inactive accounts

---

## 11. CSRF Protection 🔄

### Current Implementation
- **SameSite Cookies**: Provides first-line CSRF defense
- **Origin Validation**: POST requests validated

### Recommended Enhancements
- CSRF tokens for all POST/PUT/DELETE requests
- CSRF tokens in hidden form fields
- Separate CSRF token endpoint
- Double-submit cookies pattern

### Implementation Roadmap
```typescript
// 1. Generate CSRF tokens
POST /api/csrf-token -> { token: "..." }

// 2. Include in forms
<input type="hidden" name="csrf_token" value="..." />

// 3. Validate in middleware
const token = request.body.csrf_token;
validateCSRFToken(token, request);
```

---

## 12. Timing Attack Prevention ✅

### Password Verification
- Uses `bcrypt.compare()` which is timing-safe
- Same error message for invalid email/password
- No difference in response time for existing vs non-existing users

### Token Comparison
- JWT validation doesn't leak timing information
- All failed validations return same error message

---

## 13. Production Deployment Checklist

Before deploying to production:

### Environment
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET` (use `crypto.randomBytes(32)`)
- [ ] Configure `DATABASE_URL` with credentials
- [ ] Set up HTTPS with valid certificate
- [ ] Configure rate limiting backend (Redis/Memcached)
- [ ] Set `ALLOWED_ORIGIN` environment variable

### Security Headers
- [ ] Verify CSP is not too permissive
- [ ] Enable HSTS header
- [ ] Test security headers with securityheaders.com

### Monitoring
- [ ] Set up security event logging
- [ ] Monitor failed login attempts
- [ ] Alert on rate limit violations
- [ ] Track file uploads
- [ ] Monitor admin actions

### Database
- [ ] Enable database encryption at rest
- [ ] Configure database backups
- [ ] Implement database activity monitoring
- [ ] Restrict database access to application server

### Dependencies
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Keep dependencies updated
- [ ] Use `npm ci` instead of `npm install` in CI/CD

### Testing
- [ ] Test rate limiting with load testing
- [ ] Verify CORS works correctly
- [ ] Test file upload with edge cases
- [ ] Verify error messages don't leak info

---

## 14. Security Utilities

### Available in `lib/securityUtils.ts`
- `validateOrigin()`: Check request origin
- `sanitizeInput()`: XSS prevention
- `sanitizeSearchQuery()`: SQL injection prevention for search
- `generateSecureToken()`: Cryptographically secure tokens
- `validateFileUpload()`: File upload validation
- `logSecurityEvent()`: Audit trail logging

### Usage Examples
```typescript
// Sanitize user input
const safe = sanitizeInput(userInput);

// Validate file upload
const validation = validateFileUpload(file, allowedTypes, maxSize);
if (!validation.valid) {
  return error(validation.error);
}

// Generate CSRF token
const token = await generateSecureToken(32);

// Log security event
await logSecurityEvent("LOGIN_ATTEMPT", userId, {
  ip: getUserIP(request),
  success: true,
});
```

---

## 15. Known Limitations & Future Improvements

### Current Limitations
1. **Rate Limiting**: In-memory store (single server only)
2. **CSRF Protection**: Not yet fully implemented
3. **Token Refresh**: No refresh token mechanism
4. **Audit Logging**: Needs integration with logging service
5. **2FA**: Not yet implemented

### Recommended Improvements
1. **Multi-factor Authentication**: TOTP/WebAuthn support
2. **Refresh Tokens**: Implement token refresh mechanism
3. **OAuth2/OIDC**: Enterprise SSO support
4. **API Key Management**: For programmatic access
5. **IP Whitelisting**: Restrict admin access to specific IPs
6. **Session Revocation**: Immediate logout across all devices
7. **Breach Detection**: Monitor for compromised credentials
8. **Encryption**: End-to-end encryption for sensitive data
9. **WAF Integration**: Web Application Firewall rules
10. **Compliance**: GDPR, HIPAA, SOC2 compliance

---

## 16. Security Resources

### OWASP References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Authorization Testing](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

### Tools
- [securityheaders.com](https://securityheaders.com/) - Test security headers
- [csp-evaluator](https://csp-evaluator.withgoogle.com/) - Evaluate CSP
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Check dependencies
- [OWASP ZAP](https://www.zaproxy.org/) - Security scanning

---

## 17. Contact & Reporting

### Security Issues
If you discover a security vulnerability, please email security@partrix.app instead of using the issue tracker.

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

---

## Version History

| Version | Date       | Changes |
|---------|------------|---------|
| 1.0     | 2026-05-25 | Initial security audit implementation |

---

Last Updated: 2026-05-25
