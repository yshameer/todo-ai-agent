# Backend Documentation - TODO Application

## Overview
This is the backend implementation for an intelligent TODO application built with Node.js, Express.js, and PostgreSQL. The backend provides RESTful API endpoints for managing todos with categories (Work/Personal) and includes advanced features like natural language processing, real-time business validation, and intelligent suggestions powered by OpenAI and Tavily APIs.

## Technologies Used
- **Node.js**: Runtime environment
- **Express.js**: Web framework for handling HTTP requests
- **PostgreSQL**: Relational database for data persistence
- **pg**: PostgreSQL client for Node.js
- **cors**: Cross-Origin Resource Sharing middleware
- **dotenv**: Environment variable management
- **nodemon**: Development tool for auto-restarting the server
- **OpenAI API**: Natural language processing for todo parsing
- **Tavily API**: Real-time business search and validation
- **axios**: HTTP client for external API calls

## Project Structure
```
backend/
├── server.js                 # Main server file with API routes (including intelligent endpoints)
├── database.js               # PostgreSQL connection pool configuration
├── package.json              # Project dependencies and scripts
├── .env.example              # Environment variables template (includes AI API keys)
├── test-intelligent-todo.js  # Test script for intelligent features
├── services/
│   ├── openai.js             # OpenAI API integration for natural language processing
│   ├── tavily.js             # Tavily API integration for business search and validation
│   └── todoValidation.js     # Core validation orchestration service
└── migrations/
    ├── 001_create_todos_table.js         # Initial database migration
    └── 002_extend_todos_intelligent_fields.js  # Intelligent features database extension
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

2. Update the `.env` file with your database credentials and API keys:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_app
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
PORT=5000

# AI Services API Keys (optional but recommended for full functionality)
OPENAI_API_KEY=your_openai_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

**Note:** The application will work without AI API keys, but intelligent features will be disabled. You'll see warning messages in the console.

### 4. Database Migration
Run the migration scripts to create the todos table and extend it with intelligent fields:
```bash
# Create initial todos table
npm run migrate

# Extend table with intelligent features
node migrations/002_extend_todos_intelligent_fields.js
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

### Todos Table (Extended with Intelligent Features)
```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Work', 'Personal')),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Intelligent Features (added in migration 002)
  original_text TEXT,
  parsed_data JSONB,
  validation_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_status IN ('valid', 'warning', 'requires_attention', 'pending')),
  business_info JSONB,
  suggested_alternatives JSONB,
  scheduled_datetime TIMESTAMP,
  location_data JSONB
);
```

**Core Fields:**
- `id`: Auto-incrementing primary key
- `title`: Required todo title (max 255 characters)
- `description`: Optional todo description (unlimited text)
- `category`: Required category, must be either "Work" or "Personal"
- `completed`: Boolean flag for completion status (defaults to false)
- `created_at`: Timestamp of when the todo was created

**Intelligent Fields:**
- `original_text`: Original natural language input from user
- `parsed_data`: JSON object containing structured data extracted by OpenAI (task, date, business_name, location, etc.)
- `validation_status`: Status of real-time validation ('valid', 'warning', 'requires_attention', 'pending')
- `business_info`: JSON object containing business information from Tavily API (hours, contact, address, etc.)
- `suggested_alternatives`: JSON object containing AI-generated alternative suggestions
- `scheduled_datetime`: Parsed and structured datetime for the todo
- `location_data`: JSON object containing location information (address, coordinates, etc.)

## API Endpoints

### Base URL
`http://localhost:5000/api`

## Intelligent Todo Endpoints

### 1. POST /todos/validate
**Description:** Validate a natural language todo entry with real-time data

**Request Body:**
```json
{
  "text": "buy a cake Friday 09/05 from Grafs Pastry in Farmington Hills, MI"
}
```

**Response:**
```json
{
  "originalText": "buy a cake Friday 09/05 from Grafs Pastry in Farmington Hills, MI",
  "parsedData": {
    "task": "buy a cake",
    "date": "2025-09-05",
    "time": null,
    "business_name": "Grafs Pastry",
    "business_type": "bakery",
    "location": "Farmington Hills, MI",
    "urgency": "medium",
    "category": "Personal"
  },
  "validationStatus": "requires_attention",
  "businessInfo": {
    "name": "Grafs Pastry",
    "hours": "Mon-Sat: 7:00 AM - 8:00 PM, Closed Sundays",
    "contact": "(248) 555-0123",
    "address": "123 Main St, Farmington Hills, MI",
    "status": "found"
  },
  "validationIssues": [
    {
      "type": "business_hours",
      "message": "Business appears to be closed on Friday",
      "suggestions": ["Try a different day", "Contact business to confirm hours"]
    }
  ],
  "suggestedAlternatives": {
    "suggestions": [
      {
        "type": "alternative_dates",
        "description": "Try Thursday or Saturday when the bakery is open",
        "action": "update_date"
      }
    ],
    "reasoning": "Business is closed on the requested date"
  }
}
```

### 2. POST /todos/create
**Description:** Create a validated todo with intelligent metadata (enhanced version of original POST /todos)

**Request Body:**
```json
{
  "text": "schedule dentist appointment next Tuesday at 2 PM",
  "title": "Optional manual title override",
  "description": "Optional description",
  "category": "Personal"
}
```

**Response:**
```json
{
  "todo": {
    "id": 1,
    "title": "schedule dentist appointment",
    "description": "Parsed from: \"schedule dentist appointment next Tuesday at 2 PM\"",
    "category": "Personal",
    "completed": false,
    "created_at": "2025-09-03T10:30:00.000Z",
    "original_text": "schedule dentist appointment next Tuesday at 2 PM",
    "parsed_data": {
      "task": "schedule dentist appointment",
      "date": "2025-09-10",
      "time": "14:00",
      "business_name": null,
      "business_type": "healthcare",
      "location": null,
      "urgency": "medium",
      "category": "Personal"
    },
    "validation_status": "valid",
    "scheduled_datetime": "2025-09-10T14:00:00.000Z"
  },
  "validation": {
    "validationStatus": "valid",
    "validationIssues": []
  }
}
```

### 3. GET /todos/suggestions/:todoId
**Description:** Get alternative suggestions for a problematic todo

**URL Parameters:**
- `todoId`: The todo ID

**Response:**
```json
{
  "todoId": "1",
  "suggestions": [
    {
      "type": "alternative_businesses",
      "title": "Try nearby businesses",
      "options": [
        {
          "name": "Sweet Dreams Bakery",
          "description": "Local bakery specializing in custom cakes",
          "action": "replace_business"
        }
      ]
    },
    {
      "type": "alternative_dates",
      "title": "Try different dates",
      "options": [
        {
          "date": "2025-09-06",
          "description": "Saturday, September 6",
          "action": "update_date"
        }
      ]
    }
  ],
  "currentStatus": "requires_attention"
}
```

### 4. GET /search/businesses
**Description:** Search for nearby businesses by type and location

**Query Parameters:**
- `type`: Type of business (required)
- `location`: Location to search (required)
- `limit`: Maximum results to return (optional, max 10, default 5)

**Response:**
```json
{
  "query": {
    "type": "bakery",
    "location": "Farmington Hills, MI",
    "limit": 5
  },
  "results": [
    {
      "name": "Sweet Dreams Bakery",
      "url": "https://example.com",
      "description": "Local bakery with custom cakes and pastries",
      "source": "Sweet Dreams Bakery - Custom Cakes"
    }
  ]
}
```

## Standard Todo Endpoints (Original API)

### 5. GET /todos
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

### 6. GET /todos/:id
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

### 7. POST /todos
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

### 8. PUT /todos/:id
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

### 9. DELETE /todos/:id
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

### 10. GET /health
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

## Intelligent Features

### Natural Language Processing
The application uses OpenAI's GPT-3.5-turbo model to parse natural language todo entries and extract:
- **Task**: The main action to be performed
- **Date/Time**: When the task should be completed
- **Business Information**: Name and type of business mentioned
- **Location**: Where the task takes place
- **Category**: Automatic categorization as Work or Personal
- **Urgency**: Inferred priority level

### Real-time Business Validation
Using the Tavily API, the system validates business information in real-time:
- **Business Hours**: Checks if businesses are open on scheduled dates
- **Contact Information**: Retrieves phone numbers and addresses
- **Location Verification**: Confirms business locations and details
- **Status Tracking**: Monitors availability and operational status

### Intelligent Suggestions
When validation issues are detected, the system generates helpful alternatives:
- **Alternative Businesses**: Suggests nearby similar businesses
- **Date Alternatives**: Recommends different dates when businesses are open
- **Time Adjustments**: Proposes better scheduling times
- **Manual Review**: Flags items requiring human attention

### Example Workflow
1. **Input**: "buy a cake Friday 09/05 from Grafs Pastry in Farmington Hills, MI"
2. **Parse**: OpenAI extracts task, date, business name, and location
3. **Validate**: Tavily searches for Grafs Pastry business information
4. **Check**: System validates business hours for the requested date
5. **Suggest**: If closed, generates alternative dates or nearby bakeries
6. **Store**: Saves all data with validation status and suggestions

### Graceful Degradation
The system works without API keys:
- **Without OpenAI**: Returns basic parsing with original text as task
- **Without Tavily**: Skips business validation, returns 'api_not_configured' status
- **Partial Data**: Still creates todos with available information
- **Warning Messages**: Console logs inform about missing API keys

### Testing
Use the included test script:
```bash
node test-intelligent-todo.js
```

This demonstrates the intelligent features with or without API keys configured.

## Troubleshooting

### Common Issues
1. **Database connection errors**: Check your PostgreSQL service is running and credentials are correct
2. **Port conflicts**: Change the PORT in `.env` if 5000 is already in use
3. **CORS errors**: Ensure the frontend is making requests to the correct backend URL
4. **Migration failures**: Check database permissions and that the database exists
5. **AI API Errors**: Verify API keys are correct and have sufficient quota
6. **Validation Timeouts**: Check network connectivity for external API calls

### Logs
The server logs important information to the console, including:
- Server startup confirmation
- Database connection status
- AI service initialization warnings
- Error messages with stack traces
- API request information (in development)

### AI Service Configuration
- **OpenAI API**: Requires valid API key with GPT-3.5-turbo access
- **Tavily API**: Requires valid API key for business search functionality
- **Rate Limits**: Be aware of API rate limits and implement appropriate error handling
- **Costs**: Monitor API usage as intelligent features incur per-request costs