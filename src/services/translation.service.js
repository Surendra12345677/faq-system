const axios = require('axios');
const Redis = require('redis');

const redisClient = Redis.createClient(process.env.REDIS_URL);

class TranslationService {
  static async translate(text, targetLanguage) {
    const cacheKey = `translation:${text}:${targetLanguage}`;
    
    // Check Redis cache first
    const cachedTranslation = await redisClient.get(cacheKey);
    if (cachedTranslation) return cachedTranslation;

    try {
      const response = await axios.post('https://translation.googleapis.com/language/translate/v2', {
        q: text,
        target: targetLanguage
      }, {
        params: {
          key: process.env.GOOGLE_TRANSLATE_API_KEY
        }
      });

      const translatedText = response.data.data.translations[0].translatedText;
      
      // Cache translation
      await redisClient.set(cacheKey, translatedText, 'EX', 24 * 60 * 60);

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    }
  }
}

module.exports = TranslationService;