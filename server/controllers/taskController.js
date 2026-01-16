// server/controllers/taskController.js
const Task = require('../models/Task');
const Class = require('../models/Class');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const createTask = async (req, res) => {
  try {
    const { classId, title, description, dueDate, priority } = req.body;
    const userId = req.userId;

    // Validate input
    if (!classId || !title) {
      return res.status(400).json({
        success: false,
        error: { message: 'Class ID and title are required' }
      });
    }

    // Check if user is a member of the class
    const classObj = await Class.findOne({
      _id: classId,
      'members.userId': userId
    });

    if (!classObj) {
      return res.status(404).json({
        success: false,
        error: { message: 'Class not found or you are not a member' }
      });
    }

    // Check if user is teacher (to assign tasks to others) or student (to create for self)
    const member = classObj.members.find(m => m.userId.toString() === userId);
    const isTeacher = member.role === 'teacher';

    const task = new Task({
      userId: isTeacher ? userId : userId, // For now, assign to self if student
      classId: classId,
      title,
      description: description || '',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || 'medium',
      assignedBy: isTeacher ? userId : undefined
    });

    await task.save();

    res.status(201).json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const { classId, status } = req.query;

    let filter = { userId };

    if (classId) {
      filter.classId = classId;
    }

    if (status) {
      filter.status = status;
    }

    const tasks = await Task.find(filter)
      .populate('classId', 'name color')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const task = await Task.findOne({
      _id: id,
      userId: userId
    }).populate('classId', 'name color');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { message: 'Task not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, dueDate, priority } = req.body;
    const userId = req.userId;

    const task = await Task.findOne({
      _id: id,
      userId: userId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { message: 'Task not found' }
      });
    }

    // Update fields if provided
    if (status !== undefined) task.status = status;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);
    if (priority !== undefined) task.priority = priority;

    await task.save();

    // If status changed to completed, award XP
    if (status === 'completed' && task.status === 'completed') {
      // Award XP for completing task
      await awardXP(userId, 10, 'Completed task: ' + task.title);
    }

    res.status(200).json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const task = await Task.findOne({
      _id: id,
      userId: userId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { message: 'Task not found' }
      });
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const awardXP = async (userId, amount, reason) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.dna.xp += amount;
    
    const newLevel = Math.floor(Math.sqrt(user.dna.xp / 100)) + 1;
    const leveledUp = newLevel > user.dna.level;
    
    user.dna.level = newLevel;
    user.dna.rank = calculateRank(newLevel);
    await user.save();
    
    await ActivityLog.create({
      userId,
      type: 'achievement',
      description: reason,
      xpGained: amount
    });
    
    return { leveledUp, newLevel, xp: user.dna.xp };
  } catch (error) {
    console.error('Award XP error:', error);
  }
};

function calculateRank(level) {
  if (level >= 50) return 'Nobel';
  if (level >= 30) return 'Professor';
  if (level >= 15) return 'Researcher';
  if (level >= 5) return 'Scholar';
  return 'Novice';
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
};