// server/config/database.js
const mongoose = require('mongoose');
const config = require('./index');

let dbConnection = null;

const connectDB = async () => {
  if (dbConnection && dbConnection.readyState === 1) {
    return dbConnection;
  }

  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    dbConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create vector search index for VectorChunk collection
    try {
      await mongoose.connection.db.collection('vectorchunks').createSearchIndex({
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
      console.log('Vector search index created/updated');
    } catch (indexErr) {
      console.warn('Could not create vector search index:', indexErr.message);
    }

    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB };