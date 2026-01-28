# VibeNotes - Quick Setup Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or Supabase account)
- Supabase account for file storage

---

## 📋 Step-by-Step Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

#### Backend (.env)
Create `server/.env` file:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/vibenotes?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/vibenotes?schema=public"

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Supabase Configuration (for attachments)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-supabase-service-role-key"
SUPABASE_BUCKET_NAME="attachments"

# Server Port (optional)
PORT=3000
```

#### Frontend (.env)
Create `client/.env` file:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Set Up Supabase Storage

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project (or use existing)
3. Navigate to **Storage** → **Buckets**
4. Create a new bucket named `attachments`
5. Set bucket to **Public** (or configure RLS policies)
6. Copy your project URL and service role key to `.env`

### 4. Run Database Migrations

```bash
cd server
npx prisma migrate deploy
# Or for development:
npx prisma migrate dev
```

### 5. Generate Prisma Client

```bash
cd server
npx prisma generate
```

### 6. Start the Application

#### Option A: Development Mode (Recommended)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

#### Option B: Production Build

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

---

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health

---

## 🔧 Troubleshooting

### Backend won't start
- **Error**: "Supabase configuration is missing"
  - **Solution**: Add `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `SUPABASE_BUCKET_NAME` to `server/.env`

- **Error**: "Database connection failed"
  - **Solution**: Check `DATABASE_URL` in `server/.env`
  - Run `npx prisma migrate deploy`

### Frontend can't connect to backend
- **Error**: "Network Error" or "Failed to fetch"
  - **Solution**: Ensure backend is running on port 3000
  - Check `VITE_API_URL` in `client/.env`

### Attachments not working
- **Error**: "Failed to upload attachment"
  - **Solution**: Verify Supabase bucket exists and is named `attachments`
  - Check bucket permissions (should be public or have proper RLS)
  - Verify `SUPABASE_SERVICE_KEY` has storage permissions

---

## 📝 Quick Test

### 1. Register a New User
1. Go to http://localhost:5173
2. Click "Sign Up"
3. Enter email and password
4. Click "Sign Up"

### 2. Create a Note
1. Click "+ New Note" button
2. Enter a title
3. Start typing content (auto-saves)

### 3. Try Templates
1. Click the template icon in the sidebar
2. Select a template (e.g., "Meeting Notes")
3. Note is created with template content

### 4. Upload an Attachment
1. Select a note
2. Look for "Attachments" panel on the right
3. Click "Add Attachment"
4. Drag & drop an image or PDF
5. File uploads and appears in the list

---

## 🎯 Feature Checklist

After setup, verify these features work:

- [ ] User registration and login
- [ ] Create, edit, delete notes
- [ ] Auto-save functionality
- [ ] Markdown preview
- [ ] Tags and filtering
- [ ] Search notes
- [ ] Pin/unpin notes
- [ ] Export notes (JSON/Markdown)
- [ ] Import notes
- [ ] Template selection
- [ ] Daily note creation
- [ ] File attachments (images/PDFs)
- [ ] Storage quota display
- [ ] Offline support
- [ ] Theme toggle (light/dark)

---

## 📚 Additional Resources

- **Documentation**: See `docs/` folder
- **API Spec**: `docs/api-spec.md`
- **Architecture**: `docs/architecture.md`
- **Templates Guide**: `TEMPLATES_IMPLEMENTATION.md`
- **Attachments Guide**: `ATTACHMENTS_IMPLEMENTATION.md`

---

## 🐛 Known Issues

1. **Supabase Required**: Attachments feature requires Supabase Storage
   - **Workaround**: Feature will be disabled if Supabase is not configured

2. **LocalStorage Templates**: Custom templates are stored in browser
   - **Note**: Templates won't sync across devices

---

## 🚀 Next Steps

1. **Configure Supabase** for attachments
2. **Test all features** using the checklist above
3. **Customize templates** for your workflow
4. **Deploy to production** (see deployment guide)

---

## 💡 Pro Tips

- Use **Ctrl+S** to manually save notes
- Use **Ctrl+Shift+C** to copy note content
- Create a **daily note** with one click
- **Pin important notes** to keep them at the top
- Use **tags** for better organization
- **Export regularly** to backup your notes

---

## 📞 Need Help?

- Check `TROUBLESHOOTING.md` for common issues
- Review `SESSION_SUMMARY.md` for feature overview
- See `IMPLEMENTATION_PROGRESS.md` for development status

---

**Happy Note-Taking! ✨**
