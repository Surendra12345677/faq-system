# faq-system
Setup

1. Clone and install:
git clone <your-repo>
cd faq-api
npm install
2. Create a .env file:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/faq_db
REDIS_URL=redis://localhost:6379
GOOGLE_CLOUD_PROJECT_ID=your-project-id
3.  With Docker
docker-compose up
4. API Usage
Create a FAQ:
# English (default)
GET /api/faqs

# Hindi
GET /api/faqs?lang=hi

# Bengali
GET /api/faqs?lang=bn
5. Running Tests
npm test
