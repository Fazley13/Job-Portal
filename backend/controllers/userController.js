// backend/controllers/userController.js

// Example: get a user's profile by userId from req.params
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    // Replace with actual model query
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Example: search users by keyword
export const searchUsers = async (req, res) => {
  try {
    const { keyword } = req.query;

    const users = await User.find({
      $or: [
        { firstName: { $regex: keyword, $options: 'i' } },
        { lastName: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } }
      ]
    }).select('-password');

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Example: user stats
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const alumni = await User.countDocuments({ role: 'alumni' });
    const employers = await User.countDocuments({ role: 'employer' });

    res.status(200).json({
      totalUsers,
      students,
      alumni,
      employers
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
