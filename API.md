# API Specification

## Authentication Endpoints

### Register User
- **POST** `/api/auth/register`
- **Request Body**:
  ```json
  {
    "nickname": "string",
    "password": "string",
    "photo_url": "string?" // optional
  }
  ```
- **Response**: 201 Created
  ```json
  {
    "id": "string",
    "nickname": "string",
    "photo_url": "string?",
    "token": "string"
  }
  ```

### Login User
- **POST** `/api/auth/login`
- **Request Body**:
  ```json
  {
    "nickname": "string",
    "password": "string"
  }
  ```
- **Response**: 200 OK
  ```json
  {
    "id": "string",
    "nickname": "string",
    "photo_url": "string?",
    "token": "string"
  }
  ```

## User Endpoints

### Get Current Phase
- **GET** `/api/system/phase`
- **Response**: 200 OK
  ```json
  {
    "phase": "passive" | "active"
  }
  ```

### Update User Photo
- **PUT** `/api/users/photo`
- **Headers**: Authorization: Bearer {token}
- **Request Body**: FormData with 'photo' file
- **Response**: 200 OK
  ```json
  {
    "photo_url": "string"
  }
  ```

### Get Users Gallery
- **GET** `/api/users/gallery`
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**: 
  - search?: string (nickname search)
  - page?: number (default: 1)
  - limit?: number (default: 20)
- **Response**: 200 OK
  ```json
  {
    "users": [
      {
        "id": "string",
        "nickname": "string",
        "photo_url": "string?"
      }
    ],
    "total": number,
    "page": number,
    "pages": number
  }
  ```

## Notes Endpoints

### Send Note
- **POST** `/api/notes`
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "content": "string",
    "receiver_id": "string",
    "is_anonymous": boolean
  }
  ```
- **Response**: 201 Created
  ```json
  {
    "id": "string",
    "content": "string",
    "sender_id": "string",
    "receiver_id": "string",
    "is_anonymous": boolean,
    "anonym_id": "string?",
    "created_at": "datetime"
  }
  ```

### Get Sent Notes
- **GET** `/api/notes/sent`
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - page?: number (default: 1)
  - limit?: number (default: 20)
- **Response**: 200 OK
  ```json
  {
    "notes": [
      {
        "id": "string",
        "content": "string",
        "receiver_id": "string",
        "receiver_nickname": "string",
        "is_anonymous": boolean,
        "created_at": "datetime"
      }
    ],
    "total": number,
    "page": number,
    "pages": number
  }
  ```

### Get Received Notes
- **GET** `/api/notes/received`
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - page?: number (default: 1)
  - limit?: number (default: 20)
- **Response**: 200 OK
  ```json
  {
    "notes": [
      {
        "id": "string",
        "content": "string",
        "sender_id": "string?",
        "sender_nickname": "string?",
        "is_anonymous": boolean,
        "anonym_id": "string?",
        "created_at": "datetime"
      }
    ],
    "total": number,
    "page": number,
    "pages": number
  }
  ```

### Get Unread Notes Count
- **GET** `/api/notes/unread/count`
- **Headers**: Authorization: Bearer {token}
- **Response**: 200 OK
  ```json
  {
    "count": number
  }
  ```

### Mark Note as Read
- **PUT** `/api/notes/{note_id}/read`
- **Headers**: Authorization: Bearer {token}
- **Response**: 200 OK
  ```json
  {
    "success": boolean
  }
  ```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "detail": "Error message describing the problem"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid authentication credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "detail": "Too many requests"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```
