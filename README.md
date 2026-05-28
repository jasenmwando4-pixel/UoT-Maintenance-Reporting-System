//cd "c:\Users\Jasen MJ\Desktop\WEB PRACTICAL\school-activity-api"
npm start

//cd "c:\Users\Jasen MJ\Desktop\WEB PRACTICAL\school-activity-api\client"
npm run dev

# UoT Maintenance Reporting System

A full-stack web application for reporting and managing maintenance issues at the University of Technology, Zambia.

**Built with:** React.js | Express.js | PostgreSQL

## Features

- **User Authentication** — Register and login with secure password hashing
- **Maintenance Reports** — Create, read, update, delete maintenance issues
- **File Upload** — Attach images to issue reports
- **Responsive UI** — Works on desktop, tablet, and mobile devices
- **Role-Based Access** — Admin vs. student privileges

## Project Structure

```
school-activity-api/
├── server.js              # Express API entry point
├── db.js                  # PostgreSQL connection
├── migrations.sql         # Database schema
├── package.json          # Backend dependencies
├── .env.example          # Environment variables template
├── uploads/              # Uploaded images directory
└── client/               # React frontend
    ├── src/
    │   ├── App.jsx       # Router setup
    │   ├── AuthContext.jsx # Auth state management
    │   ├── api.js        # Axios client
    │   ├── pages/        # Login, Register, Dashboard
    │   ├── components/   # ReportForm, ReportList
    │   └── index.css     # Styling
    └── package.json      # Frontend dependencies
```

## Setup

### 1. Prerequisites

- Node.js v20+ and npm
- PostgreSQL 12+
- Postman or similar API client (for testing)

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your PostgreSQL connection details:

```bash
cp .env.example .env
```

Edit `.env`:

```
USE_IN_MEMORY_DB=false
DATABASE_URL=postgresql://postgres:password@localhost:5432/school_activity
JWT_SECRET=your_secret_key_here
PORT=5000
```

For a real system, use PostgreSQL and keep `USE_IN_MEMORY_DB=false`. The in-memory mode is only for local development or temporary testing when a database is unavailable.

### 3. Set Up PostgreSQL Database

Create the database and run migrations:

```bash
createdb school_activity
psql school_activity < migrations.sql
```

Or using `psql`:

```sql
CREATE DATABASE school_activity;
```

Then run the `migrations.sql` file in the `school_activity` database.

### 4. Install Dependencies

```bash
npm install
cd client && npm install && cd ..
```

## Running the Application

### Start the Backend (Port 5000)

```bash
npm start
```

Or with auto-reload during development:

```bash
npm run dev
```

### Start the Frontend (Port 5173)

In a new terminal:

```bash
npm run client
```

### Access the Application

- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:5000](http://localhost:5000)

## API Endpoints

### Authentication

- `POST /auth/register` — Create a new account
- `POST /auth/login` — Login and receive JWT token

### Maintenance Reports (require valid token)

- `GET /reports` — List all user's reports
- `POST /reports` — Create a new report (with optional image)
- `GET /reports/:id` — Get a specific report
- `PUT /reports/:id` — Update a report
- `DELETE /reports/:id` — Delete a report
- `GET /activities/:id/students` — List students in an activity

## Example API Calls

### Register

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secret123"}'
```

### Login

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}'
```

### Create Report

```bash
curl -X POST http://localhost:5000/reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "title=Broken light in Room 101" \
  -F "description=Light fixture not working" \
  -F "location=Building A, Floor 2" \
  -F "image=@/path/to/image.jpg"
```

## Default Credentials

An admin user is automatically created:

- **Email:** admin@uot.ac.zm
- **Password:** admin123

## Development Notes

- Backend runs on **port 5000** (configurable via `PORT` env variable)
- Frontend runs on **port 5173** (Vite default)
- CORS is enabled for frontend requests
- JWT tokens expire after **12 hours**
- Images are stored in the `uploads/` directory

## Recommended deployment path (best option)

For the easiest production setup and Android compatibility, deploy the frontend as a Vite site and the backend as a separate hosted API.

1. Push the repo to GitHub.
2. Deploy the frontend from the `client/` folder to Vercel or Netlify.
3. Deploy the backend to Railway, Render, or any Node hosting provider that supports PostgreSQL.
4. Configure backend environment variables: `DATABASE_URL`, `JWT_SECRET`, `PORT`, and optional SMTP variables.
5. Use the deployed frontend URL on Android browsers. Because the app is PWA-enabled, Android users can "Add to Home screen" and run it like an app.

### Frontend Build

```bash
npm run client:build
```

Output is in `client/dist/`

### Backend Deployment

1. Ensure PostgreSQL is set up on the server
2. Set environment variables on the server
3. Run `npm install` and `npm start`

## Troubleshooting

**"Cannot find module 'pg'"** — Run `npm install` in the root directory

**"Database connection failed"** — Check your PostgreSQL service is running and `DATABASE_URL` is correct

**"CORS error"** — Frontend and backend ports must match configuration; check `.env` API URL

**"Token expired"** — Tokens last 12 hours; logout and login again for a new token

## Submission Requirements Met

✅ User authentication & login  
✅ CRUD operations (Create, Read, Update, Delete)  
✅ PostgreSQL database integration  
✅ Express.js API  
✅ File upload functionality  
✅ Responsive React frontend  

## Additional Resources

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT Documentation](https://jwt.io/)

---

**Submission Deadline:** 29 May 2026

## Android / Mobile packaging

You have three options to make the app available on Android devices:

- Mobile web (recommended): deploy frontend to Vercel or Netlify and open the URL in mobile browsers. Add to Home screen provides an app-like experience when PWA is enabled.

- PWA (installable): The project now includes `vite-plugin-pwa` configuration. After building (`cd client && npm run build`) and deploying the site, Android users can "Add to Home screen" and run the app offline-capable.

- Native wrapper (Capacitor): To build a native APK that packages the web app:

```bash
cd client
npm install
npm run build
npm install @capacitor/core @capacitor/cli --save
npx cap init school-activity-app com.yourcompany.schoolactivity
npx cap add android
npx cap copy android
npx cap open android
```

Open the generated project in Android Studio, then build and run an APK or App Bundle. Ensure backend APIs are publicly accessible or reachable from the device (use HTTPS in production).

Notes:
- Use HTTPS endpoints in production to avoid mixed content and network limitations on Android.
- If testing on a device on the same LAN, update `capacitor.config.json` or configure debugging to point to your local backend host.

