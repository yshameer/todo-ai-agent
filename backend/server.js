const express = require('express');
const cors = require('cors');
const pool = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});