# Purchase Management System

A simple, fast, and modern purchase register web application built with Next.js, TypeScript, PostgreSQL, and Prisma.

## Features

- **Dashboard**: Overview of purchase activity with analytics
- **Purchase Management**: Create, view, and manage purchases with automatic calculations
- **Project Tracking**: Group purchases by projects with automatic totals
- **Vendor Management**: Track vendors and their purchase history
- **Real-time Calculations**: Automatic quantity × rate calculations
- **Filtering & Search**: Advanced filtering for purchases
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or cloud)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd purchas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**

   Option 1: Docker (Recommended)
   ```bash
   docker run --name purchase-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=purchase_management -p 5432:5432 -d postgres:16
   ```

   Option 2: Local PostgreSQL
   - Install PostgreSQL on your machine
   - Create a database named `purchase_management`

   Option 3: Cloud PostgreSQL
   - Use a service like Neon, Supabase, or Railway
   - Get the connection string

4. **Configure environment variables**

   Create a `.env` file in the project root:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/purchase_management?schema=public"
   ```

   Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

5. **Run Prisma migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

6. **Seed the database (optional)**
   ```bash
   npm run prisma:seed
   ```

## Running the Application

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Building for Production

```bash
npm run build
npm start
```

## Application Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── projects/      # Project CRUD API
│   │   ├── vendors/       # Vendor CRUD API
│   │   ├── purchases/     # Purchase CRUD API
│   │   ├── dashboard/     # Dashboard analytics API
│   │   └── reports/       # Reports API
│   ├── new-purchase/      # New purchase page
│   ├── purchases/         # Purchase list and details
│   ├── projects/          # Project list and details
│   ├── vendors/           # Vendor list and details
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx           # Dashboard page
├── components/
│   ├── common/            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Dialog.tsx
│   │   ├── Toast.tsx
│   │   ├── EmptyState.tsx
│   │   └── LoadingState.tsx
│   ├── layout/            # Layout components
│   │   └── Navigation.tsx
│   └── purchase/          # Purchase-specific components
│       └── PurchaseForm.tsx
├── lib/
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
└── modules/
    ├── projects/          # Project module
    ├── vendors/           # Vendor module
    ├── purchases/         # Purchase module
    ├── dashboard/         # Dashboard module
    └── reports/           # Reports module
```

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PATCH /api/projects?id={id}` - Update project
- `DELETE /api/projects?id={id}` - Delete project

### Vendors
- `GET /api/vendors` - Get all vendors
- `POST /api/vendors` - Create vendor
- `PATCH /api/vendors?id={id}` - Update vendor
- `DELETE /api/vendors?id={id}` - Delete vendor

### Purchases
- `GET /api/purchases` - Get all purchases (with filters)
- `GET /api/purchases?id={id}` - Get purchase by ID
- `POST /api/purchases` - Create purchase
- `PATCH /api/purchases?id={id}` - Update purchase
- `DELETE /api/purchases?id={id}` - Delete purchase

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Reports
- `GET /api/reports?type=projects` - Get project reports
- `GET /api/reports?type=vendors` - Get vendor reports
- `GET /api/reports?type=purchases` - Get purchase reports (with filters)

## Database Schema

### Project
- `id` (UUID)
- `name` (String, unique)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Vendor
- `id` (UUID)
- `name` (String, unique)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Purchase
- `id` (UUID)
- `purchaseNumber` (String, unique)
- `purchaseDate` (DateTime)
- `projectId` (UUID, foreign key)
- `vendorId` (UUID, foreign key)
- `deliveryLocation` (String)
- `subtotal` (Decimal)
- `totalAmount` (Decimal)
- `notes` (String, optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### PurchaseItem
- `id` (UUID)
- `purchaseId` (UUID, foreign key)
- `itemName` (String)
- `quantity` (Decimal)
- `rate` (Decimal)
- `amount` (Decimal)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## Key Features

### Purchase Entry Form
- Automatic project/vendor creation from within the form
- Real-time item calculations (quantity × rate)
- Automatic total calculation
- Inline validation
- Support for decimal quantities and rates

### Dashboard
- Total purchase amount
- Purchase entry count
- Project and vendor counts
- Project-wise purchase breakdown
- Vendor-wise purchase breakdown
- Recent purchases
- Monthly purchase chart

### Filtering & Search
- Search by purchase number
- Filter by project
- Filter by vendor
- Date range filtering
- Server-side pagination

## Security Considerations

- Environment variables for sensitive data
- Input validation on both frontend and backend
- SQL injection prevention via Prisma
- Proper error handling without exposing database details
- Transaction-based purchase creation for data integrity

## Performance Optimizations

- Database indexes on frequently queried fields
- Server-side filtering and pagination
- Efficient aggregate queries
- Selective Prisma queries
- No unnecessary data fetching

## License

MIT

## Support

For issues or questions, please refer to the project documentation or contact the development team.
