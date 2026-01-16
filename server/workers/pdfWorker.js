// server/workers/pdfWorker.js
const { Worker } = require('bullmq');
const redis = require('redis');
const KnowledgeNode = require('../models/KnowledgeNode');
const VectorChunk = require('../models/VectorChunk');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { pipeline, env } = require('@xenova/transformers');
const config = require('../config');

// Disable warning
env.allowLocalModels = false;

// Initialize Redis client
const redisClient = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password
});

redisClient.connect().catch(console.error);

// Initialize embedding pipeline
let extractor = null;

async function initializeExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'sentence-transformers/all-MiniLM-L6-v2', {
      quantized: true
    });
  }
  return extractor;
}

// Worker to process PDF files
const pdfWorker = new Worker('pdf processing', async (job) => {
  const { nodeId, filePath } = job.data;
  
  try {
    console.log(`Processing PDF: ${filePath} for node: ${nodeId}`);
    
    // Update status to processing
    await KnowledgeNode.findByIdAndUpdate(nodeId, {
      status: 'PROCESSING',
      'meta.statusMessage': 'Starting PDF processing...'
    });

    // Parse PDF
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    const text = pdfData.text;
    const pageCount = pdfData.numpages || 1;
    
    // Update metadata
    await KnowledgeNode.findByIdAndUpdate(nodeId, {
      'meta.pageCount': pageCount,
      'meta.wordCount': text.split(/\s+/).length,
      'meta.language': 'en', // Could be detected with additional library
      'meta.progress': 10,
      'meta.statusMessage': 'Extracted text from PDF'
    });

    // Chunk text (500 chars with 100 char overlap)
    const chunks = [];
    let pos = 0;
    const chunkSize = 500;
    const overlap = 100;
    
    while (pos < text.length) {
      const endPos = Math.min(pos + chunkSize, text.length);
      chunks.push({
        content: text.substring(pos, endPos),
        startIndex: pos,
        endIndex: endPos
      });
      pos += (chunkSize - overlap);
    }

    console.log(`Created ${chunks.length} chunks`);

    // Update progress
    await KnowledgeNode.findByIdAndUpdate(nodeId, {
      'meta.progress': 20,
      'meta.statusMessage': `Created ${chunks.length} chunks`
    });

    // Process chunks in batches for embeddings
    const extractor = await initializeExtractor();
    
    for (let i = 0; i < chunks.length; i += 10) {
      const batch = chunks.slice(i, i + 10);
      
      // Generate embeddings for batch
      const texts = batch.map(chunk => chunk.content);
      const embeddings = await extractor(texts, {
        pooling: 'mean',
        normalize: true
      });
      
      // Save vector chunks
      const vectorChunks = batch.map((chunk, idx) => {
        const pageNumber = Math.floor(chunk.startIndex / 2000) + 1; // Approximate page calculation
        return {
          nodeId: nodeId,
          content: chunk.content,
          embedding: Array.from(embeddings[idx].data),
          location: {
            pageNumber: pageNumber,
            chunkIndex: i + idx
          },
          metadata: {
            wordCount: chunk.content.split(/\s+/).length,
            language: 'en'
          }
        };
      });
      
      await VectorChunk.insertMany(vectorChunks);
      
      // Update progress
      const progress = 20 + Math.floor(((i + 10) / chunks.length) * 60);
      await KnowledgeNode.findByIdAndUpdate(nodeId, {
        'meta.progress': Math.min(progress, 80),
        'meta.statusMessage': `Processed ${i + 10}/${chunks.length} chunks`
      });
    }

    // Update progress to 90%
    await KnowledgeNode.findByIdAndUpdate(nodeId, {
      'meta.progress': 90,
      'meta.statusMessage': 'Generating AI persona and summary...'
    });

    // Generate AI persona (simulated - in real app would use OpenRouter API)
    const persona = {
      generatedName: `PDF Expert`,
      tone: 'professional',
      personalityPrompt: 'You are an expert in the subject matter of this document. Answer questions accurately and provide insights.',
      avatarUrl: 'https://ui-avatars.com/api/?name=PDF+Expert&background=00bfff&color=fff',
      catchphrase: 'Let me help you understand this document!'
    };

    // Generate summary (first 3 key points from text)
    const sentences = text.substring(0, 2000).split('. ');
    const keyPoints = sentences
      .filter(s => s.trim().length > 20)
      .slice(0, 5)
      .map(s => s.trim() + '.');

    // Update node with persona and summary
    await KnowledgeNode.findByIdAndUpdate(nodeId, {
      persona: persona,
      summary: text.substring(0, 300) + '...',
      keyPoints: keyPoints,
      status: 'INDEXED',
      'meta.progress': 100,
      'meta.statusMessage': 'Processing complete!'
    });

    console.log(`Successfully processed PDF: ${filePath}`);
    return { success: true, nodeId, chunksProcessed: chunks.length };
  } catch (error) {
    console.error(`Error processing PDF ${filePath}:`, error);
    
    // Update status to failed
    await KnowledgeNode.findByIdAndUpdate(nodeId, {
      status: 'FAILED',
      processingError: error.message,
      'meta.statusMessage': `Failed: ${error.message}`
    });
    
    throw error;
  }
}, {
  connection: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password
  },
  concurrency: 2 // Process up to 2 jobs concurrently
});

console.log('PDF processing worker started...');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down PDF worker...');
  await pdfWorker.close();
  await redisClient.quit();
  process.exit(0);
});