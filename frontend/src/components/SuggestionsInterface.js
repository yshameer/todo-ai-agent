import React from 'react';

const SuggestionsInterface = ({ 
  suggestions, 
  onSelectSuggestion, 
  onModifyOriginal, 
  validationResults,
  reasoning = ''
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  const formatSuggestionPreview = (suggestion) => {
    const parts = [];
    
    if (suggestion.parsed?.task) {
      parts.push(`📝 ${suggestion.parsed.task}`);
    }
    
    if (suggestion.parsed?.date) {
      const date = new Date(suggestion.parsed.date);
      parts.push(`📅 ${date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })}`);
    }
    
    if (suggestion.parsed?.business?.name) {
      parts.push(`🏪 ${suggestion.parsed.business.name}`);
    }
    
    return parts.join(' • ');
  };

  const getReasonColor = (reason) => {
    if (reason.includes('closed') || reason.includes('unavailable')) return 'reason-error';
    if (reason.includes('hours') || reason.includes('time')) return 'reason-warning';
    if (reason.includes('nearby') || reason.includes('alternative')) return 'reason-info';
    return 'reason-default';
  };

  return (
    <div className="suggestions-interface">
      <div className="suggestions-header">
        <h3>
          <span className="suggestions-icon">💡</span>
          Smart Suggestions
        </h3>
        <p className="suggestions-subtitle">
          We found some potential improvements for your todo. Choose an option below:
        </p>
        {reasoning && (
          <div className="suggestions-reasoning">
            <div className="reasoning-header">
              <span className="reasoning-icon">🧠</span>
              Why we suggest changes:
            </div>
            <div className="reasoning-text">{reasoning}</div>
          </div>
        )}
      </div>

      <div className="suggestions-content">
        <div className="original-option">
          <div className="option-header">
            <h4>Keep Original</h4>
            <button 
              onClick={onModifyOriginal}
              className="btn btn-outline"
            >
              Modify Text
            </button>
          </div>
          
          {validationResults?.warnings && (
            <div className="original-warnings">
              {validationResults.warnings.map((warning, index) => (
                <div key={index} className="warning-badge">
                  <span className="warning-icon">⚠️</span>
                  {warning}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="suggestions-divider">
          <span className="divider-text">or choose a suggestion</span>
        </div>

        <div className="recommendations-grid">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="recommendation-card">
              <div className="recommendation-header">
                <div className="recommendation-type">
                  <span className="type-icon">
                    {suggestion.type === 'business_hours' ? '🕒' : 
                     suggestion.type === 'date' ? '📅' : 
                     suggestion.type === 'location' ? '📍' : '💡'}
                  </span>
                  <span className="type-label">
                    {suggestion.type === 'business_hours' ? 'Business Hours' : 
                     suggestion.type === 'date' ? 'Date Recommendation' : 
                     suggestion.type === 'location' ? 'Location Suggestion' : 
                     suggestion.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              </div>

              <div className="recommendation-content">
                <div className="recommendation-description">
                  {suggestion.description}
                </div>
                
                <div className="recommendation-action">
                  <span className="action-icon">👉</span>
                  <span className="action-text">{suggestion.action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {suggestions.length === 0 && (
          <div className="no-suggestions">
            <div className="no-suggestions-icon">🤔</div>
            <p>No alternative suggestions available at the moment.</p>
            <button onClick={onModifyOriginal} className="btn btn-primary">
              Modify Your Original Todo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsInterface;