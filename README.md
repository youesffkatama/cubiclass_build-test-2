# Scholar.AI - AI-Powered Academic Workspace

Scholar.AI is an enterprise-grade study assistant with RAG (Retrieval-Augmented Generation) capabilities, real-time collaboration, gamification, and advanced PDF intelligence.

## 🚀 Features

- **PDF Intelligence**: Upload PDFs up to 50MB with OCR fallback
- **RAG Chat System**: Context-aware Q&A with streaming responses
- **Gamification**: XP system with level progression and achievements
- **Analytics**: Study performance tracking and insights
- **Classroom Features**: Create/join classes with streams and assignments
- **Study Tools**: AI-generated flashcards, quizzes, and study plans
- **Real-time Updates**: Live activity feeds and notifications

## 🛠️ Tech Stack

**Backend:**
- Node.js 20+ with Express.js
- MongoDB Atlas with Vector Search
- Redis for caching and BullMQ for job queues
- OpenRouter API for LLM integration
- Local embeddings using @xenova/transformers

**Frontend:**
- Vanilla JavaScript (modular architecture)
- HTML5 + CSS3 with advanced animations
- Chart.js for analytics
- PDF.js for document rendering

## 📋 Prerequisites

- Node.js 20+
- MongoDB Atlas account
- Redis server
- OpenRouter API key

## 🚀 Quick Start

### Local Development

1. **Clone and Install Dependencies**
```bash
npm install
```

2. **Set up Environment Variables**
```bash
cp .env.example .env
# Edit .env with your actual values (MongoDB URI, OpenRouter API key, etc.)
```

3. **Start Redis Server**
```bash
# On macOS
brew install redis
brew services start redis

# On Linux
sudo apt install redis-server
sudo systemctl start redis

# Or use Docker
docker run -d -p 6379:6379 --name scholar-redis redis:7-alpine
```

4. **Run the Application**
```bash
# Terminal 1: Start the main server
npm run dev

# Terminal 2: Start the PDF processing worker
npm run worker
```

5. **Open the Application**
- Frontend: Open `public/index.html` in your browser
- Or serve with live-server: `npx live-server public/`

### Production Deployment

#### Deploy to Koyeb (Recommended)

For production deployment, we recommend using Koyeb. See [DEPLOY_KOYEB.md](DEPLOY_KOYEB.md) for detailed instructions.

Quick deployment command:
```bash
# Set your environment variables
export MONGODB_URI=your_mongodb_uri
export REDIS_HOST=your_redis_host
export REDIS_PORT=your_redis_port
export REDIS_PASSWORD=your_redis_password
export JWT_SECRET=your_jwt_secret
export JWT_REFRESH_SECRET=your_refresh_secret
export OPENROUTER_API_KEY=your_openrouter_key

# Run the deployment script
./deploy-koyeb.sh
```

#### Alternative: Using Docker Compose
```bash
# This will start the app, worker, MongoDB, and Redis
docker-compose up --build
```

## 📁 Project Structure

```
server/
├── config/           # Environment config and DB connection
├── models/           # Mongoose schemas
├── services/         # Business logic
├── controllers/      # Route handlers
├── routes/           # API routes
├── middleware/       # Authentication, validation, etc.
├── workers/          # Background job processors
└── server.js         # Main entry point

public/
├── index.html        # Main SPA
├── style.css         # Advanced CSS styles
└── script.js         # Modular JavaScript architecture
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/scholarai?retryWrites=true&w=majority

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

## 🗄️ MongoDB Setup

1. Create a MongoDB Atlas account
2. Create a cluster (M0 free tier works for development)
3. Add your IP to the whitelist (0.0.0.0/0 for development)
4. Create the vector search index manually:

```javascript
// Run this in MongoDB Atlas:
db.vectorchunks.createSearchIndex({
  name: "vector_index",
  type: "vectorSearch",
  definition: {
    fields: [{
      type: "vector",
      path: "embedding",
      numDimensions: 384,
      similarity: "cosine"
    }]
  }
});
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
# Terminal 1: Start the main server
npm run dev

# Terminal 2: Start the PDF processing worker
npm run worker
```

### Production Mode
```bash
npm start
```

## 🧪 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Workspace
- `POST /api/v1/workspace/upload` - Upload PDF
- `GET /api/v1/workspace/files` - List files
- `GET /api/v1/workspace/files/:id/status` - Check processing status

### Intelligence
- `POST /api/v1/intelligence/chat/stream` - Stream chat with RAG
- `POST /api/v1/intelligence/flashcards` - Generate flashcards
- `POST /api/v1/intelligence/quiz` - Generate quiz

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard data
- `GET /api/v1/analytics/performance` - Performance metrics

### Classes
- `POST /api/v1/classes` - Create class
- `GET /api/v1/classes` - List classes
- `POST /api/v1/classes/:id/join` - Join class

## 🎮 Gamification System

- **XP Awards**: Login (+0 XP), Upload PDF (+50 XP), Chat Message (+2 XP), Complete Task (+10 XP)
- **Level Calculation**: `level = floor(sqrt(xp / 100)) + 1`
- **Rank Tiers**: Novice → Scholar → Researcher → Professor → Nobel
- **Streak Tracking**: Daily login streaks

## 🔧 Development Tips

1. **PDF Processing**: Large files may take time to process. Monitor the worker logs.
2. **Vector Search**: Ensure the MongoDB vector index is properly configured.
3. **Rate Limiting**: API endpoints have rate limits to prevent abuse.
4. **CORS**: Configure origins properly for production deployment.

## 🚀 Deployment

1. Set `NODE_ENV=production` in your environment
2. Use strong JWT secrets (min 32 chars)
3. Enable IP whitelisting for MongoDB
4. Configure proper CORS origins
5. Set up SSL with Let's Encrypt
6. Use a process manager like PM2 for production

## 🐛 Troubleshooting

- **MongoDB Vector Search Not Working**: Ensure index name is exactly `vector_index`, dimensions=384, similarity=cosine
- **PDF Processing Timeout**: Increase worker timeout, process in smaller batches
- **CORS Errors**: Add origin to whitelist in server configuration
- **Rate Limiting Issues**: Adjust limits in middleware configuration

## 📚 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

If you encounter any issues or have questions, please open an issue in the repository.