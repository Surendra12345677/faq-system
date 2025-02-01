const mongoose = require('mongoose');
const translationService = require('../services/translation.service');

const FAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true
  },
  translations: {
    type: Map,
    of: {
      question: String,
      answer: String
    },
    default: {}
  },
  languages: {
    type: [String],
    default: ['en']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

FAQSchema.methods.getTranslatedContent = function(lang = 'en') {
  if (this.translations && this.translations.get(lang)) {
    return this.translations.get(lang);
  }
  return {
    question: this.question,
    answer: this.answer
  };
};

FAQSchema.pre('save', async function(next) {
  if (!this.translations) {
    this.translations = new Map();
  }

  // Auto-translate for supported languages
  const supportedLanguages = ['hi', 'bn', 'es', 'fr'];
  
  for (const lang of supportedLanguages) {
    if (lang !== 'en' && !this.translations.get(lang)) {
      try {
        const translatedQuestion = await translationService.translate(this.question, lang);
        const translatedAnswer = await translationService.translate(this.answer, lang);
        
        this.translations.set(lang, {
          question: translatedQuestion,
          answer: translatedAnswer
        });
      } catch (error) {
        console.error(`Translation failed for ${lang}:`, error);
      }
    }
  }
  
  next();
});

module.exports = mongoose.model('FAQ', FAQSchema);