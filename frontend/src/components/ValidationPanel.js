import React from 'react';

const ValidationPanel = ({ results, status, validationIssues = [] }) => {
  if (!results) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      // Handle YYYY-MM-DD format explicitly to avoid timezone issues
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } else {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'valid':
        return { icon: '✅', text: 'Validated', className: 'status-valid' };
      case 'warning':
        return { icon: '⚠️', text: 'Needs Review', className: 'status-warning' };
      case 'error':
        return { icon: '❌', text: 'Issues Found', className: 'status-error' };
      default:
        return { icon: '⏳', text: 'Processing', className: 'status-processing' };
    }
  };

  const statusBadge = getStatusBadge(status);

  return (
    <div className="validation-panel">
      <div className="panel-header">
        <h3>Parsed Information</h3>
        <span className={`status-badge ${statusBadge.className}`}>
          <span className="status-icon">{statusBadge.icon}</span>
          {statusBadge.text}
        </span>
      </div>

      <div className="validation-content">
        {validationIssues.length > 0 && (
          <div className="validation-issues-section">
            <h4 className="issues-header">
              <span className="issues-icon">⚠️</span>
              Why Review is Needed
            </h4>
            <div className="issues-list">
              {validationIssues.map((issue, index) => (
                <div key={index} className="issue-item">
                  <div className="issue-type">
                    <span className="issue-type-icon">
                      {issue.type === 'business_hours' ? '🕒' : 
                       issue.type === 'date' ? '📅' : 
                       issue.type === 'location' ? '📍' : '⚠️'}
                    </span>
                    <span className="issue-type-label">
                      {issue.type === 'business_hours' ? 'Business Hours' : 
                       issue.type === 'date' ? 'Date Issue' : 
                       issue.type === 'location' ? 'Location Issue' : issue.type}
                    </span>
                  </div>
                  <div className="issue-message">{issue.message}</div>
                  {issue.suggestions && issue.suggestions.length > 0 && (
                    <div className="issue-suggestions">
                      <span className="suggestions-label">💡 Quick fixes:</span>
                      <ul className="suggestions-list">
                        {issue.suggestions.map((suggestion, sugIndex) => (
                          <li key={sugIndex}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="validation-grid">
          {results.task && (
            <div className="validation-item">
              <div className="item-icon">✅</div>
              <div className="item-content">
                <label>Task</label>
                <value>{results.task}</value>
              </div>
            </div>
          )}

          {results.description && (
            <div className="validation-item">
              <div className="item-icon">📝</div>
              <div className="item-content">
                <label>Description</label>
                <value>{results.description}</value>
              </div>
            </div>
          )}

          {results.date && (
            <div className="validation-item">
              <div className="item-icon">📅</div>
              <div className="item-content">
                <label>Date</label>
                <value>{formatDate(results.date)}</value>
              </div>
            </div>
          )}

          {results.category && (
            <div className="validation-item">
              <div className="item-icon">🏷️</div>
              <div className="item-content">
                <label>Category</label>
                <value>
                  <span className={`category-tag category-${results.category.toLowerCase()}`}>
                    {results.category}
                  </span>
                </value>
              </div>
            </div>
          )}

          {results.business && (
            <div className="validation-item">
              <div className="item-icon">🏪</div>
              <div className="item-content">
                <label>Business</label>
                <value>
                  <div className="business-info">
                    <div className="business-name">{results.business.name}</div>
                    {results.business.hours && (
                      <div className="business-hours">
                        Hours: {results.business.hours}
                      </div>
                    )}
                    {results.business.phone && (
                      <div className="business-phone">
                        📞 {results.business.phone}
                      </div>
                    )}
                  </div>
                </value>
              </div>
            </div>
          )}

          {results.location && (
            <div className="validation-item">
              <div className="item-icon">📍</div>
              <div className="item-content">
                <label>Location</label>
                <value>
                  <div className="location-info">
                    {results.location.address ? (
                      <div className="location-address">{results.location.address}</div>
                    ) : (
                      <div className="location-city">{results.location}</div>
                    )}
                    {results.location.distance && (
                      <div className="location-distance">
                        📏 {results.location.distance}
                      </div>
                    )}
                  </div>
                </value>
              </div>
            </div>
          )}

          {results.warnings && results.warnings.length > 0 && (
            <div className="validation-item validation-warnings">
              <div className="item-icon">⚠️</div>
              <div className="item-content">
                <label>Warnings</label>
                <value>
                  <ul className="warning-list">
                    {results.warnings.map((warning, index) => (
                      <li key={index} className="warning-item">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </value>
              </div>
            </div>
          )}
        </div>

        {status === 'valid' && (
          <div className="validation-summary">
            <div className="success-message">
              <span className="success-icon">🎉</span>
              All information looks good! Ready to create your todo.
            </div>
          </div>
        )}

        {status === 'warning' && (
          <div className="validation-summary">
            <div className="warning-message">
              <span className="warning-icon">💡</span>
              We found some potential issues. Check our suggestions below!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationPanel;