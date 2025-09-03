# Frontend Documentation - TODO Application

## Overview
This is the frontend implementation for a full-stack TODO application built with React. The frontend provides a clean, responsive user interface for managing todos with categories (Work/Personal) and communicates with the Express.js backend via REST API calls.

## Technologies Used
- **React**: UI library for building component-based interfaces
- **React Hooks**: Modern React patterns (useState, useEffect)
- **Axios**: HTTP client for API requests
- **CSS3**: Custom styling with responsive design
- **React Scripts**: Build tool and development server

## Project Structure
```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── TodoForm.js         # Form for creating/editing todos
│   │   ├── TodoList.js         # Container for todo items
│   │   ├── TodoItem.js         # Individual todo item component
│   │   └── CategoryFilter.js   # Category filtering component
│   ├── App.js                  # Main application component
│   ├── App.css                 # Application styles
│   ├── index.js                # React DOM render entry point
│   └── index.css               # Global styles
└── package.json                # Project dependencies and scripts
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration (Optional)
Create a `.env` file in the frontend directory if you need to customize the API URL:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

If not set, the app defaults to `http://localhost:5000/api`.

### 3. Start the Development Server
```bash
npm start
```

The application will start on `http://localhost:3000` and automatically open in your browser.

### 4. Build for Production
```bash
npm run build
```

This creates an optimized build in the `build/` directory.

## Component Architecture

### App.js (Main Component)
The main application component that manages the global state and coordinates between child components.

**State Management:**
- `todos`: Array of all todos from the backend
- `filteredTodos`: Filtered todos based on selected category
- `selectedCategory`: Currently active category filter ('All', 'Work', 'Personal')
- `editingTodo`: Todo currently being edited (null when not editing)
- `loading`: Loading state for API requests
- `error`: Error message display

**Key Functions:**
- `fetchTodos()`: Retrieves all todos from the backend
- `addTodo(todoData)`: Creates a new todo
- `updateTodo(id, updateData)`: Updates an existing todo
- `deleteTodo(id)`: Deletes a todo
- `toggleComplete(id, completed)`: Toggles completion status
- `startEdit(todo)`: Initiates edit mode for a todo
- `cancelEdit()`: Cancels edit mode

### TodoForm.js
Handles both creation and editing of todos with form validation.

**Features:**
- Dual-mode operation (create/edit)
- Form validation (required fields)
- Auto-population when editing
- Category selection
- Form reset after submission

**Props:**
- `onSubmit`: Function to handle new todo creation
- `editingTodo`: Todo object being edited (null for new todos)
- `onUpdate`: Function to handle todo updates
- `onCancel`: Function to cancel editing

**State:**
- `title`: Todo title input
- `description`: Todo description input
- `category`: Selected category

### TodoList.js
Container component that displays a list of todos or an empty state message.

**Features:**
- Displays todo count
- Empty state handling
- Maps through todos to render TodoItem components

**Props:**
- `todos`: Array of todos to display
- `onToggleComplete`: Function to toggle completion
- `onEdit`: Function to start editing
- `onDelete`: Function to delete todos

### TodoItem.js
Individual todo item component with actions for complete, edit, and delete.

**Features:**
- Displays todo information (title, description, category, date)
- Visual completion state
- Action buttons with hover effects
- Delete confirmation dialog
- Responsive design

**Props:**
- `todo`: Todo object to display
- `onToggleComplete`: Function to toggle completion
- `onEdit`: Function to start editing
- `onDelete`: Function to delete the todo

**Visual Elements:**
- Category badges with color coding
- Completion status styling
- Created date formatting
- Action buttons with icons

### CategoryFilter.js
Component for filtering todos by category with count display.

**Features:**
- Filter buttons for All, Work, and Personal
- Todo counts for each category
- Active filter highlighting

**Props:**
- `selectedCategory`: Currently active category
- `onCategoryChange`: Function to change category filter
- `todoCounts`: Object with counts for each category

## API Integration

The frontend communicates with the backend using Axios for HTTP requests. The API base URL is configurable via environment variables.

### API Service Functions

**GET Requests:**
```javascript
// Fetch all todos
const response = await axios.get(`${API_BASE_URL}/todos`);

// Fetch todos by category (handled by backend filtering)
const response = await axios.get(`${API_BASE_URL}/todos?category=Work`);
```

**POST Requests:**
```javascript
// Create new todo
const response = await axios.post(`${API_BASE_URL}/todos`, {
  title: 'Todo title',
  description: 'Todo description',
  category: 'Work'
});
```

**PUT Requests:**
```javascript
// Update todo
const response = await axios.put(`${API_BASE_URL}/todos/${id}`, {
  title: 'Updated title',
  completed: true
});
```

**DELETE Requests:**
```javascript
// Delete todo
await axios.delete(`${API_BASE_URL}/todos/${id}`);
```

### Error Handling
The application implements comprehensive error handling:
- Network errors are caught and displayed to users
- API errors show appropriate error messages
- Loading states prevent duplicate requests
- Confirmation dialogs prevent accidental deletions

## Styling and Design

### CSS Architecture
The application uses a modern CSS approach with:
- CSS Custom Properties (CSS Variables)
- Flexbox for layout
- CSS Grid where appropriate
- Responsive design with media queries
- Hover and focus states for accessibility

### Design System

**Colors:**
- Primary: Gradient from #667eea to #764ba2
- Success: #10b981 (complete actions)
- Warning: #f59e0b (undo actions)
- Info: #3b82f6 (edit actions)
- Danger: #ef4444 (delete actions)
- Neutral grays for text and borders

**Typography:**
- System font stack for optimal performance
- Responsive font sizes
- Proper font weights for hierarchy

**Spacing:**
- Consistent spacing scale (8px base unit)
- Proper padding and margins
- Visual separation between sections

### Responsive Design
The application is fully responsive with breakpoints at:
- **768px**: Tablet layout adjustments
- **480px**: Mobile layout optimizations

**Mobile Optimizations:**
- Stacked form elements
- Full-width action buttons
- Adjusted padding and spacing
- Improved touch targets
- Simplified navigation

## State Management

The application uses React's built-in state management with hooks:

### useState Hooks
- Component-level state for form inputs
- Global app state in the main App component
- Derived state for filtering and display logic

### useEffect Hooks
- Initial data fetching on component mount
- Automatic filtering when todos or category changes
- Cleanup and dependency management

### State Flow
1. **Initial Load**: App fetches todos from backend
2. **User Interaction**: User creates/edits/deletes todos
3. **API Call**: Frontend makes request to backend
4. **State Update**: Local state updated on success
5. **UI Re-render**: Components re-render with new data

## Features

### Core Functionality
- ✅ Create new todos with title, description, and category
- ✅ View all todos in a clean list format
- ✅ Edit existing todos inline
- ✅ Mark todos as complete/incomplete
- ✅ Delete todos with confirmation
- ✅ Filter todos by category (All, Work, Personal)
- ✅ Responsive design for all screen sizes

### User Experience Features
- Loading indicators during API calls
- Error messaging for failed operations
- Form validation and user feedback
- Confirmation dialogs for destructive actions
- Visual feedback for completed items
- Category badges for easy identification
- Todo counts in filter buttons

### Accessibility Features
- Semantic HTML structure
- Proper form labels and associations
- Keyboard navigation support
- Focus indicators
- Screen reader friendly content
- High contrast ratios

## Development Workflow

### Available Scripts
```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Eject from create-react-app (irreversible)
npm run eject
```

### Development Best Practices
1. **Component Structure**: Keep components small and focused
2. **Props Validation**: Use PropTypes or TypeScript for type safety
3. **Error Boundaries**: Implement error boundaries for production
4. **Performance**: Use React.memo for expensive components
5. **Testing**: Write unit tests for component behavior

### Browser Support
The application supports:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Deployment

### Production Build
```bash
npm run build
```

This creates optimized static files in the `build/` directory that can be served by any static file server.

### Environment Variables
For production deployment, set:
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### Deployment Options
- **Netlify**: Connect to Git repo for automatic deployments
- **Vercel**: Zero-config deployment for React apps
- **GitHub Pages**: Free hosting for static sites
- **AWS S3**: Static website hosting
- **Custom Server**: Serve build files with nginx/apache

## Testing

### Component Testing
Test components using React Testing Library:
```bash
npm test
```

### Manual Testing Checklist
- [ ] Create todos with different categories
- [ ] Edit todo titles and descriptions
- [ ] Toggle completion status
- [ ] Delete todos (with confirmation)
- [ ] Filter by category
- [ ] Responsive design on different screen sizes
- [ ] Error handling with network failures
- [ ] Form validation with empty/invalid inputs

## Troubleshooting

### Common Issues

**API Connection Problems:**
- Check that backend server is running on correct port
- Verify CORS configuration allows frontend domain
- Check network tab in browser dev tools for failed requests

**Styling Issues:**
- Clear browser cache after CSS changes
- Check for CSS specificity conflicts
- Verify responsive breakpoints in dev tools

**State Management Issues:**
- Use React Developer Tools to inspect component state
- Check for proper key props in list rendering
- Verify useEffect dependencies are correct

**Performance Issues:**
- Use React Profiler to identify slow components
- Check for unnecessary re-renders
- Optimize large lists with virtualization if needed

## Future Enhancements

### Potential Features
- User authentication and personal todos
- Due dates and reminders
- Todo priorities and sorting
- Drag and drop reordering
- Bulk operations (select multiple)
- Search functionality
- Data export/import
- Offline support with service workers
- Real-time updates with WebSockets
- Dark mode theme toggle

### Technical Improvements
- TypeScript migration for better type safety
- Unit and integration testing
- Error boundary implementation
- Performance optimization with React.memo
- PWA features (service worker, app manifest)
- Internationalization (i18n)
- Accessibility audit and improvements