const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️  OpenAI API key not provided. OpenAI features will be disabled.');
      this.openai = null;
    } else {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async parseTodoText(todoText) {
    if (!this.openai) {
      return {
        task: todoText,
        date: null,
        time: null,
        business_name: null,
        business_type: null,
        location: null,
        urgency: 'medium',
        category: 'Personal'
      };
    }
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that extracts structured data from natural language todo entries. 
            Extract the following information and return ONLY a valid JSON object:
            - task: the main action/task to be performed
            - date: the date if mentioned (format: YYYY-MM-DD)
            - time: the time if mentioned (format: HH:MM)
            - business_name: the name of a business if mentioned
            - business_type: the type of business (bakery, restaurant, store, etc.)
            - location: the address or city mentioned
            - urgency: low/medium/high based on context
            - category: Work/Personal based on context

            If a field is not mentioned or unclear, set it to null.
            Current date context: ${new Date().toISOString().split('T')[0]}`
          },
          {
            role: "user",
            content: todoText
          }
        ],
        temperature: 0.1,
      });

      const responseText = completion.choices[0].message.content.trim();
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', responseText);
        return {
          task: todoText,
          date: null,
          time: null,
          business_name: null,
          business_type: null,
          location: null,
          urgency: 'medium',
          category: 'Personal'
        };
      }
    } catch (error) {
      console.error('Error parsing todo text with OpenAI:', error);
      throw error;
    }
  }

  async generateSuggestions(parsedData, businessInfo, validationIssues) {
    if (!this.openai) {
      return {
        suggestions: [
          {
            type: "general",
            description: "OpenAI service not available. Please review the todo manually.",
            action: "manual_review"
          }
        ],
        reasoning: "OpenAI API not configured"
      };
    }
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that generates practical suggestions for todo items that have validation issues.
            Based on the parsed todo data, business information, and validation issues, provide helpful alternatives.
            Return a JSON object with:
            - suggestions: array of suggestion objects with {type, description, action}
            - reasoning: brief explanation of why the suggestions were made`
          },
          {
            role: "user",
            content: `Parsed Data: ${JSON.stringify(parsedData)}
            Business Info: ${JSON.stringify(businessInfo)}
            Validation Issues: ${JSON.stringify(validationIssues)}
            
            Please provide practical suggestions to resolve these issues.`
          }
        ],
        temperature: 0.3,
      });

      const responseText = completion.choices[0].message.content.trim();
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        return {
          suggestions: [
            {
              type: "general",
              description: "Please review the todo details and try again",
              action: "modify_todo"
            }
          ],
          reasoning: "Unable to generate specific suggestions"
        };
      }
    } catch (error) {
      console.error('Error generating suggestions with OpenAI:', error);
      throw error;
    }
  }
}

module.exports = OpenAIService;