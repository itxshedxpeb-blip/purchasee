# Quick Start - Fix Database Connection

## Current Issue

The application is running but cannot connect to PostgreSQL because:
- PostgreSQL is installed and running ✓
- Database credentials in `.env` don't match your installation ✗

## Solution (Choose One)

### Option 1: Reset PostgreSQL Password (Easiest)

Double-click the file: `reset-postgres-password.bat`

This will reset your PostgreSQL password to `postgres` to match the `.env` file.

Then run these commands in the project directory:
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### Option 2: Manual Password Reset

1. Open **Command Prompt as Administrator**
2. Run:
   ```cmd
   cd C:\Program Files\PostgreSQL\18\bin
   psql -U postgres
   ```
3. Enter your current password when prompted (or try pressing Enter)
4. Run:
   ```sql
   ALTER USER postgres WITH PASSWORD 'postgres';
   ```
5. Exit with `\q`
6. Run the Prisma commands above

### Option 3: Update .env with Your Password

If you know your actual PostgreSQL password:

1. Edit `.env` file
2. Change `postgres:postgres` to `postgres:YOUR_PASSWORD`
3. Run the Prisma commands above

## Verify It Works

After running the commands, the development server should show:
- No authentication errors
- Dashboard loading successfully
- Projects and vendors loading

## Running the App

```bash
npm run dev
```

Then open: http://localhost:3000

## Need Help?

See `DATABASE_CONFIG.md` for detailed troubleshooting.
