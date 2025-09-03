# Backend Documentation - TODO Application

## Overview
This is the backend implementation for a full-stack TODO application built with Node.js, Express.js, and PostgreSQL. The backend provides RESTful API endpoints for managing todos with categories (Work/Personal).

## Technologies Used
- **Node.js**: Runtime environment
- **Express.js**: Web framework for handling HTTP requests
- **PostgreSQL**: Relational database for data persistence
- **pg**: PostgreSQL client for Node.js
- **cors**: Cross-Origin Resource Sharing middleware
- **dotenv**: Environment variable management
- **nodemon**: Development tool for auto-restarting the server

## Project Structure
```
backend/
├── server.js                 # Main server file with API routes
├── database.js               # PostgreSQL connection pool configuration
├── package.json              # Project dependencies and scripts
├── .env.example              # Environment variables template
└── migrations/
    └── 001_create_todos_table.js  # Database migration script
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup
- Install PostgreSQL on your system
- Create a new database:
```sql
CREATE DATABASE todo_app;
```

### 3. Environment Configuration
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_app
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
PORT=5000
```

### 4. Database Migration
Run the migration script to create the todos table:
```bash
npm run migrate
```

### 5. Start the Server
For development (with auto-restart):
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## Database Schema

### Todos Table
```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Work', 'Personal')),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Auto-incrementing primary key
- `title`: Required todo title (max 255 characters)
- `description`: Optional todo description (unlimited text)
- `category`: Required category, must be either "Work" or "Personal"
- `completed`: Boolean flag for completion status (defaults to false)
- `created_at`: Timestamp of when the todo was created

## API Endpoints

### Base URL
`http://localhost:5000/api`

### 1. GET /todos
**Description:** Retrieve all todos or filter by category

**Query Parameters:**
- `category` (optional): Filter by "Work" or "Personal"

**Response:**
```json
[
  {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive docs for the todo app",
    "category": "Work",
    "completed": false,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

**Example Requests:**
```bash
# Get all todos
GET /api/todos

# Get only work todos
GET /api/todos?category=Work

# Get only personal todos
GET /api/todos?category=Personal
```

### 2. GET /todos/:id
**Description:** Retrieve a specific todo by ID

**URL Parameters:**
- `id`: The todo ID

**Response:**
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the todo app",
  "category": "Work",
  "completed": false,
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `404`: Todo not found

### 3. POST /todos
**Description:** Create a new todo

**Request Body:**
```json
{
  "title": "New todo title",
  "description": "Optional description",
  "category": "Work"
}
```

**Required Fields:**
- `title`: String (required)
- `category`: String, must be "Work" or "Personal" (required)

**Optional Fields:**
- `description`: String

**Response:**
```json
{
  "id": 2,
  "title": "New todo title",
  "description": "Optional description",
  "category": "Work",
  "completed": false,
  "created_at": "2024-01-15T11:00:00.000Z"
}
```

**Error Responses:**
- `400`: Missing required fields or invalid category

### 4. PUT /todos/:id
**Description:** Update an existing todo

**URL Parameters:**
- `id`: The todo ID

**Request Body (all fields optional):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "category": "Personal",
  "completed": true
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Updated title",
  "description": "Updated description",
  "category": "Personal",
  "completed": true,
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `404`: Todo not found
- `400`: Invalid category value

### 5. DELETE /todos/:id
**Description:** Delete a todo

**URL Parameters:**
- `id`: The todo ID

**Response:**
```json
{
  "message": "Todo deleted successfully",
  "todo": {
    "id": 1,
    "title": "Deleted todo title",
    "description": "Description of deleted todo",
    "category": "Work",
    "completed": false,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `404`: Todo not found

### 6. GET /health
**Description:** Health check endpoint

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Error Handling
The API returns appropriate HTTP status codes and error messages:

- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation errors)
- `404`: Resource not found
- `500`: Internal server error

Error response format:
```json
{
  "error": "Error message describing what went wrong"
}
```

## CORS Configuration
The server is configured to accept requests from any origin using the `cors` middleware. In production, you should configure this to only allow requests from your frontend domain.

## Database Connection
The application uses connection pooling for efficient database connections. The pool is configured in `database.js` and reused across all API endpoints.

## Development Notes

### Adding New Endpoints
1. Add the route handler in `server.js`
2. Follow the existing error handling patterns
3. Use parameterized queries to prevent SQL injection
4. Test with various input scenarios

### Database Migrations
To add new database changes:
1. Create a new migration file in the `migrations/` directory
2. Follow the naming convention: `XXX_description.js`
3. Add the migration script to `package.json`

### Environment Variables
All configuration should use environment variables. Never commit sensitive information like database passwords to version control.

## Security Considerations
- Uses parameterized queries to prevent SQL injection
- Input validation on required fields
- Environment variables for sensitive configuration
- CORS configuration (should be restricted in production)

## Testing the API
You can test the API endpoints using tools like:
- Postman
- curl
- Thunder Client (VS Code extension)
- Your frontend application

Example curl commands:
```bash
# Create a new todo
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test todo","category":"Work","description":"Testing the API"}'

# Get all todos
curl http://localhost:5000/api/todos

# Update a todo
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete a todo
curl -X DELETE http://localhost:5000/api/todos/1
```

## Troubleshooting

### Common Issues
1. **Database connection errors**: Check your PostgreSQL service is running and credentials are correct
2. **Port conflicts**: Change the PORT in `.env` if 5000 is already in use
3. **CORS errors**: Ensure the frontend is making requests to the correct backend URL
4. **Migration failures**: Check database permissions and that the database exists

### Logs
The server logs important information to the console, including:
- Server startup confirmation
- Database connection status
- Error messages with stack traces
- API request information (in development)