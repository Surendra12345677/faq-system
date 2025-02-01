const FAQ = require('../models/faq.model');

class FAQController {
  static async createFAQ(req, res) {
    try {
      const { question, answer } = req.body;
      const faq = new FAQ({ question, answer });
      await faq.save();
      res.status(201).json(faq);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getFAQs(req, res) {
    const { lang = 'en' } = req.query;

    try {
      const faqs = await FAQ.find();
      const translatedFAQs = faqs.map(faq => ({
        id: faq._id,
        ...faq.getTranslatedContent(lang)
      }));

      res.json(translatedFAQs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = FAQController;