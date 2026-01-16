// server/controllers/analyticsController.js
const User = require('../models/User');
const KnowledgeNode = require('../models/KnowledgeNode');
const Conversation = require('../models/Conversation');
const ActivityLog = require('../models/ActivityLog');
const Task = require('../models/Task');

const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('dna settings profile');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Get statistics
    const totalFiles = await KnowledgeNode.countDocuments({ userId });
    const totalConversations = await Conversation.countDocuments({ userId });
    const recentActivities = await ActivityLog.countDocuments({ userId });
    const studySessions = await ActivityLog.countDocuments({ 
      userId, 
      type: 'study_session' 
    });

    // Get recent activities
    const recentActivity = await ActivityLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('type description xpGained createdAt');

    const formattedActivity = recentActivity.map(activity => ({
      type: activity.type,
      title: activity.description,
      time: activity.createdAt.getTime(),
      icon: getActivityIcon(activity.type),
      color: getActivityColor(activity.type),
      xpGained: activity.xpGained
    }));

    res.status(200).json({
      success: true,
      data: {
        user: {
          level: user.dna.level,
          xp: user.dna.xp,
          rank: user.dna.rank,
          streakDays: user.dna.streakDays
        },
        stats: {
          totalFiles,
          totalConversations,
          recentActivities,
          studySessions
        },
        recentActivity: formattedActivity
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const getPerformance = async (req, res) => {
  try {
    const userId = req.userId;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get activity counts by day
    const activities = await ActivityLog.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          types: { $push: '$type' }
        }
      }
    ]);

    // Format the data
    const performance = {};
    activities.forEach(activity => {
      const date = activity._id;
      const types = activity.types.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      performance[date] = {
        total: activity.count,
        ...types
      };
    });

    // Fill in missing dates with zeros
    const dateRange = [];
    const currentDate = new Date(startDate);
    while (currentDate <= new Date()) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (!performance[dateStr]) {
        performance[dateStr] = { total: 0 };
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
      success: true,
      data: { performance }
    });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const getSubjectDistribution = async (req, res) => {
  try {
    const userId = req.userId;

    // Get knowledge nodes and count by type
    const nodes = await KnowledgeNode.find({ userId }).select('type');
    
    const distribution = nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: { distribution }
    });
  } catch (error) {
    console.error('Get subject distribution error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

// Helper functions
function getActivityIcon(type) {
  const icons = {
    login: 'fa-sign-in-alt',
    upload: 'fa-file-upload',
    chat: 'fa-comments',
    task_complete: 'fa-tasks',
    achievement: 'fa-trophy',
    study_session: 'fa-book'
  };
  return icons[type] || 'fa-info-circle';
}

function getActivityColor(type) {
  const colors = {
    login: '#00bfff',
    upload: '#00ed64',
    chat: '#bd00ff',
    task_complete: '#ff9800',
    achievement: '#ffd700',
    study_session: '#2196f3'
  };
  return colors[type] || '#9eb3c2';
}

module.exports = {
  getDashboard,
  getPerformance,
  getSubjectDistribution
};