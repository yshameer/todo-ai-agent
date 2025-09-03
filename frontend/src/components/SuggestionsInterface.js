import React from 'react';

const SuggestionsInterface = ({ 
  suggestions, 
  onSelectSuggestion, 
  onModifyOriginal, 
  validationResults 
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

        <div className="suggestions-grid">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="suggestion-card">
              <div className="suggestion-header">
                <div className="suggestion-title">
                  Option {index + 1}
                  {suggestion.confidence && (
                    <span className="confidence-badge">
                      {Math.round(suggestion.confidence * 100)}% match
                    </span>
                  )}
                </div>
                
                {suggestion.reason && (
                  <div className={`suggestion-reason ${getReasonColor(suggestion.reason)}`}>
                    {suggestion.reason}
                  </div>
                )}
              </div>

              <div className="suggestion-content">
                <div className="suggestion-text">
                  "{suggestion.text}"
                </div>
                
                <div className="suggestion-preview">
                  {formatSuggestionPreview(suggestion)}
                </div>

                {suggestion.parsed?.business && (
                  <div className="business-details">
                    <div className="business-card">
                      <div className="business-header">
                        <span className="business-name">
                          {suggestion.parsed.business.name}
                        </span>
                        {suggestion.parsed.business.rating && (
                          <span className="business-rating">
                            ⭐ {suggestion.parsed.business.rating}
                          </span>
                        )}
                      </div>
                      
                      {suggestion.parsed.business.hours && (
                        <div className="business-hours">
                          🕐 {suggestion.parsed.business.hours}
                        </div>
                      )}
                      
                      {suggestion.parsed.business.phone && (
                        <div className="business-phone">
                          📞 {suggestion.parsed.business.phone}
                        </div>
                      )}
                      
                      {suggestion.parsed.business.distance && (
                        <div className="business-distance">
                          📍 {suggestion.parsed.business.distance}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {suggestion.benefits && (
                  <div className="suggestion-benefits">
                    <h5>Why this is better:</h5>
                    <ul>
                      {suggestion.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="suggestion-actions">
                <button 
                  onClick={() => onSelectSuggestion(suggestion)}
                  className="btn btn-primary btn-suggestion"
                >
                  Use This Option
                </button>
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