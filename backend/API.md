# InterPrep API Documentation

> **Base URL**: `/api`
> **Auth**: Bearer JWT via `Authorization: Bearer <token>` header
> **Content-Type**: `application/json`

---

## Authentication

### POST `/api/auth/signup`
Create a new user account.

**Rate Limit**: 30 requests / 15 minutes

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | ✅ | 2–80 chars, trimmed |
| `email` | string | ✅ | Valid email, unique, lowercased |
| `password` | string | ✅ | 8–120 chars |

**Response** `201`:
```json
{
  "user": { "id": "...", "name": "Alice", "email": "alice@test.com", "role": "user", ... },
  "token": "eyJhbG..."
}
```

**Errors**: `400` validation, `409` duplicate email

---

### POST `/api/auth/login`
Issue a JWT for valid credentials.

**Rate Limit**: 30 requests / 15 minutes

| Field | Type | Required |
|-------|------|----------|
| `email` | string | ✅ |
| `password` | string | ✅ |

**Response** `200`:
```json
{
  "user": { "id": "...", "name": "...", "email": "...", "role": "...", ... },
  "token": "eyJhbG..."
}
```

**Errors**: `401` invalid credentials

---

### GET `/api/auth/me`
🔒 **Auth Required**

Returns the authenticated user.

**Response** `200`:
```json
{ "user": { "id": "...", "name": "...", "email": "...", "role": "...", ... } }
```

---

### POST `/api/auth/logout`
🔒 **Auth Required**

Stateless logout (client should drop the token).

**Response**: `204 No Content`

---

## User Profile

### PATCH `/api/users/me`
🔒 **Auth Required**

Update display name, preferred domain, or avatar.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ❌ | 2–80 chars |
| `preferredDomain` | string\|null | ❌ | Domain slug or ObjectId. `null` to clear. |
| `avatarUrl` | string | ❌ | Valid URL or empty string |

**Response** `200`: `{ "user": { ... } }`

---

### POST `/api/users/me/password`
🔒 **Auth Required**

Change password.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `currentPassword` | string | ✅ | Must match current password |
| `newPassword` | string | ✅ | 8–120 chars |

**Response**: `204 No Content`

**Errors**: `401` wrong current password, `400` validation

---

### DELETE `/api/users/me`
🔒 **Auth Required**

Delete the authenticated user's account. Interviews are preserved.

**Response**: `204 No Content`

---

## Domains

### GET `/api/domains`
Public. Returns all active domains, sorted by `order`.

**Response** `200`:
```json
{ "domains": [ { "slug": "dsa", "label": "Data Structures & Algorithms", ... }, ... ] }
```

---

### GET `/api/domains/:slug`
Public. Returns a single domain.

**Response** `200`: `{ "domain": { ... } }`

**Errors**: `404`

---

### POST `/api/domains`
🔒 **Admin Only**

Create a new domain.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `slug` | string | ✅ | 2–40 chars, lowercase, `[a-z0-9-]+` |
| `label` | string | ✅ | 2–80 chars |
| `shortLabel` | string | ✅ | 2–40 chars |
| `blurb` | string | ❌ | Max 500 chars |
| `tagline` | string | ❌ | Max 140 chars |
| `iconKey` | string | ❌ | Default: `"Binary"` |
| `accent` | string | ❌ | CSS gradient classes |
| `skills` | string[] | ❌ | Max 12 items |
| `order` | number | ❌ | Sort position |

**Response** `201`: `{ "domain": { ... } }`

---

### PATCH `/api/domains/:slug`
🔒 **Admin Only**

Update a domain. All fields are optional.

**Response** `200`: `{ "domain": { ... } }`

---

### DELETE `/api/domains/:slug`
🔒 **Admin Only**

Soft-delete (sets `active=false`).

**Response**: `204 No Content`

---

## Questions

### GET `/api/questions`
Public (with optional soft-auth for `?mine=1`).

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `domain` | string | Filter by domain slug or ObjectId |
| `difficulty` | `Easy`\|`Medium`\|`Hard` | Filter by difficulty |
| `q` | string | Full-text search (question and topic) |
| `mine` | `1` | Only user's custom questions (auth required) |
| `includeInactive` | `1` | Include soft-deleted (admin only) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 50, max: 200) |

**Response** `200`:
```json
{ "items": [ ... ], "page": 1, "limit": 50, "total": 62 }
```

---

### GET `/api/questions/:id`
Public. Returns a single question.

**Response** `200`: `{ "question": { ... } }`

---

### POST `/api/questions`
🔒 **Auth Required**

Create a custom question. Admins can create built-ins with `isBuiltIn: true`.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `domain` | string | ✅ | Domain slug or ObjectId |
| `topic` | string | ❌ | Default: `"General"`, max 80 chars |
| `difficulty` | `Easy`\|`Medium`\|`Hard` | ✅ | |
| `question` | string | ✅ | 10–2000 chars |
| `timeLimit` | number | ❌ | 15–600 seconds, default: 120 |

**Response** `201`: `{ "question": { ... } }`

---

### PATCH `/api/questions/:id`
🔒 **Auth Required**

Update a question. Owner can edit their own; admin can edit any.

**Response** `200`: `{ "question": { ... } }`

**Errors**: `403` non-owner/non-admin, `404`

---

### DELETE `/api/questions/:id`
🔒 **Auth Required**

Soft-delete (sets `active=false`). Owner or admin.

**Response**: `204 No Content`

---

### POST `/api/questions/:id/restore`
🔒 **Admin Only**

Restore a soft-deleted question.

**Response** `200`: `{ "question": { ... } }`

---

## Interviews

### POST `/api/interviews/analyze`
🔒 **Auth Required**

**Rate Limit**: 20 requests / minute

Submit a spoken answer for AI evaluation. This is the core feature.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `transcript` | string | ✅ | 20–20,000 chars |
| `question` | string | ✅ | 5–2000 chars |
| `questionId` | string | ❌ | Question ObjectId (optional ref) |
| `domain` | string | ✅ | Domain slug or label |
| `topic` | string | ❌ | Max 80 chars |
| `difficulty` | `Easy`\|`Medium`\|`Hard` | ❌ | |
| `durationSec` | number | ❌ | 0–7200 |
| `wpm` | number | ❌ | 0–400 |
| `fillerCount` | number | ❌ | 0–1000 |

**Response** `201`:
```json
{
  "interview": {
    "id": "...",
    "domainSlug": "dsa",
    "question": "...",
    "transcript": "...",
    "feedback": {
      "scores": { "Content": 75, "Structure": 70, "Clarity": 80, "Confidence": 65, "Communication": 72 },
      "overall": 72,
      "summary": "...",
      "strengths": ["...", "...", "..."],
      "weaknesses": ["...", "...", "..."],
      "suggestions": ["...", "...", "..."],
      "followUp": "...",
      "communication": { "tone": "Confident", "pacing": "Steady", "fillerNote": "..." }
    },
    "providerModel": "gemini-2.5-flash",
    ...
  }
}
```

---

### GET `/api/interviews`
🔒 **Auth Required**

Paginated history of the user's interviews.

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `domain` | string | Filter by domain slug or ObjectId |
| `difficulty` | string | Filter by difficulty |
| `since` | ISO date | Only interviews after this date |
| `page` | number | Default: 1 |
| `limit` | number | Default: 50, max: 200 |

**Response** `200`:
```json
{ "items": [ ... ], "page": 1, "limit": 50, "total": 12 }
```

---

### GET `/api/interviews/stats`
🔒 **Auth Required**

Aggregated KPIs for the authenticated user.

**Response** `200`:
```json
{
  "totals": { "total": 25, "avgOverall": 74, "minutesPracticed": 120 },
  "byDomain": [ { "domainSlug": "dsa", "count": 10, "avgOverall": 78 }, ... ],
  "trend": [ { "date": "2026-05-20T...", "overall": 72, "domainSlug": "dsa" }, ... ]
}
```

---

### GET `/api/interviews/:id`
🔒 **Auth Required** (owner or admin)

**Response** `200`: `{ "interview": { ... } }`

**Errors**: `403` non-owner, `404`

---

### DELETE `/api/interviews/:id`
🔒 **Auth Required** (owner or admin)

**Response**: `204 No Content`

---

## Admin

All admin endpoints require `Authorization: Bearer <token>` from a user with `role: "admin"`.

### GET `/api/admin/stats`
Platform-wide statistics.

**Response** `200`:
```json
{
  "counts": { "userCount": 42, "adminCount": 2, "interviewCount": 150, "questionCount": 62, "domainCount": 6, "last7Interviews": 23 },
  "byDomain": [ ... ],
  "recentInterviews": [ ... ]
}
```

---

### GET `/api/admin/users`
Paginated user list with search.

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search by name or email |
| `role` | `user`\|`admin` | Filter by role |
| `page` | number | Default: 1 |
| `limit` | number | Default: 25, max: 100 |

**Response** `200`: `{ "items": [ ... ], "page": 1, "limit": 25, "total": 42 }`

---

### PATCH `/api/admin/users/:id/role`
Promote or demote a user's role.

| Field | Type | Required |
|-------|------|----------|
| `role` | `user`\|`admin` | ✅ |

**Response** `200`: `{ "user": { ... } }`

**Errors**: `400` invalid role or last-admin protection, `404`

---

### DELETE `/api/admin/users/:id`
Delete a user. Cannot delete the last admin.

**Response**: `204 No Content`

---

### GET `/api/admin/interviews`
All interviews platform-wide with filtering.

| Param | Type | Description |
|-------|------|-------------|
| `domainSlug` | string | Filter by domain slug |
| `difficulty` | string | Filter by difficulty |
| `userId` | string | Filter by user ObjectId |
| `page` | number | Default: 1 |
| `limit` | number | Default: 25, max: 200 |

**Response** `200`: `{ "items": [ ... ], "page": 1, "limit": 25, "total": 150 }`

---

## Health Check

### GET `/api/health`
Public. Returns server health info.

**Response** `200`:
```json
{ "ok": true, "name": "InterPrep API", "version": "1.0.0", "uptime": 3600, "timestamp": "2026-05-23T..." }
```

---

## Error Response Format

All errors follow a consistent shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { "email": "Invalid email" }
  }
}
```

**Error Codes**: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL`, `BAD_GATEWAY`, `NOT_IMPLEMENTED`, `VALIDATION_ERROR`, `INVALID_ID`, `DUPLICATE`, `INVALID_TOKEN`

---

## Rate Limits

| Scope | Limit | Window |
|-------|-------|--------|
| All `/api` routes | 200 requests | 1 minute |
| Auth routes (`/api/auth/signup`, `/api/auth/login`) | 30 requests | 15 minutes |
| AI evaluator (`/api/interviews/analyze`) | 20 requests | 1 minute |

Rate limit headers follow [RFC draft-7](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/).
