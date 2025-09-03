const OpenAIService = require('./openai');
const TavilyService = require('./tavily');

class TodoValidationService {
  constructor() {
    this.openaiService = new OpenAIService();
    this.tavilyService = new TavilyService();
  }

  async validateTodo(originalText) {
    try {
      const parsedData = await this.openaiService.parseTodoText(originalText);
      
      let businessInfo = null;
      let validationStatus = 'valid';
      let validationIssues = [];

      if (parsedData.business_name && parsedData.location) {
        businessInfo = await this.tavilyService.searchBusiness(
          parsedData.business_name, 
          parsedData.location
        );

        if (parsedData.date) {
          const hoursValidation = await this.tavilyService.validateBusinessHours(
            businessInfo, 
            parsedData.date
          );
          
          if (!hoursValidation.isValid) {
            validationStatus = 'requires_attention';
            validationIssues.push({
              type: 'business_hours',
              message: hoursValidation.reason,
              suggestions: hoursValidation.suggestions
            });
          }
        }

        if (businessInfo.status === 'unknown') {
          validationStatus = validationStatus === 'valid' ? 'warning' : validationStatus;
          validationIssues.push({
            type: 'business_info',
            message: 'Could not find detailed business information',
            suggestions: ['Verify business name and location', 'Contact business directly']
          });
        }
      }

      if (parsedData.date) {
        const dateValidation = this.validateDate(parsedData.date);
        if (!dateValidation.isValid) {
          validationStatus = 'warning';
          validationIssues.push({
            type: 'date',
            message: dateValidation.reason,
            suggestions: dateValidation.suggestions
          });
        }
      }

      let suggestedAlternatives = null;
      if (validationIssues.length > 0) {
        suggestedAlternatives = await this.openaiService.generateSuggestions(
          parsedData, 
          businessInfo, 
          validationIssues
        );
      }

      return {
        originalText,
        parsedData,
        validationStatus,
        businessInfo,
        suggestedAlternatives,
        validationIssues,
        scheduledDatetime: this.combineDateAndTime(parsedData.date, parsedData.time),
        locationData: this.extractLocationData(parsedData, businessInfo)
      };
    } catch (error) {
      console.error('Error validating todo:', error);
      throw error;
    }
  }

  validateDate(dateString) {
    try {
      const inputDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(inputDate.getTime())) {
        return {
          isValid: false,
          reason: 'Invalid date format',
          suggestions: ['Use format YYYY-MM-DD', 'Specify a clear date']
        };
      }

      if (inputDate < today) {
        return {
          isValid: false,
          reason: 'Date is in the past',
          suggestions: ['Choose a future date', 'Update the date to today or later']
        };
      }

      return {
        isValid: true,
        reason: 'Date is valid'
      };
    } catch (error) {
      return {
        isValid: false,
        reason: 'Error validating date',
        suggestions: ['Provide a valid date']
      };
    }
  }

  combineDateAndTime(date, time) {
    if (!date) return null;
    
    try {
      if (time) {
        return new Date(`${date}T${time}`);
      } else {
        return new Date(date);
      }
    } catch (error) {
      return new Date(date);
    }
  }

  extractLocationData(parsedData, businessInfo) {
    const locationData = {
      query: parsedData.location,
      address: businessInfo?.address,
      coordinates: null 
    };

    return locationData;
  }

  async generateAlternatives(todoId, parsedData, businessInfo, validationIssues) {
    try {
      let alternatives = [];

      if (businessInfo && parsedData.business_name && parsedData.location) {
        const nearbyBusinesses = await this.tavilyService.searchNearbyBusinesses(
          parsedData.business_type || 'business',
          parsedData.location,
          3
        );

        if (nearbyBusinesses.length > 0) {
          alternatives.push({
            type: 'alternative_businesses',
            title: 'Try nearby businesses',
            options: nearbyBusinesses.map(business => ({
              name: business.name,
              description: business.description,
              action: 'replace_business'
            }))
          });
        }
      }

      if (validationIssues.some(issue => issue.type === 'business_hours')) {
        alternatives.push({
          type: 'alternative_dates',
          title: 'Try different dates',
          options: this.generateDateAlternatives(parsedData.date).map(date => ({
            date: date,
            description: `${new Date(date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}`,
            action: 'update_date'
          }))
        });
      }

      return alternatives;
    } catch (error) {
      console.error('Error generating alternatives:', error);
      return [];
    }
  }

  generateDateAlternatives(originalDate) {
    if (!originalDate) return [];
    
    const baseDate = new Date(originalDate);
    const alternatives = [];
    
    for (let i = 1; i <= 7; i++) {
      const altDate = new Date(baseDate);
      altDate.setDate(baseDate.getDate() + i);
      alternatives.push(altDate.toISOString().split('T')[0]);
    }
    
    return alternatives.slice(0, 3); 
  }
}

module.exports = TodoValidationService;