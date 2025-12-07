# Car Reseller CRM

A minimal, production-ready CRM system for used car resellers in India. Built with Next.js 14 (App Router), TypeScript, Prisma (MongoDB), and TailwindCSS.

## Features

- **Single Admin Authentication**: Simple email/password login with JWT sessions
- **Buyer Management**: Track buyers, their preferences, and visit counts
- **Seller Management**: Manage seller contacts and information
- **Car Inventory**: Track cars with price history, status, and details
- **Lead Management**: Track leads from various sources with status updates
- **Follow-ups**: Schedule and track follow-ups (today, pending, overdue)
- **WhatsApp Integration**: Generate WhatsApp links for manual messaging (no bulk sending)
- **Soft Delete**: All records use soft-delete for data safety
- **CSV Export**: Export buyers, sellers, cars, and leads to CSV

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (via Prisma)
- **Styling**: TailwindCSS
- **Authentication**: JWT with HttpOnly cookies
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB instance)
- Git

## Setup Instructions

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd carresellercrm

# Install dependencies
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and set the following variables:

```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/carresellercrm?retryWrites=true&w=majority"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="changeme123"
DEFAULT_COUNTRY_CODE="+91"
CURRENCY="INR"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="development"
```

**Important**: 
- Replace `DATABASE_URL` with your MongoDB Atlas connection string
- Use a strong, random string for `JWT_SECRET` in production
- Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` for your admin account

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push
```

### 4. Seed Admin Account

```bash
# Create admin account (uses ADMIN_EMAIL and ADMIN_PASSWORD from .env)
npm run seed
```

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Deployment to Vercel

### 1. Prepare for Deployment

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel

### 2. Environment Variables in Vercel

In Vercel dashboard, add all environment variables from your `.env` file:

- `DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `DEFAULT_COUNTRY_CODE` (optional, defaults to +91)
- `CURRENCY` (optional, defaults to INR)
- `NEXT_PUBLIC_BASE_URL` (set to your Vercel domain)
- `NODE_ENV` (set to "production")

### 3. Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default)
- **Root Directory**: `.` (or `apps/web` if you restructured)

### 4. Post-Deployment

After first deployment, run the seed script to create admin:

```bash
# SSH into Vercel or use Vercel CLI
vercel env pull .env.local
npm run seed
```

Or manually create admin via MongoDB Atlas dashboard.

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout (clears session cookie)
- `POST /api/auth/change-password` - Change admin password
- `GET /api/admin/me` - Get current admin info

### Buyers

- `GET /api/buyers?q=search` - List buyers (with optional search)
- `POST /api/buyers` - Create buyer
- `GET /api/buyers/:id` - Get buyer details
- `PUT /api/buyers/:id` - Update buyer (supports `incrementVisits: true`)
- `DELETE /api/buyers/:id` - Soft delete buyer

### Sellers

- `GET /api/sellers?q=search` - List sellers
- `POST /api/sellers` - Create seller
- `GET /api/sellers/:id` - Get seller details
- `PUT /api/sellers/:id` - Update seller
- `DELETE /api/sellers/:id` - Soft delete seller

### Cars

- `GET /api/cars?brand=X&model=Y&status=Z` - List cars (with filters)
- `POST /api/cars` - Create car
- `GET /api/cars/:id` - Get car details
- `PUT /api/cars/:id` - Update car (price updates append to priceHistory)
- `DELETE /api/cars/:id` - Soft delete car

### Leads

- `GET /api/leads?status=X` - List leads
- `POST /api/leads` - Create lead
- `GET /api/leads/:id` - Get lead details
- `PUT /api/leads/:id` - Update lead (supports `incrementVisits: true`)
- `DELETE /api/leads/:id` - Soft delete lead

### Follow-ups

- `GET /api/followups?filter=today|pending|overdue` - List follow-ups
- `POST /api/followups` - Create follow-up
- `PUT /api/followups/:id/complete` - Mark follow-up as complete

### Messages

- `POST /api/messages/wa-link` - Generate WhatsApp link
  - Body: `{ phone, body, recipientId?, recipientType? }`
  - Returns: `{ waLink, messageLogId }`

### Export

- `GET /api/export/csv?type=buyers|sellers|cars|leads` - Export data as CSV

## Key Features Explained

### WhatsApp Links

The CRM generates `wa.me` links for manual messaging. No bulk messaging or third-party APIs are used. The owner must:
1. Click the WhatsApp button
2. Verify the phone number is correct
3. Send the message manually

Phone numbers are normalized with the default country code (+91 for India). If a number doesn't start with `+`, the default code is prepended.

### Soft Delete

All records (Buyers, Sellers, Cars, Leads) use a `deleted` boolean field. Deleted records are filtered out from queries but remain in the database for audit purposes.

### Price History

When a car's price is updated, the old price and timestamp are appended to the `priceHistory` JSON field in the Car model.

### Visit Tracking

Buyers and Leads have a `visitsCount` field that can be incremented via the API. The UI provides buttons to easily increment this count.

### Follow-up Filtering

Follow-ups can be filtered by:
- `today`: Follow-ups scheduled for today (not completed)
- `pending`: All incomplete follow-ups scheduled in the future
- `overdue`: All incomplete follow-ups scheduled in the past

## Testing

### Test Login

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/login`
3. Use the credentials from your `.env` file (`ADMIN_EMAIL` and `ADMIN_PASSWORD`)

### Test Key Endpoints

```bash
# Login (get cookie)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"changeme123"}' \
  -c cookies.txt

# Get buyers (use cookie from login)
curl http://localhost:3000/api/buyers -b cookies.txt

# Create WhatsApp link
curl -X POST http://localhost:3000/api/messages/wa-link \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","body":"Hello"}' \
  -b cookies.txt

# Get today's follow-ups
curl "http://localhost:3000/api/followups?filter=today" -b cookies.txt
```

## Project Structure

```
carresellercrm/
├── apps/web/              # Next.js application
│   ├── app/               # App Router pages
│   │   ├── api/           # API routes
│   │   ├── auth/          # Auth pages
│   │   ├── buyers/        # Buyer pages
│   │   ├── sellers/        # Seller pages
│   │   ├── cars/          # Car pages
│   │   ├── leads/         # Lead pages
│   │   ├── followups/     # Follow-up pages
│   │   └── components/    # React components
│   └── lib/               # Utility functions
├── prisma/                # Prisma schema
├── scripts/               # Seed scripts
├── .env.example          # Environment template
├── package.json           # Dependencies
└── README.md             # This file
```

## Notes

- **No OAuth**: This is a single-admin system. No multi-user or OAuth support.
- **No File Upload**: Document storage is not included.
- **No Background Workers**: Follow-ups are stored and displayed. Owner marks them complete manually.
- **Manual WhatsApp**: Only `wa.me` link generation. No automated messaging.
- **India-Focused**: Default country code +91, currency INR (₹).

## Troubleshooting

### Prisma Client Not Generated

```bash
npm run prisma:generate
```

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check MongoDB Atlas IP whitelist (allow all IPs for development: `0.0.0.0/0`)
- Ensure database name in connection string matches

### Admin Login Fails

- Run seed script: `npm run seed`
- Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`
- Check database for admin record

### Build Errors on Vercel

- Ensure all environment variables are set in Vercel
- Check `NODE_ENV=production` is set
- Verify Prisma generates correctly: `npm run prisma:generate`

## License

This project is provided as-is for use by a single car reseller business.

## Support

For issues or questions, check:
1. Environment variables are set correctly
2. Database connection is working
3. Prisma schema is pushed to database
4. Admin account is seeded

---

**Built with ❤️ for small car reseller businesses in India**







