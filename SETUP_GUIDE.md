# Setup Guide - Purchase Management System

## Quick Start

This guide will help you set up the Purchase Management System from scratch.

## Step 1: Database Setup

### Option A: Docker (Recommended - Easiest)

1. Install Docker Desktop on your machine
2. Run this command to start PostgreSQL:
   ```bash
   docker run --name purchase-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=purchase_management -p 5432:5432 -d postgres:16
   ```

3. The `.env` file is already configured for this setup

### Option B: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database named `purchase_management`
3. Update the `.env` file with your credentials:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/purchase_management?schema=public"
   ```

### Option C: Cloud PostgreSQL

1. Sign up for a cloud PostgreSQL service (Neon, Supabase, Railway, etc.)
2. Create a new database
3. Copy the connection string
4. Update the `.env` file with your connection string

## Step 2: Initialize Database

Once your database is running, execute these commands:

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with sample data (optional)
npm run prisma:seed
```

## Step 3: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 4: Test the Application

### Test Scenarios

1. **Create a Project**
   - Navigate to Projects → New Project
   - Enter project name: "Test Warehouse"
   - Save

2. **Create a Vendor**
   - Navigate to Vendors → New Vendor
   - Enter vendor name: "Test Supplier"
   - Save

3. **Create a Purchase**
   - Navigate to New Purchase
   - Select the project and vendor you created
   - Enter delivery location: "Test Site"
   - Add items:
     - Item: "Steel Plate", Quantity: 100, Rate: 50
     - Item: "Cement", Quantity: 50, Rate: 10
   - Verify automatic calculations
   - Save

4. **View Dashboard**
   - Check that totals are updated
   - Verify project and vendor counts
   - Check recent purchases

5. **Test Filtering**
   - Go to Purchases
   - Try different filters (project, vendor, date range)
   - Verify search functionality

6. **Test Purchase Details**
   - Click on a purchase to view details
   - Verify all information is displayed correctly

7. **Test Project/Vendor Details**
   - Click on a project to see its purchases
   - Click on a vendor to see its purchases
   - Verify totals are calculated correctly

## Troubleshooting

### Database Connection Issues

If you see "Authentication failed" error:
- Verify PostgreSQL is running
- Check the DATABASE_URL in `.env`
- Ensure the database name matches

### Prisma Issues

If Prisma commands fail:
```bash
# Reset Prisma
npx prisma generate --force

# If migration fails, you can reset:
npx prisma migrate reset
```

### Port Already in Use

If port 3000 is in use:
```bash
# Kill the process or use a different port
npm run dev -- -p 3001
```

### Docker Issues

If Docker container won't start:
```bash
# Check if container exists
docker ps -a

# Remove existing container
docker rm purchase-postgres

# Try creating again
docker run --name purchase-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=purchase_management -p 5432:5432 -d postgres:16
```

## Production Deployment

### Environment Variables

For production, set these environment variables:
- `DATABASE_URL` - Your production database connection string
- `NODE_ENV` - Set to `production`

### Build Commands

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Database for Production

Use a managed PostgreSQL service:
- Neon (serverless PostgreSQL)
- Supabase
- Railway
- AWS RDS
- Google Cloud SQL

## API Testing

You can test the API endpoints using curl or Postman:

### Create Project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project"}'
```

### Create Vendor
```bash
curl -X POST http://localhost:3000/api/vendors \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Vendor"}'
```

### Create Purchase
```bash
curl -X POST http://localhost:3000/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseDate": "2026-09-11",
    "projectId": "PROJECT_ID",
    "vendorId": "VENDOR_ID",
    "deliveryLocation": "Test Site",
    "items": [
      {
        "itemName": "Test Item",
        "quantity": 10,
        "rate": 50
      }
    ]
  }'
```

## Performance Considerations

The application is optimized for:
- 10,000+ purchases
- 100,000+ purchase items
- Hundreds of projects and vendors

If you experience performance issues:
1. Check database indexes
2. Verify pagination is working
3. Review server-side filtering
4. Check database connection pool settings

## Security Notes

- Never commit `.env` file to version control
- Use strong database passwords in production
- Enable SSL for database connections in production
- Consider adding authentication for production use
- Regular database backups are recommended

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the README.md
3. Check database connection
4. Verify environment variables
