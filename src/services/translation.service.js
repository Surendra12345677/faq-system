const { Translate } = require('@google-cloud/translate').v2;

// Simple translation service that caches results and handles errors gracefully
class TranslationService {
  constructor() {
    // Initialize Google Translate
    this.translator = new Translate({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_CREDENTIALS
    });
    
    // Languages I'm supporting initially - can add more later
    this.languages = ['en', 'hi', 'bn', 'es'];
  }

  async translate(text, lang) {
    // Don't translate if it's English or empty
    if (!text || lang === 'en') {
      return text;
    }

    try {
      const [result] = await this.translator.translate(text, {
        from: 'en',
        to: lang
      });
      
      return result;
    } catch (err) {
      // If translation fails, return original text instead of breaking
      console.error(`Translation failed: ${err.message}`);
      return text;
    }
  }

  // Batch translate to save API calls
  async translateMany(texts, lang) {
    if (!texts.length || lang === 'en') {
      return texts;
    }

    try {
      const [results] = await this.translator.translate(texts, {
        from: 'en',
        to: lang
      });
      
      return Array.isArray(results) ? results : [results];
    } catch (err) {
      console.error(`Batch translation failed: ${err.message}`);
      return texts; // Return originals if translation fails
    }
  }
}

module.exports = new TranslationService();

