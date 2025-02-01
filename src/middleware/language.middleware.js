const languageMiddleware = (req, res, next) => {
    const lang = req.query.lang || 'en';
    const supportedLanguages = ['en', 'hi', 'bn', 'es'];
    
    req.lang = supportedLanguages.includes(lang) ? lang : 'en';
    next();
  };
  
  module.exports = languageMiddleware;