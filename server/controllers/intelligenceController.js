// server/controllers/intelligenceController.js
const KnowledgeNode = require('../models/KnowledgeNode');
const VectorChunk = require('../models/VectorChunk');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const OpenAI = require('openai');
const { pipeline, env } = require('@xenova/transformers');
const config = require('../config');

// Disable warning
env.allowLocalModels = false;

// Initialize OpenAI client
const openai = new OpenAI({
  baseURL: config.openrouter.baseUrl,
  apiKey: config.openrouter.apiKey,
  defaultHeaders: {
    "HTTP-Referer": "https://scholar.ai",
    "X-Title": "Scholar.AI"
  }
});

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

const streamChat = async (req, res) => {
  try {
    const { query, nodeId, conversationId, model } = req.body;
    const userId = req.userId;

    // Validate input
    if (!query || query.length < 1 || query.length > 5000) {
      return res.status(400).json({
        success: false,
        error: { message: 'Query must be between 1 and 5000 characters' }
      });
    }

    // Set response headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation || conversation.userId.toString() !== userId) {
        return res.status(404).json({
          success: false,
          error: { message: 'Conversation not found' }
        });
      }
    } else {
      conversation = new Conversation({
        userId: userId,
        nodeId: nodeId || null,
        title: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
        model: model || 'mistralai/mistral-7b-instruct:free'
      });
      await conversation.save();
    }

    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: query
    });

    // Perform vector search if nodeId is provided
    let context = '';
    let citations = [];

    if (nodeId) {
      const knowledgeNode = await KnowledgeNode.findById(nodeId);
      if (!knowledgeNode) {
        return res.status(404).json({
          success: false,
          error: { message: 'Knowledge node not found' }
        });
      }

      // Generate embedding for query
      const extractor = await initializeExtractor();
      const queryEmbedding = await extractor(query, {
        pooling: 'mean',
        normalize: true
      });

      // Perform vector search
      // Note: In a real implementation, we would use MongoDB's $vectorSearch here
      // For this demo, we'll simulate the search by finding similar chunks
      
      // For now, we'll get all chunks for this node and calculate similarity manually
      const chunks = await VectorChunk.find({ nodeId: nodeId });
      
      // Calculate cosine similarity (simplified)
      const similarities = chunks.map(chunk => {
        const dotProduct = chunk.embedding.reduce((sum, val, idx) => sum + val * queryEmbedding.data[idx], 0);
        return { chunk, similarity: dotProduct };
      });
      
      // Sort by similarity and take top 5
      similarities.sort((a, b) => b.similarity - a.similarity);
      const topChunks = similarities.slice(0, 5).map(item => item.chunk);
      
      // Build context from top chunks
      context = topChunks.map(chunk => chunk.content).join('\n\n');
      citations = topChunks.map(chunk => chunk._id);
    }

    // Prepare system message with persona if available
    let systemMessage = 'You are a helpful AI assistant. Answer questions accurately and provide insights.';
    
    if (nodeId) {
      const knowledgeNode = await KnowledgeNode.findById(nodeId);
      if (knowledgeNode && knowledgeNode.persona) {
        systemMessage = `You are ${knowledgeNode.persona.generatedName}. ${knowledgeNode.persona.personalityPrompt}. Use only the context provided.`;
      }
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemMessage },
      ...(context ? [{ role: 'system', content: `Context:\n${context}` }] : []),
      { role: 'user', content: query }
    ];

    // Create stream from OpenAI
    const stream = await openai.chat.completions.create({
      model: model || 'mistralai/mistral-7b-instruct:free',
      messages: messages,
      stream: true
    });

    let fullResponse = '';

    // Send chunks as they arrive
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        
        // Send chunk as SSE event
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Add assistant message to conversation
    conversation.messages.push({
      role: 'assistant',
      content: fullResponse,
      citations: citations
    });

    await conversation.save();

    // Send completion event
    res.write(`data: ${JSON.stringify({ done: true, conversationId: conversation._id, citations })}\n\n`);
    
    // Close the stream
    res.end();
  } catch (error) {
    console.error('Stream chat error:', error);
    
    // Send error as SSE event
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.userId;
    const { nodeId } = req.query;

    let filter = { userId };
    if (nodeId) {
      filter.nodeId = nodeId;
    }

    const conversations = await Conversation.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const generateFlashcards = async (req, res) => {
  try {
    const { nodeId, count } = req.body;
    const userId = req.userId;

    // Validate input
    if (!nodeId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Node ID is required' }
      });
    }

    const requestedCount = Math.min(count || 10, 50); // Max 50 flashcards

    // Get the knowledge node
    const knowledgeNode = await KnowledgeNode.findById(nodeId);
    if (!knowledgeNode) {
      return res.status(404).json({
        success: false,
        error: { message: 'Knowledge node not found' }
      });
    }

    // Get relevant chunks for flashcard generation
    const chunks = await VectorChunk.find({ nodeId: nodeId }).limit(10);
    const context = chunks.map(chunk => chunk.content).join('\n\n');

    // Generate flashcards using OpenAI
    const prompt = `Generate ${requestedCount} flashcards from the following text. Return ONLY valid JSON in this format:
    [
      {"question": "Question text", "answer": "Answer text"},
      ...
    ]

    Text: ${context.substring(0, 3000)}`;

    const response = await openai.chat.completions.create({
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });

    let flashcards = [];
    try {
      // Extract JSON from response
      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```|```([\s\S]*?)```|(\[[\s\S]*\])/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2] || jsonMatch[3]) : content;
      flashcards = JSON.parse(jsonString);
    } catch (parseError) {
      // If JSON parsing fails, create simple flashcards from key points
      const keyPoints = knowledgeNode.keyPoints || [];
      flashcards = keyPoints.slice(0, requestedCount).map(point => ({
        question: `What is the main idea of: "${point.substring(0, 50)}..."?`,
        answer: point
      }));
    }

    res.status(200).json({
      success: true,
      data: { flashcards }
    });
  } catch (error) {
    console.error('Generate flashcards error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const generateQuiz = async (req, res) => {
  try {
    const { nodeId, count } = req.body;
    const userId = req.userId;

    // Validate input
    if (!nodeId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Node ID is required' }
      });
    }

    const requestedCount = Math.min(count || 5, 20); // Max 20 questions

    // Get the knowledge node
    const knowledgeNode = await KnowledgeNode.findById(nodeId);
    if (!knowledgeNode) {
      return res.status(404).json({
        success: false,
        error: { message: 'Knowledge node not found' }
      });
    }

    // Get relevant chunks for quiz generation
    const chunks = await VectorChunk.find({ nodeId: nodeId }).limit(10);
    const context = chunks.map(chunk => chunk.content).join('\n\n');

    // Generate quiz using OpenAI
    const prompt = `Generate ${requestedCount} multiple choice questions from the following text. Return ONLY valid JSON in this format:
    [
      {
        "question": "Question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option A"
      },
      ...
    ]

    Text: ${context.substring(0, 3000)}`;

    const response = await openai.chat.completions.create({
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500
    });

    let quizQuestions = [];
    try {
      // Extract JSON from response
      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```|```([\s\S]*?)```|(\[[\s\S]*\])/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2] || jsonMatch[3]) : content;
      quizQuestions = JSON.parse(jsonString);
    } catch (parseError) {
      // If JSON parsing fails, create simple quiz from key points
      const keyPoints = knowledgeNode.keyPoints || [];
      quizQuestions = keyPoints.slice(0, requestedCount).map((point, idx) => ({
        question: `What is the main concept in: "${point.substring(0, 50)}..."?`,
        options: [
          point,
          `Related to ${point}`,
          `Opposite of ${point}`,
          `Unrelated to ${point}`
        ],
        correctAnswer: point
      }));
    }

    res.status(200).json({
      success: true,
      data: { quizQuestions }
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

module.exports = {
  streamChat,
  getConversations,
  generateFlashcards,
  generateQuiz
};