# Quick Start

For comprehensive setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## TL;DR

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Create server/.env
# PORT=3000
# DATABASE_URL=your_supabase_connection_string
# DIRECT_URL=your_supabase_direct_url
# JWT_SECRET=your_secret_key_here

# 3. Create client/.env
# VITE_API_URL=http://localhost:3000

# 4. Setup database
cd server && npx prisma db push

# 5. Start servers
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev

# 6. Open http://localhost:5173
```

## Quick Usage

1. Sign up for an account
2. Create notes with the `+` button
3. Notes auto-save after 1 second
4. Use tags for organization
5. Works offline, syncs when online

## Documentation

- [Full Setup Guide](./SETUP_GUIDE.md)
- [Development Summary](./DEVELOPMENT_SUMMARY.md)
- [API Specification](./Docs/api-spec.md)
- [Changelog](./CHANGELOG.md)
