const axios = require('axios');

class TavilyService {
  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY;
    this.baseUrl = 'https://api.tavily.com';
    
    if (!this.apiKey) {
      console.warn('⚠️  Tavily API key not provided. Business validation features will be disabled.');
    }
  }

  async searchBusiness(businessName, location) {
    if (!this.apiKey) {
      return {
        name: businessName,
        location: location,
        hours: null,
        contact: null,
        status: 'api_not_configured',
        error: 'Tavily API key not provided'
      };
    }
    
    try {
      const searchQuery = `${businessName} ${location} hours contact information`;
      
      const response = await axios.post(`${this.baseUrl}/search`, {
        api_key: this.apiKey,
        query: searchQuery,
        search_depth: "advanced",
        include_images: false,
        include_answer: true,
        max_results: 5
      });

      const results = response.data.results || [];
      const businessInfo = this.extractBusinessInfo(results, businessName);
      
      return businessInfo;
    } catch (error) {
      console.error('Error searching business with Tavily:', error.message);
      return {
        name: businessName,
        location: location,
        hours: null,
        contact: null,
        status: 'unknown',
        error: 'Failed to fetch business information'
      };
    }
  }

  extractBusinessInfo(results, businessName) {
    const consolidatedInfo = {
      name: businessName,
      hours: null,
      contact: null,
      address: null,
      phone: null,
      status: 'unknown',
      sources: []
    };

    for (const result of results) {
      const content = result.content?.toLowerCase() || '';
      const title = result.title?.toLowerCase() || '';
      
      if (title.includes(businessName.toLowerCase()) || 
          content.includes(businessName.toLowerCase())) {
        
        consolidatedInfo.sources.push({
          title: result.title,
          url: result.url,
          content: result.content?.substring(0, 300)
        });

        const hours = this.extractHours(content);
        if (hours && !consolidatedInfo.hours) {
          consolidatedInfo.hours = hours;
        }

        const phone = this.extractPhone(content);
        if (phone && !consolidatedInfo.phone) {
          consolidatedInfo.phone = phone;
        }

        const address = this.extractAddress(result.content || '');
        if (address && !consolidatedInfo.address) {
          consolidatedInfo.address = address;
        }
      }
    }

    consolidatedInfo.status = consolidatedInfo.hours ? 'found' : 'limited_info';
    
    return consolidatedInfo;
  }

  extractHours(text) {
    const hourPatterns = [
      /(?:hours?:?\s*)?(?:mon|tue|wed|thu|fri|sat|sun)[\s\w]*?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/gi,
      /(?:open|opens?):?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/gi,
      /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/g
    ];

    for (const pattern of hourPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return matches.slice(0, 3).join(', '); 
      }
    }
    
    return null;
  }

  extractPhone(text) {
    const phonePattern = /(?:phone|call|tel|contact):?\s*([(\d\s\-\.)]{10,})/gi;
    const match = text.match(phonePattern);
    if (match) {
      return match[0].replace(/(?:phone|call|tel|contact):?\s*/gi, '').trim();
    }
    
    const directPhonePattern = /\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/;
    const directMatch = text.match(directPhonePattern);
    if (directMatch) {
      return directMatch[0];
    }
    
    return null;
  }

  extractAddress(text) {
    const addressPattern = /\d+\s+[A-Za-z\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)[^,\n]*(?:,\s*[A-Za-z\s]+(?:,\s*[A-Z]{2})?)*/gi;
    const match = text.match(addressPattern);
    if (match && match.length > 0) {
      return match[0].trim();
    }
    return null;
  }

  async validateBusinessHours(businessInfo, scheduledDate) {
    try {
      if (!businessInfo.hours || !scheduledDate) {
        return {
          isValid: false,
          reason: 'Insufficient information to validate hours',
          suggestions: ['Contact the business directly to confirm hours']
        };
      }

      const dayOfWeek = new Date(scheduledDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const hoursText = businessInfo.hours.toLowerCase();
      
      if (hoursText.includes('closed') && hoursText.includes(dayOfWeek.substring(0, 3))) {
        return {
          isValid: false,
          reason: `Business appears to be closed on ${dayOfWeek}`,
          suggestions: [
            'Try a different day',
            'Contact the business to confirm current hours',
            'Look for alternative businesses nearby'
          ]
        };
      }

      return {
        isValid: true,
        reason: 'Business appears to be open',
        suggestions: ['Consider calling ahead to confirm availability']
      };
      
    } catch (error) {
      console.error('Error validating business hours:', error);
      return {
        isValid: false,
        reason: 'Unable to validate business hours',
        suggestions: ['Contact the business directly']
      };
    }
  }

  async searchNearbyBusinesses(businessType, location, maxResults = 5) {
    if (!this.apiKey) {
      return [];
    }
    
    try {
      const searchQuery = `${businessType} near ${location} hours contact`;
      
      const response = await axios.post(`${this.baseUrl}/search`, {
        api_key: this.apiKey,
        query: searchQuery,
        search_depth: "basic",
        include_images: false,
        max_results: maxResults
      });

      const results = response.data.results || [];
      
      return results.map(result => ({
        name: this.extractBusinessName(result.title),
        url: result.url,
        description: result.content?.substring(0, 200),
        source: result.title
      }));
      
    } catch (error) {
      console.error('Error searching nearby businesses:', error);
      return [];
    }
  }

  extractBusinessName(title) {
    return title.split('-')[0].split('|')[0].trim();
  }
}

module.exports = TavilyService;