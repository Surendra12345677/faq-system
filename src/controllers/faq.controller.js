const FAQ = require('../models/faq.model');
const TranslationService = require('../services/translation.service');
const CacheService = require('../services/cache.service');

class FAQController {
  static async createFAQ(req, res) {
    try {
      const { question, answer } = req.body;
      
      if (!question || !answer) {
        return res.status(400).json({ 
          error: 'Question and answer are required' 
        });
      }

      const faq = new FAQ({ question, answer });
      await faq.save();
      
      res.status(201).json(faq);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllFAQs(req, res) {
    try {
      const { lang = 'en' } = req.query;
      const cacheKey = `faqs:${lang}`;
      
      // Check cache
      const cachedFAQs = await CacheService.get(cacheKey);
      if (cachedFAQs) {
        return res.json(JSON.parse(cachedFAQs));
      }

      const faqs = await FAQ.find();
      const translatedFAQs = await Promise.all(
        faqs.map(async (faq) => {
          if (lang === 'en') {
            return {
              id: faq._id,
              question: faq.question,
              answer: faq.answer
            };
          }

          const translatedQuestion = await TranslationService.translate(
            faq.question, 
            lang
          );
          const translatedAnswer = await TranslationService.translate(
            faq.answer, 
            lang
          );

          return {
            id: faq._id,
            question: translatedQuestion,
            answer: translatedAnswer
          };
        })
      );

      // Cache results
      await CacheService.set(cacheKey, JSON.stringify(translatedFAQs));
      
      res.json(translatedFAQs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateFAQ(req, res) {
    try {
      const { id } = req.params;
      const { question, answer } = req.body;
      
      const faq = await FAQ.findByIdAndUpdate(
        id,
        { question, answer },
        { new: true }
      );
      
      if (!faq) {
        return res.status(404).json({ error: 'FAQ not found' });
      }
      
      res.json(faq);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteFAQ(req, res) {
    try {
      const { id } = req.params;
      const faq = await FAQ.findByIdAndDelete(id);
      
      if (!faq) {
        return res.status(404).json({ error: 'FAQ not found' });
      }
      
      res.json({ message: 'FAQ deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = FAQController;