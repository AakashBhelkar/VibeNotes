# VibeNotes Mobile App

React Native mobile application for VibeNotes - offline-first note-taking with sync.

Built with **Expo** for easy development on Android, iOS, and Web.

## Features

- **Core Note CRUD**: Create, read, update, delete notes
- **Offline Storage**: SQLite for local persistence
- **Server Sync**: Full sync with existing VibeNotes API
- **Push Notifications**: FCM/APNs for sync and mentions (planned)
- **Biometric Auth**: Fingerprint/Face ID support (planned)

## Tech Stack

- **Framework**: Expo SDK 50 (React Native 0.73)
- **Navigation**: React Navigation 6
- **State**: Zustand
- **Storage**: expo-sqlite for local persistence
- **API**: Axios with auth interceptors
- **Auth**: AsyncStorage + Biometrics

## Project Structure

```
mobile/
├── src/
│   ├── components/       # Reusable UI components
│   │   └── NoteCard.tsx
│   ├── screens/          # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── NoteScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/         # API and storage services
│   │   ├── api.ts
│   │   ├── database.ts
│   │   └── sync.ts
│   ├── hooks/            # Custom hooks
│   │   ├── useNotes.ts
│   │   ├── useSync.ts
│   │   └── useAuth.ts
│   ├── navigation/       # Navigation config
│   │   └── AppNavigator.tsx
│   ├── store/            # Zustand stores
│   │   └── noteStore.ts
│   └── App.tsx
├── assets/               # App icons and splash screen
├── app.json              # Expo configuration
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18
- Expo Go app on your phone (for quick testing)
- OR Android Studio / Xcode (for development builds)

### Installation

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

### Running the App

**Option 1: Expo Go (Quickest)**
1. Install "Expo Go" app on your phone
2. Run `npm start`
3. Scan the QR code with your phone

**Option 2: Android Emulator**
```bash
npm run android
```

**Option 3: iOS Simulator (macOS only)**
```bash
npm run ios
```

**Option 4: Web Browser**
```bash
npm run web
```

## Configuration

### API URL

Edit `src/services/api.ts` to set your backend URL:
```typescript
const API_URL = process.env.API_URL || 'http://YOUR_IP:3000';
```

For local development, use your computer's IP address (not localhost) so the mobile device can connect.

## Architecture

### Offline-First Sync

1. All notes stored locally in SQLite
2. Changes queued for sync when online
3. Conflict resolution: last-write-wins with version tracking
4. Background sync on network reconnection

### Database Schema

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT, -- JSON array
  is_pinned INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT,
  synced_at TEXT,
  pending_sync INTEGER DEFAULT 0
);

CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id TEXT,
  action TEXT, -- 'create', 'update', 'delete'
  created_at TEXT
);
```

### API Integration

Uses the same API as the web client:
- `POST /auth/login` - Authentication
- `GET /notes` - Fetch notes
- `POST /notes` - Create note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note
- `POST /notes/sync` - Sync notes

## Building for Production

### Android APK
```bash
npx expo build:android
```

### iOS IPA
```bash
npx expo build:ios
```

### EAS Build (Recommended)
```bash
npx eas build --platform android
npx eas build --platform ios
```

## Future Enhancements

- [ ] Rich text editor
- [ ] Image attachments
- [ ] Note linking
- [ ] Full-text search
- [ ] Dark mode
- [ ] Tablet layout
- [ ] Push notifications
- [ ] Biometric authentication

## Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --clear
```

### Dependency Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Expo Go Not Connecting
- Ensure phone and computer are on same WiFi network
- Try switching to tunnel mode: `npm start -- --tunnel`

## Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT
