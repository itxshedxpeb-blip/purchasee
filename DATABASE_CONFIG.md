# Database Configuration

## Current Status

PostgreSQL is running on your system (service: `postgresql-x64-18`), but the application cannot connect because the credentials in `.env` don't match your installation.

## Quick Fix - Reset PostgreSQL Password (Recommended)

Since PostgreSQL is already installed and running, the easiest solution is to reset the password to match the default credentials:

1. Open **Command Prompt as Administrator**
2. Navigate to PostgreSQL bin directory:
   ```cmd
   cd C:\Program Files\PostgreSQL\18\bin
   ```
3. Run:
   ```cmd
   psql -U postgres
   ```
4. If prompted for password, try your current PostgreSQL password (or try pressing Enter if no password was set)
5. Once connected, run:
   ```sql
   ALTER USER postgres WITH PASSWORD 'postgres';
   ```
6. Exit with `\q`

Then run the database setup commands from the project directory:
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

## Alternative: Update .env with Your Credentials

If you prefer not to reset the password, update the `.env` file with your actual PostgreSQL credentials:

1. Edit `C:\Users\Admin\Desktop\purchas\.env`
2. Replace the password with your actual PostgreSQL password:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/purchase_management?schema=public"
   ```
3. Run the database setup commands

## Manual Database Setup

If the database doesn't exist yet:

1. Open **Command Prompt as Administrator**
2. Navigate to PostgreSQL bin:
   ```cmd
   cd C:\Program Files\PostgreSQL\18\bin
   ```
3. Create the database:
   ```cmd
   createdb -U postgres purchase_management
   ```
4. Run Prisma commands from project directory:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

## Finding Your PostgreSQL Password

If you don't remember your PostgreSQL password:

### Method 1: Try Common Defaults

Try connecting with no password or common defaults:
- Empty password
- `postgres`
- `password`
- Your Windows user password

### Method 2: Check pg_hba.conf

1. Find PostgreSQL data directory: `C:\Program Files\PostgreSQL\18\data`
2. Open `pg_hba.conf` in a text editor
3. Look for authentication methods for local connections

### Method 3: Reset via Windows Services

1. Open **Services** (Win+R, type `services.msc`)
2. Find `postgresql-x64-18`
3. Stop the service
4. Edit `pg_hba.conf` to allow trust authentication temporarily
5. Start the service
6. Connect without password and reset it
7. Revert `pg_hba.conf` changes

## Verification

After configuration, verify the connection:

```bash
npx prisma db pull
```

If successful, you should see:
```
✔ Introspected 4 models
```

## PostgreSQL Commands Reference

From the PostgreSQL bin directory:

Connect to PostgreSQL:
```cmd
psql -U postgres
```

List databases:
```sql
\l
```

Create database:
```sql
CREATE DATABASE purchase_management;
```

Connect to database:
```sql
\c purchase_management
```

List tables:
```sql
\dt
```

Exit:
```sql
\q
```

## Current .env Configuration

Your `.env` file currently contains:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/purchase_management?schema=public"
```

This expects:
- Username: `postgres`
- Password: `postgres`
- Host: `localhost`
- Port: `5432`
- Database: `purchase_management`

## Troubleshooting

### "Authentication failed"
- Password in `.env` doesn't match PostgreSQL
- Use the Quick Fix above to reset password

### "database does not exist"
- Run `createdb` command to create the database
- Or connect to PostgreSQL and run `CREATE DATABASE purchase_management;`

### "connection refused"
- PostgreSQL service is not running
- Check Windows Services and start `postgresql-x64-18`

### Port 5432 not accessible
- PostgreSQL might be on a different port
- Check PostgreSQL configuration for port setting
- Update `.env` with correct port if different

## Next Steps

Once the database is configured successfully:

1. The development server will connect without errors
2. Dashboard will show real data
3. You can create projects, vendors, and purchases
4. All CRUD operations will work

## Environment Variables

The `.env` file is in `.gitignore` and won't be committed to version control, so your credentials are safe.
