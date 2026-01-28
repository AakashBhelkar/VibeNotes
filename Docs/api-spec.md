# API Specification

## Auth Endpoints
POST /auth/signup
POST /auth/login

## Notes
GET    /notes?q=&tag=
POST   /notes
GET    /notes/:id
PUT    /notes/:id
DELETE /notes/:id

## Tags
GET    /tags
POST   /tags

## Attachments (optional)
POST /notes/:id/attachments

## Example: POST /notes Body
{
  "title": "My Note",
  "content": "## Markdown supported",
  "tags": ["personal", "tasks"]
}

Example Response
{
  "id": "uuid",
  "title": "...",
  "content": "...",
  "tags": [],
  "updatedAt": "2025-01-01T12:00:00Z"
}