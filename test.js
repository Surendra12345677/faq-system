const axios = require('axios');

async function testFAQ() {
  try {
    // Create FAQ
    const createResponse = await axios.post('http://localhost:3000/api/faqs/', {
      question: "What is Node.js?",
      answer: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine."
    });
    console.log('Created FAQ:', createResponse.data);

    // Get FAQs
    const getResponse = await axios.get('http://localhost:3000/api/faqs/');
    console.log('FAQs:', getResponse.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testFAQ();