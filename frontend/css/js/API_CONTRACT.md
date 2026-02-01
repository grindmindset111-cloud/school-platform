# School Platform – API Contract
## Base Configuration
- Base URL: https://school-platform-production-62bd.up.railway.app/api
- Authentication: JWT (Bearer Token)
- Authorization Header: Authorization: Bearer <token>


## Authentication

### POST /auth/login
- Description: Authenticate user and return JWT token
- Body:
  - email: string
  - password: string
- Response:
  - token: string
  - user: object

### POST /auth/register
- Description: Register a new user
- Body:
  - name: string
  - email: string
  - password: string
  - role: string
- Response:
  - token: string
  - user: object

### GET /auth/me
- Description: Get currently authenticated user
- Headers:
  - Authorization: Bearer <token>
- Response:
  - user: object


## Users

### GET /users
- Description: Get all users (admin only)
- Headers:
  - Authorization: Bearer <token>
- Response:
  - users: array

### GET /users/:id
- Description: Get single user by ID
- Headers:
  - Authorization: Bearer <token>
- Response:
  - user: object

### PUT /users/:id
- Description: Update user details
- Headers:
  - Authorization: Bearer <token>
- Body:
  - name: string
  - role: string
- Response:
  - user: object