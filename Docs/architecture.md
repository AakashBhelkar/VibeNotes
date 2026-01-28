# Architecture Overview

## 1. High-Level System Design
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express (TypeScript)
- Database: PostgreSQL (via Prisma) OR MongoDB (Mongoose) depending on choice
- Offline DB: IndexedDB via Dexie
- Storage: S3/Supabase Storage (optional)
- Auth: Supabase Auth or JWT-based custom auth
- Deployment:
  - Frontend → Vercel
  - Backend → Render/Railway/Supabase Edge Functions
  - DB → Supabase/Postgres or MongoDB Atlas

## 2. App Layers
- **Presentation Layer**: React components, state, routing.
- **Domain Layer**: Note model, Tag model, SyncQueue, Dexie adapter.
- **Infrastructure Layer**:
  - API client (fetch wrapper)
  - IndexedDB local storage
  - Network listener (online/offline)
  - Sync manager

## 3. Sync Logic
- Auto-save data → IndexedDB
- If offline → Queue operations (create/update/delete)
- When online → Flush operations to backend
- Handle 409 conflict (client vs server)
- Optional: conflict resolution modal

## 4. State Management
Options: React Query or Zustand  
(Choose depending on comfort. Default = React Query.)

## 5. Rendering Optimization
- Virtualized note list (react-window).
- Debounced search.


Prisma Schema Version (if needed)
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  displayName String?
  createdAt   DateTime @default(now())
  notes       Note[]
}

model Note {
  id        String   @id @default(uuid())
  userId    String
  title     String
  content   String
  tags      String[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  version   Int      @default(1)
  isArchived Boolean @default(false)
  isPinned  Boolean @default(false)

  user User @relation(fields: [userId], references: [id])
}

model Attachment {
  id       String @id @default(uuid())
  noteId   String
  url      String
  fileName String
  size     Int

  note Note @relation(fields: [noteId], references: [id])
}