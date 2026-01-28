# VibeNotes Mobile App

React Native mobile application for VibeNotes - offline-first note-taking with sync.

## Features

- **Core Note CRUD**: Create, read, update, delete notes
- **Offline Storage**: SQLite for local persistence
- **Server Sync**: Full sync with existing VibeNotes API
- **Push Notifications**: FCM/APNs for sync and mentions
- **Biometric Auth**: Fingerprint/Face ID support
- **Share Extension**: Share content to VibeNotes
- **Home Widgets**: Quick note access widgets

## Tech Stack

- **Framework**: React Native 0.73+
- **Navigation**: React Navigation 6
- **State**: Zustand
- **Storage**: SQLite (react-native-sqlite-storage)
- **API**: Axios
- **Auth**: AsyncStorage + Biometrics

## Project Structure

```
mobile/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── NoteCard.tsx
│   │   ├── NoteList.tsx
│   │   ├── Editor.tsx
│   │   └── ...
│   ├── screens/          # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── NoteScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/         # API and storage services
│   │   ├── api.ts
│   │   ├── database.ts
│   │   ├── sync.ts
│   │   └── auth.ts
│   ├── hooks/            # Custom hooks
│   │   ├── useNotes.ts
│   │   ├── useSync.ts
│   │   └── useAuth.ts
│   ├── navigation/       # Navigation config
│   │   └── AppNavigator.tsx
│   ├── store/            # Zustand stores
│   │   └── noteStore.ts
│   └── App.tsx
├── android/              # Android native code
├── ios/                  # iOS native code
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS)

### Installation

1. **Clone and navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS setup**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

### Running the App

**iOS (requires macOS)**
```bash
npm run ios
```

**Android**
```bash
npm run android
```

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

## Future Enhancements

- [ ] Rich text editor
- [ ] Image attachments
- [ ] Note linking
- [ ] Full-text search
- [ ] Dark mode
- [ ] Tablet layout
- [ ] Apple Watch app
- [ ] Android Wear app

## Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT
