import React from 'react';

const TodoItem = ({ todo, onToggleComplete, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      onDelete(todo.id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <div className="todo-header">
          <div className="todo-title-row">
            <h3 className="todo-title">{todo.title}</h3>
            <span className={`category-badge category-${todo.category.toLowerCase()}`}>
              {todo.category}
            </span>
          </div>
          
          {todo.description && (
            <p className="todo-description">{todo.description}</p>
          )}
          
          <div className="todo-meta">
            <span className="todo-date">Created: {formatDate(todo.created_at)}</span>
          </div>
        </div>

        <div className="todo-actions">
          <button
            onClick={() => onToggleComplete(todo.id, todo.completed)}
            className={`btn btn-toggle ${todo.completed ? 'btn-undo' : 'btn-complete'}`}
            title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {todo.completed ? '↶' : '✓'}
          </button>
          
          <button
            onClick={() => onEdit(todo)}
            className="btn btn-edit"
            title="Edit todo"
          >
            ✎
          </button>
          
          <button
            onClick={handleDelete}
            className="btn btn-delete"
            title="Delete todo"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;