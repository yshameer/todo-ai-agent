const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory storage for demo purposes
let todos = [
  {
    id: 1,
    title: 'Complete project documentation',
    description: 'Write comprehensive docs for the todo app',
    category: 'Work',
    completed: false,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, vegetables',
    category: 'Personal',
    completed: false,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Review code changes',
    description: 'Review the new feature implementation',
    category: 'Work',
    completed: true,
    created_at: new Date().toISOString()
  }
];

let nextId = 4;

// GET all todos
app.get('/api/todos', (req, res) => {
  try {
    const { category } = req.query;
    let filteredTodos = todos;
    
    if (category && (category === 'Work' || category === 'Personal')) {
      filteredTodos = todos.filter(todo => todo.category === category);
    }
    
    // Sort by creation date, newest first
    const sortedTodos = filteredTodos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json(sortedTodos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single todo by ID
app.get('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const todo = todos.find(t => t.id === parseInt(id));
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new todo
app.post('/api/todos', (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }
    
    if (category !== 'Work' && category !== 'Personal') {
      return res.status(400).json({ error: 'Category must be either "Work" or "Personal"' });
    }
    
    const newTodo = {
      id: nextId++,
      title,
      description: description || '',
      category,
      completed: false,
      created_at: new Date().toISOString()
    };
    
    todos.push(newTodo);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update todo
app.put('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, completed } = req.body;
    
    const todoIndex = todos.findIndex(t => t.id === parseInt(id));
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const existingTodo = todos[todoIndex];
    
    // Update fields if provided, keep existing values if not
    const updatedTodo = {
      ...existingTodo,
      title: title !== undefined ? title : existingTodo.title,
      description: description !== undefined ? description : existingTodo.description,
      category: category !== undefined ? category : existingTodo.category,
      completed: completed !== undefined ? completed : existingTodo.completed
    };
    
    if (updatedTodo.category && updatedTodo.category !== 'Work' && updatedTodo.category !== 'Personal') {
      return res.status(400).json({ error: 'Category must be either "Work" or "Personal"' });
    }
    
    todos[todoIndex] = updatedTodo;
    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE todo
app.delete('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const todoIndex = todos.findIndex(t => t.id === parseInt(id));
    
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const deletedTodo = todos.splice(todoIndex, 1)[0];
    res.json({ message: 'Todo deleted successfully', todo: deletedTodo });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    mode: 'demo',
    totalTodos: todos.length
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Todo Backend Server is running on port ${PORT}`);
  console.log(`📊 Demo mode: Using in-memory storage`);
  console.log(`📝 Loaded ${todos.length} sample todos`);
  console.log(`🌐 API available at: http://localhost:${PORT}/api`);
});