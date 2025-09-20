// BEGIN FILE: api.md
# Study Group Orchestrator API Documentation

## Base URL
`http://localhost:4000/api`

## Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header:

`Authorization: Bearer <jwt_token>`

### Endpoints

- `POST /auth/register` - Register a new user.
  - **Body:** `{ "name": "...", "email": "...", "password": "..." }`
- `POST /auth/login` - Login a user.
  - **Body:** `{ "email": "...", "password": "..." }`
- `GET /auth/me` - Get the current user's data (Protected).

## User Management

- `GET /users/profile` - Get the current user's profile (Protected).
- `PUT /users/profile` - Update the current user's profile (Protected).
  - **Body:** `{ "name": "...", "profile": { ... } }`

## Group Management

- `GET /groups` - Get a list of all groups.
- `GET /groups/:id` - Get details for a specific group.
- `POST /groups` - Create a new group (Protected).
  - **Body:** `{ "name": "...", "subject": "...", "maxMembers": "..." }`
- `PUT /groups/:id/join` - Join a group (Protected).
- `PUT /groups/:id/leave` - Leave a group (Protected).

## Scheduling & AI

- `GET /scheduling/user` - Get the authenticated user's schedule (Protected).
- `PUT /scheduling/user` - Update the authenticated user's schedule (Protected).
- `POST /scheduling/find-optimal-time` - Find optimal meeting times for a group (Protected).
  - **Body:** `{ "groupId": "..." }`
- `POST /scheduling/generate-materials` - Generate study materials from notes (Protected).
  - **Body:** `{ "lectureNotes": "...", "format": "quiz" }`
// END FILE: api.md