# PostgreSQL Setup Guide

This guide explains how to set up PostgreSQL for the UoT Maintenance Reporting System as a real production database.

## Prerequisites

- **PostgreSQL 12+** installed and running on your system
- **psql** (PostgreSQL command-line client) accessible from your terminal
- Windows, macOS, or Linux

## Step 1: Install PostgreSQL

### Windows

1. Download the installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the prompts
3. During installation:
   - Set a superuser password (remember this!)
   - Choose port `5432` (default)
   - Add PostgreSQL to your PATH if prompted
4. Verify installation:
   ```powershell
   psql --version
   ```

### macOS (using Homebrew)

```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

## Step 2: Create the Database

Open a terminal and log into PostgreSQL:

```bash
psql -U postgres
```

When prompted, enter your PostgreSQL superuser password (set during installation).

Inside the PostgreSQL CLI, run:

```sql
CREATE DATABASE school_activity;
\q
```

The `\q` command exits the PostgreSQL CLI.

## Step 3: Load the Database Schema

Run the migrations file to set up tables:

```bash
psql -U postgres -d school_activity -f migrations.sql
```

This creates:
- `users` table with an admin account
- `reports` table with all necessary fields

To verify the tables were created, run:

```bash
psql -U postgres -d school_activity -c "\dt"
```

You should see:
```
          List of relations
 Schema |  Name  | Type  |  Owner
--------+--------+-------+----------
 public | reports | table | postgres
 public | users  | table | postgres
(2 rows)
```

## Step 4: Update Environment Variables

Edit the `.env` file in the root of the project:

```
USE_IN_MEMORY_DB=false
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/school_activity
JWT_SECRET=your_secret_key_here
PORT=5000
```

Replace `YOUR_PASSWORD` with the PostgreSQL password you set during installation.

## Step 5: Start the Application

### Terminal 1: Start the Backend

```bash
npm install
npm start
```

You should see:
```
Connected to PostgreSQL successfully.
API running on http://localhost:5000
```

### Terminal 2: Start the Frontend

```bash
cd client
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Step 6: Verify Everything Works

1. Open `http://localhost:5173` in your browser
2. Log in with the default admin credentials:
   - **Email:** `admin@uot.ac.zm`
   - **Password:** `admin123`
3. Submit a maintenance report
4. Verify it appears in the report list
5. Check that data persists after page reload

## Troubleshooting

### "Cannot connect to database"
- Ensure PostgreSQL is running: `psql -U postgres` should work
- Check your `DATABASE_URL` in `.env` has the correct password and port
- Verify the database exists: `psql -U postgres -l | grep school_activity`

### "FATAL: Ident authentication failed for user 'postgres'"
- You're on Linux and need to use a different authentication method
- Try: `sudo -u postgres psql` instead

### "Password authentication failed"
- The password in `DATABASE_URL` doesn't match your PostgreSQL password
- Reset it with: `ALTER USER postgres WITH PASSWORD 'newpassword';`

### "Relation 'users' does not exist"
- The migrations.sql file wasn't run properly
- Re-run: `psql -U postgres -d school_activity -f migrations.sql`

### Port 5432 already in use
- PostgreSQL is already running, or another service is using the port
- On Windows: Check Task Manager for postgres processes
- On macOS/Linux: `lsof -i :5432` to find the process

## Backing Up Your Data

To export all data:

```bash
pg_dump -U postgres -d school_activity > school_activity_backup.sql
```

To restore from backup:

```bash
psql -U postgres -d school_activity < school_activity_backup.sql
```

## Next Steps

- The app is now production-ready with a real PostgreSQL database
- All user and report data persists across application restarts
- You can scale the database with proper backup/restore strategies
