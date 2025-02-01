const express = require('express');
const FAQController = require('../controllers/faq.controller');
const languageMiddleware = require('../middleware/language.middleware');

const router = express.Router();

router.post('/', FAQController.createFAQ);
router.get('/', languageMiddleware, FAQController.getAllFAQs);
router.put('/:id', FAQController.updateFAQ);
router.delete('/:id', FAQController.deleteFAQ);

module.exports = router;