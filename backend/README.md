# Seva Website — Backend API

Node.js + Express + MongoDB backend for the Seva service marketplace.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then edit with your MongoDB URI & JWT secret
npm run dev             # starts with nodemon on port 5000
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new worker |
| POST | `/api/auth/login` | Login with registration ID + DOB |

### Workers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workers?q=&state=&available=` | Search workers (paginated) |
| GET | `/api/workers/:registrationId` | Get worker profile |
| PATCH | `/api/workers/me` | Update own profile (auth required) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create a booking (7% commission auto-calculated) |
| GET | `/api/bookings/my` | Get own bookings (auth required) |
| PATCH | `/api/bookings/:id/status` | Update booking status (auth required) |

## Deploy
Host on Railway, Render, or any Node.js hosting. Set environment variables from `.env.example`.
