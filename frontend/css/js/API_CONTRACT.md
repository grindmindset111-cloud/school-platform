# School Platform – API Contract

## Base Configuration

- Base URL: https://school-platform-bnpo.onrender.com
- API Prefix: /api
- Authentication: JWT (Bearer Token)
- Authorization Header: Authorization: Bearer <token>

---

## Standard Response Format

All endpoints should return:

{
  "success": true,
  "data": {},
  "message": "Optional message"
}

---

# Authentication

## POST /api/auth/login
Description: Authenticate user and return JWT token

Body:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "data": {
    "token": "string",
    "user": {}
  }
}

---

## POST /api/auth/register
Description: Register a new user

Body:
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "string"
}

Response:
{
  "success": true,
  "data": {
    "token": "string",
    "user": {}
  }
}

---

## GET /api/auth/me
Description: Get currently authenticated user

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "user": {}
  }
}

---

# Users

## GET /api/users
Description: Get all users (admin only)

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "users": []
  }
}

---

## GET /api/users/:id
Description: Get single user by ID

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "user": {}
  }
}

---

## PUT /api/users/:id
Description: Update user details

Headers:
Authorization: Bearer <token>

Body:
{
  "name": "string",
  "role": "string"
}

Response:
{
  "success": true,
  "data": {
    "user": {}
  }
}

---

# Departments

## GET /api/departments
Description: Get all departments

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "departments": []
  }
}

---

## POST /api/departments
Description: Create a new department (admin only)

Headers:
Authorization: Bearer <token>

Body:
{
  "name": "string"
}

Response:
{
  "success": true,
  "data": {
    "department": {}
  }
}

---

## PUT /api/departments/:id
Description: Update department

Headers:
Authorization: Bearer <token>

Body:
{
  "name": "string"
}

Response:
{
  "success": true,
  "data": {
    "department": {}
  }
}