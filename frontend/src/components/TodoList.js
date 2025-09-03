import React from 'react';
import TodoItem from './TodoItem';

const TodoList = ({ todos, onToggleComplete, onEdit, onDelete }) => {
  if (todos.length === 0) {
    return (
      <div className="todo-list-container">
        <div className="empty-state">
          <p>No todos found. Add your first todo above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="todo-list-container">
      <h2>Your Todos ({todos.length})</h2>
      <div className="todo-list">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default TodoList;