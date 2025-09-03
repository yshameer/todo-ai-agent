import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import CategoryFilter from './components/CategoryFilter';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingTodo, setEditingTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    filterTodos();
  }, [todos, selectedCategory]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/todos`);
      setTodos(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch todos. Please check if the server is running.');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterTodos = () => {
    if (selectedCategory === 'All') {
      setFilteredTodos(todos);
    } else {
      setFilteredTodos(todos.filter(todo => todo.category === selectedCategory));
    }
  };

  const addTodo = async (todoData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/todos`, todoData);
      setTodos([response.data, ...todos]);
      setError('');
    } catch (err) {
      setError('Failed to create todo');
      console.error('Error creating todo:', err);
    }
  };

  const updateTodo = async (id, updateData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/todos/${id}`, updateData);
      setTodos(todos.map(todo => 
        todo.id === id ? response.data : todo
      ));
      setEditingTodo(null);
      setError('');
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  const toggleComplete = async (id, completed) => {
    await updateTodo(id, { completed: !completed });
  };

  const startEdit = (todo) => {
    setEditingTodo(todo);
  };

  const cancelEdit = () => {
    setEditingTodo(null);
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="app-title">TODO App</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <TodoForm 
          onSubmit={addTodo}
          editingTodo={editingTodo}
          onUpdate={updateTodo}
          onCancel={cancelEdit}
        />
        
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          todoCounts={{
            All: todos.length,
            Work: todos.filter(t => t.category === 'Work').length,
            Personal: todos.filter(t => t.category === 'Personal').length
          }}
        />
        
        {loading ? (
          <div className="loading">Loading todos...</div>
        ) : (
          <TodoList 
            todos={filteredTodos}
            onToggleComplete={toggleComplete}
            onEdit={startEdit}
            onDelete={deleteTodo}
          />
        )}
      </div>
    </div>
  );
}

export default App;