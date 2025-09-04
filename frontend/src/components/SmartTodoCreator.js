import React, { useState, useCallback, useRef, useEffect } from 'react';
import ValidationPanel from './ValidationPanel';
import SuggestionsInterface from './SuggestionsInterface';

const SmartTodoCreator = ({ onSubmit, onCancel, editingTodo }) => {
  const [input, setInput] = useState('');
  const [validationState, setValidationState] = useState('idle'); // idle, loading, valid, warning, error
  const [validationResults, setValidationResults] = useState(null);
  const [validationIssues, setValidationIssues] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsReasoning, setSuggestionsReasoning] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);
  const validationTimeoutRef = useRef(null);

  useEffect(() => {
    if (editingTodo) {
      setInput(editingTodo.original_text || `${editingTodo.title}${editingTodo.description ? ' - ' + editingTodo.description : ''}`);
      setValidationState('valid');
      setValidationResults({
        task: editingTodo.title,
        description: editingTodo.description,
        category: editingTodo.category,
        date: editingTodo.date,
        business: editingTodo.business,
        location: editingTodo.location,
        status: 'validated'
      });
    } else {
      resetForm();
    }
  }, [editingTodo]);

  const resetForm = () => {
    setInput('');
    setValidationState('idle');
    setValidationResults(null);
    setValidationIssues([]);
    setSuggestions([]);
    setSuggestionsReasoning('');
    setShowSuggestions(false);
    setError('');
  };

  const validateTodo = useCallback(async (text) => {
    if (!text.trim()) {
      setValidationState('idle');
      setValidationResults(null);
      return;
    }

    setValidationState('loading');
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/todos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.validationStatus === 'valid') {
        setValidationState('valid');
        setValidationResults(data.parsedData);
        setValidationIssues([]);
        setShowSuggestions(false);
      } else if (data.validationStatus === 'requires_attention' || data.validationStatus === 'warning' || (data.validationIssues && data.validationIssues.length > 0)) {
        setValidationState('warning');
        setValidationResults(data.parsedData);
        setValidationIssues(data.validationIssues || []);
        // Handle suggestedAlternatives as object with suggestions array
        const alternatives = data.suggestedAlternatives?.suggestions || data.suggestedAlternatives || [];
        const reasoning = data.suggestedAlternatives?.reasoning || '';
        setSuggestions(alternatives);
        setSuggestionsReasoning(reasoning);
        setShowSuggestions(alternatives.length > 0);
      } else {
        setValidationState('error');
        setValidationResults(data.parsedData);
        setValidationIssues(data.validationIssues || []);
        const alternatives = data.suggestedAlternatives?.suggestions || data.suggestedAlternatives || [];
        const reasoning = data.suggestedAlternatives?.reasoning || '';
        setSuggestions(alternatives);
        setSuggestionsReasoning(reasoning);
        setShowSuggestions(alternatives.length > 0);
      }
    } catch (err) {
      console.error('Validation error:', err);
      setValidationState('error');
      setError('Failed to validate todo. Please try again.');
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    
    // Reset validation state when user starts typing
    if (validationState !== 'idle') {
      setValidationState('idle');
      setValidationResults(null);
      setValidationIssues([]);
      setSuggestions([]);
      setSuggestionsReasoning('');
      setShowSuggestions(false);
      setError('');
    }
  };

  const handleValidate = async () => {
    if (!input.trim()) {
      setError('Please enter a todo description');
      return;
    }
    await validateTodo(input);
  };

  const handleSubmit = async () => {
    if (!input.trim()) {
      setError('Please enter a todo description');
      return;
    }

    if (validationState === 'loading') {
      setError('Please wait for validation to complete');
      return;
    }

    if (!validationResults) {
      setError('Please validate your todo first by clicking "Analyze Todo"');
      return;
    }

    const todoData = {
      title: validationResults.task || input.trim(),
      description: validationResults.description || '',
      category: validationResults.category || 'Personal',
      original_text: input.trim(),
      date: validationResults.date,
      business: validationResults.business,
      location: validationResults.location,
      validation_status: validationState
    };

    try {
      await onSubmit(todoData);
      if (!editingTodo) {
        resetForm();
      }
    } catch (err) {
      setError('Failed to save todo. Please try again.');
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setInput(suggestion.text);
    setValidationResults(suggestion.parsed);
    setValidationState('valid');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleModifyOriginal = () => {
    setShowSuggestions(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const getValidationIcon = () => {
    switch (validationState) {
      case 'loading': return '🔄';
      case 'valid': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '💭';
    }
  };

  const getValidationMessage = () => {
    switch (validationState) {
      case 'loading': return 'Analyzing your todo...';
      case 'valid': return 'Todo looks great!';
      case 'warning': return 'Found some issues, but we have suggestions';
      case 'error': return 'Unable to process this todo';
      default: return 'Start typing your todo in natural language...';
    }
  };

  return (
    <div className="smart-todo-creator">
      <div className="creator-header">
        <h2>{editingTodo ? 'Edit Todo' : 'Create a New Todo'}</h2>
        <p className="creator-subtitle">
          Describe what you want to do in natural language. I'll help you organize it!
        </p>
      </div>

      <div className="input-section">
        <div className="textarea-container">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Try something like: 'Buy cake from Grafs Pastry tomorrow at 3pm' or 'Pick up dry cleaning this Friday'"
            className={`smart-textarea ${validationState}`}
            rows="4"
            aria-label="Todo description in natural language"
            aria-describedby="validation-status"
          />
          
          <div className="validation-indicator" id="validation-status" role="status" aria-live="polite">
            <span className="validation-icon">{getValidationIcon()}</span>
            <span className="validation-message">{getValidationMessage()}</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      {validationResults && (
        <ValidationPanel 
          results={validationResults}
          status={validationState}
          validationIssues={validationIssues}
        />
      )}

      {showSuggestions && suggestions.length > 0 && (
        <SuggestionsInterface
          suggestions={suggestions}
          onSelectSuggestion={handleSuggestionSelect}
          onModifyOriginal={handleModifyOriginal}
          validationResults={validationResults}
          reasoning={suggestionsReasoning}
        />
      )}

      <div className="creator-actions">
        {input.trim() && validationState === 'idle' && (
          <button 
            onClick={handleValidate}
            className="btn btn-secondary"
            disabled={validationState === 'loading'}
          >
            🔍 Analyze Todo
          </button>
        )}
        
        <button 
          onClick={handleSubmit}
          className="btn btn-primary btn-large"
          disabled={validationState === 'loading' || !input.trim()}
        >
          {editingTodo ? 'Update Todo' : 'Create Todo'}
        </button>
        
        {editingTodo && (
          <button 
            onClick={() => {
              resetForm();
              onCancel();
            }}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        )}

        {!editingTodo && input && (
          <button 
            onClick={resetForm}
            className="btn btn-ghost"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default SmartTodoCreator;