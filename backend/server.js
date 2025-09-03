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

// POST create new todo (enhanced for smart features)
app.post('/api/todos', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      original_text, 
      date, 
      business, 
      location, 
      validation_status 
    } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }
    
    if (category !== 'Work' && category !== 'Personal') {
      return res.status(400).json({ error: 'Category must be either "Work" or "Personal"' });
    }
    
    const result = await pool.query(
      `INSERT INTO todos (title, description, category, original_text, date, business, location, validation_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        title, 
        description || '', 
        category,
        original_text || null,
        date || null,
        business ? JSON.stringify(business) : null,
        location ? JSON.stringify(location) : null,
        validation_status || 'pending'
      ]
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

// POST validate todo text (mock implementation - replace with real AI service)
app.post('/api/validate-todo', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Mock AI validation logic - replace with actual AI service call
    const mockValidation = mockValidateTodo(text.trim());
    
    res.json(mockValidation);
  } catch (error) {
    console.error('Error validating todo:', error);
    res.status(500).json({ error: 'Validation service error' });
  }
});

// POST get alternative suggestions (mock implementation - replace with real AI service)
app.post('/api/get-alternatives', async (req, res) => {
  try {
    const { todoId, originalText } = req.body;
    
    if (!originalText || !originalText.trim()) {
      return res.status(400).json({ error: 'Original text is required' });
    }
    
    // Mock alternative suggestions logic - replace with actual AI service call
    const mockSuggestions = mockGetAlternatives(originalText.trim());
    
    res.json({ suggestions: mockSuggestions });
  } catch (error) {
    console.error('Error getting alternatives:', error);
    res.status(500).json({ error: 'Alternatives service error' });
  }
});

// Mock validation function - replace with real AI integration
function mockValidateTodo(text) {
  const parsed = {
    task: null,
    description: null,
    category: 'Personal',
    date: null,
    business: null,
    location: null,
    warnings: []
  };
  
  // Simple parsing logic for demo
  const lowerText = text.toLowerCase();
  
  // Extract potential task
  parsed.task = text;
  
  // Detect category
  if (lowerText.includes('work') || lowerText.includes('meeting') || lowerText.includes('office')) {
    parsed.category = 'Work';
  }
  
  // Detect dates
  const datePatterns = [
    /\b(today|tomorrow|next week|this friday|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\b(\d{1,2}\/\d{1,2}\/?\d{0,4})\b/,
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w* \d{1,2}\b/i
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // For demo, set a mock date
      const now = new Date();
      now.setDate(now.getDate() + 1);
      parsed.date = now.toISOString();
      break;
    }
  }
  
  // Detect business names
  const businessPatterns = [
    /\bat ([a-z\s]+(?:store|shop|market|restaurant|cafe|bakery|pharmacy|bank|gym))/i,
    /\bfrom ([a-z\s]+(?:store|shop|market|restaurant|cafe|bakery|pharmacy|bank|gym))/i,
    /(grafs pastry|walmart|target|kroger|mcdonalds|starbucks)/i
  ];
  
  for (const pattern of businessPatterns) {
    const match = text.match(pattern);
    if (match) {
      const businessName = match[1] || match[0];
      parsed.business = {
        name: businessName.trim(),
        hours: 'Mon-Fri 9AM-9PM',
        phone: '(555) 123-4567',
        address: '123 Main St, Farmington Hills, MI',
        rating: '4.5'
      };
      parsed.location = {
        address: '123 Main St, Farmington Hills, MI',
        distance: '2.5 miles'
      };
      break;
    }
  }
  
  // Add warnings for demo
  if (parsed.business && lowerText.includes('tomorrow')) {
    parsed.warnings.push('Store may be closed on the requested date');
  }
  
  // Determine validation status
  const valid = parsed.task && !parsed.warnings.length;
  const hasWarnings = parsed.warnings.length > 0;
  
  return {
    valid: valid,
    parsed: parsed,
    warnings: parsed.warnings,
    suggestions: hasWarnings ? mockGetAlternatives(text) : []
  };
}

// Mock alternatives function - replace with real AI integration
function mockGetAlternatives(text) {
  const alternatives = [];
  
  if (text.toLowerCase().includes('cake') && text.toLowerCase().includes('tomorrow')) {
    alternatives.push({
      text: "Buy cake from Sweet Treats Bakery today at 2pm",
      confidence: 0.92,
      reason: "Store is open today and closes at 8pm",
      parsed: {
        task: "Buy cake",
        category: "Personal",
        date: new Date().toISOString(),
        business: {
          name: "Sweet Treats Bakery",
          hours: "Today: 7AM-8PM",
          phone: "(555) 987-6543",
          address: "456 Oak Ave, Farmington Hills, MI",
          rating: "4.7",
          distance: "1.8 miles"
        }
      },
      benefits: [
        "Store is currently open",
        "Higher rating than original choice",
        "Closer to your location"
      ]
    });
    
    alternatives.push({
      text: "Buy cake from Grafs Pastry on Saturday morning",
      confidence: 0.88,
      reason: "Same bakery but when they're definitely open",
      parsed: {
        task: "Buy cake",
        category: "Personal",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        business: {
          name: "Grafs Pastry",
          hours: "Sat: 7AM-6PM",
          phone: "(555) 123-4567",
          address: "123 Main St, Farmington Hills, MI",
          rating: "4.5"
        }
      },
      benefits: [
        "Your original preferred bakery",
        "Weekend hours are more reliable",
        "Fresh Saturday morning selection"
      ]
    });
  }
  
  return alternatives;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});