const express = require('express');
const cors = require('cors');
const pool = require('./database');
const TodoValidationService = require('./services/todoValidation');
const TavilyService = require('./services/tavily');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const todoValidationService = new TodoValidationService();
const tavilyService = new TavilyService();

app.use(cors());
app.use(express.json());

// GET all todos
app.get('/api/todos', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM todos ORDER BY created_at DESC';
    let queryParams = [];
    
    if (category && (category === 'Work' || category === 'Personal')) {
      query = 'SELECT * FROM todos WHERE category = $1 ORDER BY created_at DESC';
      queryParams = [category];
    }
    
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single todo by ID
app.get('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }
    
    if (category !== 'Work' && category !== 'Personal') {
      return res.status(400).json({ error: 'Category must be either "Work" or "Personal"' });
    }
    
    const result = await pool.query(
      'INSERT INTO todos (title, description, category) VALUES ($1, $2, $3) RETURNING *',
      [title, description || '', category]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, completed } = req.body;
    
    const checkResult = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const existingTodo = checkResult.rows[0];
    const updatedTitle = title !== undefined ? title : existingTodo.title;
    const updatedDescription = description !== undefined ? description : existingTodo.description;
    const updatedCategory = category !== undefined ? category : existingTodo.category;
    const updatedCompleted = completed !== undefined ? completed : existingTodo.completed;
    
    if (updatedCategory && updatedCategory !== 'Work' && updatedCategory !== 'Personal') {
      return res.status(400).json({ error: 'Category must be either "Work" or "Personal"' });
    }
    
    const result = await pool.query(
      'UPDATE todos SET title = $1, description = $2, category = $3, completed = $4 WHERE id = $5 RETURNING *',
      [updatedTitle, updatedDescription, updatedCategory, updatedCompleted, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json({ message: 'Todo deleted successfully', todo: result.rows[0] });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST validate todo against real-time data
app.post('/api/todos/validate', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Text is required and must be a non-empty string' });
    }

    const validationResult = await todoValidationService.validateTodo(text.trim());
    
    res.json(validationResult);
  } catch (error) {
    console.error('Error validating todo:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to validate todo',
      details: error.message 
    });
  }
});

// POST create validated todo with metadata  
app.post('/api/todos/create', async (req, res) => {
  try {
    const { text, title, description, category } = req.body;
    
    let validationResult = null;
    let finalTitle = title;
    let finalDescription = description;
    let finalCategory = category || 'Personal';
    
    if (text && typeof text === 'string' && text.trim() !== '') {
      validationResult = await todoValidationService.validateTodo(text.trim());
      
      if (!finalTitle && validationResult.parsedData.task) {
        finalTitle = validationResult.parsedData.task;
      }
      
      if (!finalDescription && validationResult.parsedData) {
        finalDescription = `Parsed from: "${text}"`;
      }
      
      if (validationResult.parsedData.category) {
        finalCategory = validationResult.parsedData.category;
      }
    }
    
    if (!finalTitle) {
      return res.status(400).json({ error: 'Title is required (either directly or through text parsing)' });
    }
    
    if (finalCategory !== 'Work' && finalCategory !== 'Personal') {
      finalCategory = 'Personal'; 
    }
    
    const insertQuery = `
      INSERT INTO todos (
        title, description, category, original_text, parsed_data, 
        validation_status, business_info, suggested_alternatives, 
        scheduled_datetime, location_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *
    `;
    
    const values = [
      finalTitle,
      finalDescription || '',
      finalCategory,
      validationResult?.originalText || text || null,
      validationResult?.parsedData || null,
      validationResult?.validationStatus || 'pending',
      validationResult?.businessInfo || null,
      validationResult?.suggestedAlternatives || null,
      validationResult?.scheduledDatetime || null,
      validationResult?.locationData || null
    ];
    
    const result = await pool.query(insertQuery, values);
    
    res.status(201).json({
      todo: result.rows[0],
      validation: validationResult
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create todo',
      details: error.message 
    });
  }
});

// GET alternative suggestions for a todo
app.get('/api/todos/suggestions/:todoId', async (req, res) => {
  try {
    const { todoId } = req.params;
    
    const todoResult = await pool.query('SELECT * FROM todos WHERE id = $1', [todoId]);
    
    if (todoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const todo = todoResult.rows[0];
    
    if (!todo.parsed_data || !todo.business_info) {
      return res.json({ 
        suggestions: [],
        message: 'No additional suggestions available for this todo'
      });
    }
    
    const alternatives = await todoValidationService.generateAlternatives(
      todoId,
      todo.parsed_data,
      todo.business_info,
      todo.validation_issues || []
    );
    
    res.json({
      todoId,
      suggestions: alternatives,
      currentStatus: todo.validation_status
    });
  } catch (error) {
    console.error('Error fetching todo suggestions:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch suggestions',
      details: error.message 
    });
  }
});

// GET search nearby businesses
app.get('/api/search/businesses', async (req, res) => {
  try {
    const { type, location, limit = 5 } = req.query;
    
    if (!type || !location) {
      return res.status(400).json({ 
        error: 'Both type and location parameters are required' 
      });
    }
    
    const maxResults = Math.min(parseInt(limit) || 5, 10);
    
    const businesses = await tavilyService.searchNearbyBusinesses(
      type,
      location,
      maxResults
    );
    
    res.json({
      query: {
        type,
        location,
        limit: maxResults
      },
      results: businesses
    });
  } catch (error) {
    console.error('Error searching businesses:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to search businesses',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});