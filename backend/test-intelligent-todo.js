const TodoValidationService = require('./services/todoValidation');

async function testIntelligentTodo() {
  console.log('Testing Intelligent Todo System...\n');
  
  // Test cases
  const testCases = [
    "buy a cake Friday 09/05 from Grafs Pastry in Farmington Hills, MI",
    "schedule dentist appointment next Tuesday at 2 PM",
    "pick up dry cleaning from Main Street Cleaners downtown",
    "buy groceries from Walmart on Saturday morning",
  ];

  const validationService = new TodoValidationService();

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n=== Test Case ${i + 1} ===`);
    console.log(`Input: "${testCase}"`);
    console.log('---');

    try {
      // This will fail without actual API keys, but shows the structure
      const result = await validationService.validateTodo(testCase);
      
      console.log('✅ Validation successful!');
      console.log('Parsed Data:', JSON.stringify(result.parsedData, null, 2));
      console.log('Validation Status:', result.validationStatus);
      
      if (result.businessInfo) {
        console.log('Business Info:', JSON.stringify(result.businessInfo, null, 2));
      }
      
      if (result.validationIssues && result.validationIssues.length > 0) {
        console.log('Issues Found:', result.validationIssues.length);
        result.validationIssues.forEach((issue, idx) => {
          console.log(`  ${idx + 1}. ${issue.type}: ${issue.message}`);
        });
      }
      
    } catch (error) {
      console.log('❌ Test failed (expected without API keys):');
      console.log('Error:', error.message);
      
      // Show what the structure would look like
      console.log('\n📋 Expected structure:');
      console.log({
        originalText: testCase,
        parsedData: {
          task: "extracted task",
          date: "2025-09-05",
          business_name: "business if mentioned",
          location: "location if mentioned"
        },
        validationStatus: "valid|warning|requires_attention",
        businessInfo: {
          name: "business name",
          hours: "business hours",
          status: "found|limited_info|unknown"
        }
      });
    }
  }
  
  console.log('\n=== Test Complete ===');
  console.log('To run with real data, add OPENAI_API_KEY and TAVILY_API_KEY to .env file');
}

if (require.main === module) {
  testIntelligentTodo().catch(console.error);
}

module.exports = testIntelligentTodo;