// server/middleware/validation.js
const { z } = require('zod');

// Auth validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  profile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional()
  }).optional(),
  educationLevel: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long')
});

// Workspace validation schemas
const uploadFileSchema = z.object({
  type: z.enum(['PDF', 'WebUrl', 'Note']),
  name: z.string().min(1).max(255)
});

// Intelligence validation schemas
const chatSchema = z.object({
  query: z.string().min(1).max(5000),
  nodeId: z.string().optional(),
  conversationId: z.string().optional(),
  model: z.string().optional()
});

const generateFlashcardsSchema = z.object({
  nodeId: z.string().min(1),
  count: z.number().min(1).max(50).default(10)
});

// Class validation schemas
const createClassSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.enum(['green', 'blue', 'purple', 'orange']).optional()
});

const joinClassSchema = z.object({
  inviteCode: z.string().length(8).toUpperCase()
});

const createPostSchema = z.object({
  content: z.string().min(1).max(10000)
});

// Task validation schemas
const createTaskSchema = z.object({
  classId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional()
});

const updateTaskSchema = z.object({
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional()
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          error: { 
            message: 'Validation failed',
            details: errors
          }
        });
      }
      
      next(error);
    }
  };
};

module.exports = {
  validate,
  schemas: {
    register: registerSchema,
    login: loginSchema,
    changePassword: changePasswordSchema,
    uploadFile: uploadFileSchema,
    chat: chatSchema,
    generateFlashcards: generateFlashcardsSchema,
    createClass: createClassSchema,
    joinClass: joinClassSchema,
    createPost: createPostSchema,
    createTask: createTaskSchema,
    updateTask: updateTaskSchema
  }
};