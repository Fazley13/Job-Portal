import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in .env!');
    throw new Error('JWT_SECRET not defined');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profile: user.profile
    }
  });
};

const PROFILE_FIELDS = ['avatar', 'bio', 'skills', 'university', 'graduationYear', 'company', 'position', 'location', 'website', 'linkedin', 'github'];
const pickProfile = (src = {}) =>
  PROFILE_FIELDS.reduce((acc, key) => {
    if (src[key] !== undefined) acc[key] = src[key];
    return acc;
  }, {});

// REGISTER
export const register = async (req, res) => {
  console.log('--- Register function started ---');
  try {
    const { firstName, lastName, password } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();
    // Admin accounts can never be self-registered (use `npm run seed:admin`).
    const PUBLIC_ROLES = ['student', 'alumni', 'employer'];
    const role = PUBLIC_ROLES.includes(req.body.role) ? req.body.role : 'student';

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const profile = req.body.profile && typeof req.body.profile === 'object' ? pickProfile(req.body.profile) : undefined;
    const user = await User.create({ firstName, lastName, email, password, role, ...(profile ? { profile } : {}) });
    console.log('New user created:', user._id);

    sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  console.log('--- Login function started ---');
  try {
    const { password } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`Login failed: user not found for "${email}"`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Login failed: incorrect password for "${email}" (password length received: ${String(password).length})`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated. Please contact an administrator.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};

// GET CURRENT USER
export const getMe = async (req, res) => {
  console.log('--- getMe function started ---');
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// UPDATE PROFILE (whitelisted: role, email, password and status can never be changed here)
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, profile } = req.body;
    const $set = {};
    if (typeof firstName === 'string' && firstName.trim()) $set.firstName = firstName.trim();
    if (typeof lastName === 'string' && lastName.trim()) $set.lastName = lastName.trim();
    if (profile && typeof profile === 'object') {
      for (const [key, value] of Object.entries(pickProfile(profile))) {
        $set[`profile.${key}`] = value;
      }
    }
    const user = await User.findByIdAndUpdate(req.user.id, { $set }, { new: true, runValidators: true });
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(400).json({ success: false, message: error.message || 'Could not update profile' });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(req.user.id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword; // hashed by the pre-save hook
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ success: false, message: 'Could not change password' });
  }
};

// LOGOUT
export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};