import React, { useState } from 'react';

const TodoItem = ({ todo, onToggleComplete, onEdit, onDelete, onGetAlternatives }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      onDelete(todo.id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTargetDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getValidationStatusBadge = (status) => {
    switch (status) {
      case 'valid':
        return { icon: '✅', text: 'Validated', className: 'status-valid' };
      case 'warning':
        return { icon: '⚠️', text: 'Has Warnings', className: 'status-warning' };
      case 'error':
        return { icon: '❌', text: 'Needs Review', className: 'status-error' };
      default:
        return null;
    }
  };

  const statusBadge = getValidationStatusBadge(todo.validation_status);

  return (
    <div className={`todo-item enhanced ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <div className="todo-header">
          <div className="todo-title-row">
            <h3 className="todo-title">{todo.title}</h3>
            <div className="todo-badges">
              <span className={`category-badge category-${todo.category.toLowerCase()}`}>
                {todo.category}
              </span>
              {statusBadge && (
                <span className={`validation-badge ${statusBadge.className}`}>
                  <span className="badge-icon">{statusBadge.icon}</span>
                  {statusBadge.text}
                </span>
              )}
            </div>
          </div>
          
          {todo.original_text && (
            <div className="original-text">
              <span className="original-label">Original: </span>
              "{todo.original_text}"
            </div>
          )}
          
          {todo.description && (
            <p className="todo-description">{todo.description}</p>
          )}

          {todo.date && (
            <div className="target-date">
              <span className="date-icon">📅</span>
              <span className="date-text">{formatTargetDate(todo.date)}</span>
            </div>
          )}

          {(todo.business || todo.location) && (
            <div className="location-business-info">
              {todo.business && (
                <div className="business-info-compact">
                  <span className="business-icon">🏪</span>
                  <span className="business-name">{todo.business.name || todo.business}</span>
                  {todo.business.phone && (
                    <span className="business-phone">📞 {todo.business.phone}</span>
                  )}
                </div>
              )}
              
              {todo.location && (
                <div className="location-info-compact">
                  <span className="location-icon">📍</span>
                  <span className="location-text">
                    {typeof todo.location === 'string' ? todo.location : todo.location.address}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <div className="todo-meta">
            <span className="todo-date">Created: {formatDate(todo.created_at)}</span>
            {(todo.business || todo.location) && (
              <button 
                className="show-details-btn"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Less Details' : 'More Details'} {showDetails ? '▲' : '▼'}
              </button>
            )}
          </div>

          {showDetails && (todo.business || todo.location) && (
            <div className="detailed-info">
              {todo.business && typeof todo.business === 'object' && (
                <div className="business-details">
                  <h4>Business Information</h4>
                  <div className="business-card">
                    <div className="business-header">
                      <span className="business-name">{todo.business.name}</span>
                      {todo.business.rating && (
                        <span className="business-rating">⭐ {todo.business.rating}</span>
                      )}
                    </div>
                    
                    {todo.business.hours && (
                      <div className="business-hours">
                        <strong>Hours:</strong> {todo.business.hours}
                      </div>
                    )}
                    
                    {todo.business.phone && (
                      <div className="business-phone">
                        <strong>Phone:</strong> {todo.business.phone}
                      </div>
                    )}
                    
                    {todo.business.address && (
                      <div className="business-address">
                        <strong>Address:</strong> {todo.business.address}
                      </div>
                    )}

                    {todo.business.distance && (
                      <div className="business-distance">
                        <strong>Distance:</strong> {todo.business.distance}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="todo-actions">
          <button
            onClick={() => onToggleComplete(todo.id, todo.completed)}
            className={`btn btn-toggle ${todo.completed ? 'btn-undo' : 'btn-complete'}`}
            title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {todo.completed ? '↶' : '✓'}
          </button>

          {onGetAlternatives && !todo.completed && (
            <button
              onClick={() => onGetAlternatives(todo)}
              className="btn btn-alternatives"
              title="Get alternative suggestions"
            >
              💡
            </button>
          )}
          
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