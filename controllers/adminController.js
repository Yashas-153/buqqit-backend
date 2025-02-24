// controllers/adminController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        user_type: true,
        verified: true,
        created_at: true,
        // Exclude password and tokens for security
      }
    });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        user_type: true,
        verified: true,
        created_at: true,
        // Include any related data if needed
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    // Prevent updating password through this route
    const { password, ...updateData } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        user_type: true,
        verified: true,
        created_at: true,
      }
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error(`Error updating user ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    // Check if trying to delete an admin account
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { user_type: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Optionally prevent deleting other admins
    if (user.user_type === 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete another admin account'
      });
    }

    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting user ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// Dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const verifiedUsers = await prisma.user.count({
      where: { verified: true }
    });
    const adminUsers = await prisma.user.count({ 
      where: { user_type: 'admin' } 
    });
    const regularUsers = await prisma.user.count({ 
      where: { user_type: 'user' } 
    });
    
    // Add any other statistics relevant to your application

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        adminUsers,
        regularUsers,
        verificationRate: `${((verifiedUsers / totalUsers) * 100).toFixed(1)}%`
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// Get settings
exports.getSettings = async (req, res) => {
  try {
    // Implement based on your app's requirements
    // This could fetch from a settings table or config
    res.status(200).json({
      success: true,
      settings: {
        // App settings here
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    // Implement based on your app's requirements
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};
