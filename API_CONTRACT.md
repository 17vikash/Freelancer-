# Freelancer Marketplace — Backend API Contract (for Backend Team)

Frontend calls these exact endpoints.
- **Base URL:** `http://localhost:5000/api`
- **Auth Header:** `Authorization: Bearer <token>` for all protected routes.
- **Response Format:** All JSON responses include `"success": true` or `"success": false`.

---

## 1. Database Schemas / Models Needed

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String, // Unique
  password: String, // Hashed (bcrypt)
  role: String, // "client" | "freelancer"
  createdAt: Date
}
```

### FreelancerProfile
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Ref: User
  title: String,
  bio: String,
  skills: [String],
  hourlyRate: Number,
  portfolio: [{ title: String, image: String, link: String }],
  avgRating: Number
}
```

### Job
```javascript
{
  _id: ObjectId,
  clientId: ObjectId, // Ref: User
  title: String,
  description: String,
  category: String, // "Web Development" | "Mobile Apps" | "AI & Data" | "Design & Creative"
  budgetType: String, // "fixed" | "hourly"
  budgetAmount: Number,
  skills: [String],
  deadline: Date,
  status: String, // "open" | "in_progress" | "completed"
  createdAt: Date
}
```

### Proposal
```javascript
{
  _id: ObjectId,
  jobId: ObjectId, // Ref: Job
  freelancerId: ObjectId, // Ref: User
  coverLetter: String,
  bidAmount: Number,
  duration: String,
  status: String, // "pending" | "accepted" | "rejected"
  createdAt: Date
}
```

### Review
```javascript
{
  _id: ObjectId,
  reviewerId: ObjectId, // Ref: User
  revieweeId: ObjectId, // Ref: User
  jobId: ObjectId, // Ref: Job
  rating: Number, // 1 to 5
  comment: String,
  createdAt: Date
}
```

---

## 2. API Endpoints Specification

### Auth Routes
| Method | Endpoint | Auth | Request Body | Success Response |
|---|---|---|---|---|
| `POST` | `/auth/signup` | No | `{ name, email, password, role, title?, hourlyRate? }` | `{ success: true, user, token }` |
| `POST` | `/auth/login` | No | `{ email, password }` | `{ success: true, user, token }` |
| `GET` | `/auth/me` | Yes | — | `{ success: true, user }` |

### Job Routes
| Method | Endpoint | Auth | Query / Body | Success Response |
|---|---|---|---|---|
| `GET` | `/jobs` | No | Params: `?search=&category=&budgetMin=&budgetMax=&type=&page=` | `{ success: true, jobs: [], total: Number, page: Number }` |
| `GET` | `/jobs/:id` | No | — | `{ success: true, job: {}, client: {}, proposalCount: Number }` |
| `POST` | `/jobs` | Client | `{ title, description, category, budgetType, budgetAmount, skills, deadline }` | `{ success: true, job: {} }` |
| `PUT` | `/jobs/:id` | Client | `{ title?, description?, category?, budgetAmount?, status? }` | `{ success: true, job: {} }` |
| `DELETE` | `/jobs/:id` | Client | — | `{ success: true, message: "Job deleted" }` |

### Proposal Routes
| Method | Endpoint | Auth | Request Body | Success Response |
|---|---|---|---|---|
| `POST` | `/jobs/:id/proposals` | Freelancer | `{ coverLetter, bidAmount, duration }` | `{ success: true, proposal: {} }` |
| `GET` | `/jobs/:id/proposals` | Client (Owner) | — | `{ success: true, proposals: [] }` |
| `PUT` | `/proposals/:id` | Client (Owner) | `{ status: "accepted" | "rejected" }` | `{ success: true, proposal: {} }` *(On accept, also set job.status = "in_progress")* |

### Client Dashboard Routes
| Method | Endpoint | Auth | Success Response |
|---|---|---|---|
| `GET` | `/clients/me/jobs` | Client | `{ success: true, jobs: [] }` *(Each job includes proposalCount and status)* |
| `GET` | `/clients/me/stats` | Client | `{ success: true, activeJobsCount: Number, totalSpent: Number, avgRatingGiven: Number }` |

### Freelancer Dashboard & Profile Routes
| Method | Endpoint | Auth | Success Response |
|---|---|---|---|
| `GET` | `/freelancers/me/proposals` | Freelancer | `{ success: true, proposals: [] }` *(Joined with job title and status)* |
| `GET` | `/freelancers/me/stats` | Freelancer | `{ success: true, appliedCount: Number, ongoingCount: Number, totalEarned: Number, rating: Number }` |
| `GET` | `/freelancers/:id` | No | `{ success: true, profile: {}, user: {} }` |
| `GET` | `/freelancers/:id/reviews` | No | `{ success: true, reviews: [] }` |

### Reviews Route
| Method | Endpoint | Auth | Request Body | Success Response |
|---|---|---|---|---|
| `POST` | `/jobs/:id/reviews` | Yes | `{ revieweeId, rating, comment }` | `{ success: true, review: {} }` *(Only after job.status = "completed")* |

### Settings & Profile Routes
| Method | Endpoint | Auth | Request Body | Success Response |
|---|---|---|---|---|
| `PUT` | `/users/me` | Yes | `{ name?, bio?, skills?, hourlyRate?, notificationPrefs? }` | `{ success: true, user: {} }` |
| `PUT` | `/users/me/password` | Yes | `{ oldPassword, newPassword }` | `{ success: true, message: "Password updated" }` |

---

## 3. Standard Response & Error Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Detailed error message explaining what went wrong."
}
```

---

## 4. Backend Implementation Notes
1. **CORS:** Enable CORS middleware allowing origins `http://localhost:5500`, `http://127.0.0.1:5500`, and `http://localhost:8000`.
2. **JWT Middleware:** Verify `Authorization: Bearer <token>` header on all protected routes and attach `req.user`.
3. **Pagination:** Standardize list pagination with `page` and `limit` (default `limit = 10`).
