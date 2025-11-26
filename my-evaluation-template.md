# Code Evaluation Template

## Project Information

| Field | Value |
|-------|-------|
| **Project Name** | [Name] |
| **Date** | [YYYY-MM-DD] |
| **Evaluator** | [Name] |
| **Version/Branch** | [Version or branch name] |
| **Scope** | [What is being evaluated] |

### Project Type (check all that apply)

- [ ] Frontend only (no backend)
- [ ] Backend/API
- [ ] Full-stack
- [ ] Library/Package
- [ ] CLI Tool
- [ ] Has authentication
- [ ] Has database
- [ ] Handles file uploads
- [ ] Processes payments

*Use project type to determine which checks are relevant. Mark non-applicable items as "N/A".*

---

## Quick Assessment (10-Point Rapid Review)

*Use this for quick evaluations. For thorough reviews, skip to the detailed sections.*

| # | Check | Pass/Fail | Notes |
|---|-------|-----------|-------|
| 1 | No secrets/credentials in code | | |
| 2 | Dependencies have no critical vulnerabilities | | |
| 3 | Code is consistently formatted | | |
| 4 | Functions/components have clear names | | |
| 5 | Complex logic has explanatory comments | | |
| 6 | README explains setup and usage | | |
| 7 | Error states are handled gracefully | | |
| 8 | No obvious code duplication | | |
| 9 | Types/interfaces are well-defined | | |
| 10 | Tests exist for critical paths | | |

**Quick Score: __/10 passing**

**Proceed to detailed review?** [ ] Yes [ ] No - Quick assessment sufficient

---

## 1. Security Assessment

*Focus on items relevant to your project type. Mark others as "N/A".*

### 1.1 Universal Security Checks

| Check | Status | Severity | Notes |
|-------|--------|----------|-------|
| No secrets/API keys in source code | | | |
| Environment variables used for config | | | |
| Dependencies audited (npm audit, etc.) | | | |
| Lock file present and committed | | | |
| Errors don't expose sensitive info to users | | | |
| HTTPS enforced (if deployed) | | | |

### 1.2 Input & Output Handling

| Check | Status | Severity | Notes |
|-------|--------|----------|-------|
| User input validated before use | | | |
| Output properly encoded/escaped | | | |
| File uploads validated (if applicable) | | | |

### 1.3 Authentication & Sessions (if applicable)

| Check | Status | Severity | Notes |
|-------|--------|----------|-------|
| Tokens stored securely (not localStorage for sensitive) | | | |
| Session/token expiration handled | | | |
| Auth state managed properly | | | |

<details>
<summary><strong>Backend Security Deep Dive (expand if applicable)</strong></summary>

| Check | Status | Severity | Notes |
|-------|--------|----------|-------|
| SQL injection prevention (parameterized queries) | | | |
| Password hashing (bcrypt, argon2) | | | |
| Rate limiting implemented | | | |
| CORS configured correctly | | | |
| RBAC/permissions enforced | | | |
| Sensitive data encrypted at rest | | | |
| Audit logging for sensitive actions | | | |

</details>

### Security Score: __/10

| Severity | Count | Items |
|----------|-------|-------|
| Critical | | |
| High | | |
| Medium | | |
| Low | | |

---

## 2. Maintainability Assessment

### 2.1 Code Organization

| Check | Status | Notes |
|-------|--------|-------|
| Logical folder/file structure | | |
| Separation of concerns (UI/logic/data) | | |
| Single responsibility principle followed | | |
| File sizes reasonable (<300 LOC preferred) | | |
| No circular dependencies | | |

### 2.2 Modularity & Reusability

| Check | Status | Notes |
|-------|--------|-------|
| DRY principle followed (no copy-paste) | | |
| Reusable utilities extracted | | |
| Components/modules loosely coupled | | |
| Clear interfaces between modules | | |
| Configuration externalized | | |

### 2.3 Error Handling

| Check | Status | Notes |
|-------|--------|-------|
| Errors caught and handled appropriately | | |
| Error boundaries (React) or try-catch used | | |
| User-friendly error messages | | |
| Errors logged for debugging | | |
| Graceful degradation where possible | | |

### 2.4 Technical Debt

| Check | Status | Notes |
|-------|--------|-------|
| No unaddressed TODO/FIXME comments | | |
| No commented-out code | | |
| No magic numbers/strings (use constants) | | |
| No overly complex conditionals | | |
| No functions doing too many things | | |

### 2.5 Testing

| Check | Status | Notes |
|-------|--------|-------|
| Unit tests for critical logic | | |
| Integration tests for key flows | | |
| Tests are readable and maintainable | | |
| Edge cases covered | | |
| Mocking used appropriately | | |

### 2.6 Performance Considerations

| Check | Status | Notes |
|-------|--------|-------|
| No obvious performance bottlenecks | | |
| Expensive operations memoized/cached | | |
| No unnecessary re-renders (React) | | |
| Large lists virtualized (if applicable) | | |
| Bundle size reasonable | | |

### Maintainability Score: __/10

---

## 3. Readability Assessment

### 3.1 Naming

| Check | Status | Notes |
|-------|--------|-------|
| Variables describe their content | | |
| Functions describe their action (verb-based) | | |
| Booleans prefixed appropriately (is, has, can, should) | | |
| No cryptic abbreviations | | |
| Consistent naming conventions throughout | | |

### 3.2 Code Structure

| Check | Status | Notes |
|-------|--------|-------|
| Functions are short and focused | | |
| Nesting depth limited (max 3 levels) | | |
| Early returns reduce complexity | | |
| Guard clauses used appropriately | | |
| Related code grouped together | | |

### 3.3 Formatting & Style

| Check | Status | Notes |
|-------|--------|-------|
| Consistent indentation | | |
| Reasonable line length (<100 chars) | | |
| Linter configured and passing | | |
| Formatter configured (Prettier, etc.) | | |
| Consistent patterns throughout codebase | | |

### 3.4 Type Safety

| Check | Status | Notes |
|-------|--------|-------|
| TypeScript or type annotations used | | |
| Strict mode enabled (if TS) | | |
| No `any` types without justification | | |
| Interfaces/types clearly defined | | |
| Null/undefined handled explicitly | | |

### Readability Score: __/10

---

## 4. Documentation Assessment

### 4.1 Code-Level Documentation

| Check | Status | Notes |
|-------|--------|-------|
| Complex logic has "why" comments | | |
| Public APIs documented (JSDoc/TSDoc) | | |
| No redundant/obvious comments | | |
| Comments accurate and up-to-date | | |
| Edge cases and gotchas noted | | |

### 4.2 Project Documentation

| Check | Status | Notes |
|-------|--------|-------|
| README with clear project overview | | |
| Installation/setup instructions | | |
| Development workflow documented | | |
| Environment variables listed | | |
| Architecture decisions explained | | |

### 4.3 API Documentation (if applicable)

| Check | Status | Notes |
|-------|--------|-------|
| Endpoints documented | | |
| Request/response formats shown | | |
| Error responses listed | | |
| Working examples provided | | |

### 4.4 Change Management

| Check | Status | Notes |
|-------|--------|-------|
| Meaningful commit messages | | |
| Breaking changes clearly noted | | |
| CHANGELOG maintained (for libraries) | | |

### Documentation Score: __/10

---

## 5. Summary

### Scoring

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Security | __/10 | 25% | |
| Maintainability | __/10 | 25% | |
| Readability | __/10 | 25% | |
| Documentation | __/10 | 25% | |
| **Total** | | 100% | **__/10** |

### Issues Found

| Issue | Category | Severity | Location | Recommendation |
|-------|----------|----------|----------|----------------|
| | | Critical | | |
| | | High | | |
| | | Medium | | |
| | | Low | | |

**Severity Guide:**
- **Critical**: Security vulnerability or will cause failures in production
- **High**: Significant problem affecting maintainability or reliability
- **Medium**: Should be addressed but not blocking
- **Low**: Nice to fix, minor improvement

### Strengths
1.
2.
3.

### Key Improvements Needed
1.
2.
3.

### Action Items

**Must Fix (Critical/High):**
- [ ]

**Should Fix (Medium):**
- [ ]

**Consider (Low):**
- [ ]

---

## 6. Version Comparison (Optional)

*Use when comparing multiple implementations*

| Criteria | Version A | Version B | Version C | Winner |
|----------|-----------|-----------|-----------|--------|
| Security | /10 | /10 | /10 | |
| Maintainability | /10 | /10 | /10 | |
| Readability | /10 | /10 | /10 | |
| Documentation | /10 | /10 | /10 | |
| **Overall** | | | | |

### Recommendation

**Recommended Version:**

**Rationale:**

**If combining approaches:**

---

## Appendix

### A. Files Reviewed
| File | Lines | Notes |
|------|-------|-------|
| | | |

### B. Tools Used
- [ ] ESLint
- [ ] Prettier
- [ ] TypeScript compiler
- [ ] npm audit / yarn audit
- [ ] Bundle analyzer
- [ ] Other:

### C. N/A Justifications
*Document why sections were marked N/A*

| Section | Reason |
|---------|--------|
| | |
