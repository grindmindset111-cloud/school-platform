## API Contract

Base URL: `https://school-platform-bnpo.onrender.com`

### POST `/api/auth/login` -> `{ user, token }`

- Request body: `{ email, password }`
- Accept both shapes during transition:
  - `{ user, token }`
  - `{ data: { user, token } }`

### POST `/api/auth/register` -> `{ message }`

- Request body: `{ name, email, password, role }`
- Transition support in frontend:
  - `{ message }`
  - `{ data: { user, token }, message }`

### GET `/dashboard` -> `{ stats, data }`

- Current dashboard pages consume:
  - `stats: { users, attendance }`
  - `data: []`
- Extended mock includes:
  - `tables: { users: [], attendance: [] }`
