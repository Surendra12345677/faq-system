const { Translate } = require('@google-cloud/translate').v2;

// Simple translation service 
class TranslationService {
  constructor() {
    // Initialize Google Translate
    this.translator = new Translate({
      key: process.env.GOOGLE_TRANSLATE_API_KEY
    });
    
    // Languages I'm supporting 
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
      // If translation fails
      console.error(`Translation failed: ${err.message}`);
      return text;
    }
  }

  // Batch translate 
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