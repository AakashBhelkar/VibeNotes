# Data Models

## User
- id: uuid
- email: string
- displayName: string
- createdAt: timestamp

## Note
- id: uuid
- userId: uuid
- title: string
- content: string (markdown)
- tags: string[]
- createdAt: timestamp
- updatedAt: timestamp
- version: int
- isArchived: boolean
- isPinned: boolean

## Attachment (optional)
- id: uuid
- noteId: uuid
- url: string
- filename: string
- size: number
